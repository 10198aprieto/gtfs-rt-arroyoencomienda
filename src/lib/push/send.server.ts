import { buildPushPayload } from "@block65/webcrypto-web-push";
import { VAPID_PUBLIC_KEY } from "./config";

export interface PushNote { title: string; body: string; url?: string; tag?: string }

interface SubRow {
  id: string; endpoint: string; p256dh: string; auth: string;
  stop_ids: string[]; notify_alerts: boolean; notify_arrivals: boolean;
  arrival_minutes: number; notified: Record<string, number>;
}

async function admin() {
  return (await import("@/lib/admin/supabase-admin.server")).supabaseAdmin as any;
}

async function pushOne(sb: any, s: SubRow, note: PushNote): Promise<boolean> {
  const priv = (process.env["VAPID_PRIVATE_KEY"] || "").trim();
  if (!priv) return false;
  try {
    const payload = await buildPushPayload(
      { data: JSON.stringify(note), options: { ttl: 600, urgency: "high" } as any },
      { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } },
      { subject: "mailto:info@arroyobus.net", publicKey: VAPID_PUBLIC_KEY, privateKey: priv },
    );
    const res = await fetch(s.endpoint, payload as any);
    if (res.status === 404 || res.status === 410) {
      await sb.from("push_subscriptions").delete().eq("id", s.id);
      return false;
    }
    if (!res.ok) console.error("[push] send failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[push] error", (e as Error).message);
    return false;
  }
}

/** Envía a todos los dispositivos que aceptan avisos. Nunca lanza. */
export async function broadcastPush(note: PushNote): Promise<{ sent: number }> {
  try {
    const sb = await admin();
    const { data } = await sb.from("push_subscriptions").select("*").eq("notify_alerts", true).limit(5000);
    const rows = (data || []) as SubRow[];
    let sent = 0;
    for (let i = 0; i < rows.length; i += 25) {
      const r = await Promise.all(rows.slice(i, i + 25).map((s) => pushOne(sb, s, note)));
      sent += r.filter(Boolean).length;
    }
    return { sent };
  } catch (e) {
    console.error("[push] broadcast", (e as Error).message);
    return { sent: 0 };
  }
}

/** Avisa cuando un bus está a pocos minutos de una parada vigilada. */
export async function runArrivalPushTick(): Promise<{ sent: number }> {
  try {
    const sb = await admin();
    const { data } = await sb.from("push_subscriptions").select("*").eq("notify_arrivals", true).neq("stop_ids", "{}").limit(2000);
    const rows = (data || []) as SubRow[];
    if (!rows.length) return { sent: 0 };
    const { fetchAllArrivals } = await import("@/lib/gtfsrt/fetch-arrivals");
    const arrivals = await fetchAllArrivals();
    const now = Math.floor(Date.now() / 1000);
    let sent = 0;
    for (const s of rows) {
      const notified: Record<string, number> = { ...(s.notified || {}) };
      for (const k of Object.keys(notified)) if (notified[k] < now - 7200) delete notified[k];
      let changed = false;
      for (const a of arrivals) {
        if (!s.stop_ids.includes(String(a.stopId))) continue;
        const min = Math.round((a.estimatedArrival - now) / 60);
        if (min < 0 || min > (s.arrival_minutes || 5)) continue;
        const key = `${a.tripId}|${a.stopId}`;
        if (notified[key]) continue;
        notified[key] = now;
        changed = true;
        const ok = await pushOne(sb, s, {
          title: `🚍 ${a.routeName || a.routeId} llega en ${min <= 0 ? "menos de 1" : min} min`,
          body: `${a.stopName}${a.tripHeadsign ? ` · hacia ${a.tripHeadsign}` : ""}`,
          url: "/",
          tag: key,
        });
        if (ok) sent++;
      }
      if (changed) await sb.from("push_subscriptions").update({ notified }).eq("id", s.id);
    }
    return { sent };
  } catch (e) {
    console.error("[push] tick", (e as Error).message);
    return { sent: 0 };
  }
}
