import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./session.server";
import { sendMessage } from "@/lib/telegram/api";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const CAUSES = [
  "UNKNOWN_CAUSE","OTHER_CAUSE","TECHNICAL_PROBLEM","STRIKE","DEMONSTRATION",
  "ACCIDENT","HOLIDAY","WEATHER","MAINTENANCE","CONSTRUCTION","POLICE_ACTIVITY","MEDICAL_EMERGENCY",
] as const;
export const EFFECTS = [
  "UNKNOWN_EFFECT","OTHER_EFFECT","NO_SERVICE","REDUCED_SERVICE","SIGNIFICANT_DELAYS",
  "DETOUR","ADDITIONAL_SERVICE","MODIFIED_SERVICE","STOP_MOVED","NO_EFFECT","ACCESSIBILITY_ISSUE",
] as const;

export const CAUSE_LABELS: Record<string,string> = {
  UNKNOWN_CAUSE:"Causa desconocida", OTHER_CAUSE:"Otra causa", TECHNICAL_PROBLEM:"Problema técnico",
  STRIKE:"Huelga", DEMONSTRATION:"Manifestación", ACCIDENT:"Accidente", HOLIDAY:"Festivo",
  WEATHER:"Condiciones meteorológicas", MAINTENANCE:"Mantenimiento", CONSTRUCTION:"Obras",
  POLICE_ACTIVITY:"Actividad policial", MEDICAL_EMERGENCY:"Emergencia médica",
};
export const EFFECT_LABELS: Record<string,string> = {
  UNKNOWN_EFFECT:"Efecto desconocido", OTHER_EFFECT:"Otro efecto", NO_SERVICE:"Sin servicio",
  REDUCED_SERVICE:"Servicio reducido", SIGNIFICANT_DELAYS:"Retrasos importantes", DETOUR:"Desvío",
  ADDITIONAL_SERVICE:"Servicio adicional", MODIFIED_SERVICE:"Servicio modificado",
  STOP_MOVED:"Traslado de parada", NO_EFFECT:"Sin afectación", ACCESSIBILITY_ISSUE:"Problema de accesibilidad",
};

const createSchema = z.object({
  header: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  cause: z.enum(CAUSES),
  effect: z.enum(EFFECTS),
  stop_ids: z.array(z.string()).max(200).default([]),
  route_ids: z.array(z.string()).max(20).default([]),
  url: z.string().url().max(500).optional().or(z.literal("")),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
});

export const createAlert = createServerFn({ method: "POST" })
  .inputValidator((d) => createSchema.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error, data: row } = await supabaseAdmin.from("service_alerts").insert({
      header: data.header,
      description: data.description || "",
      cause: data.cause,
      effect: data.effect,
      stop_ids: data.stop_ids,
      route_ids: data.route_ids,
      url: data.url || null,
      starts_at: data.starts_at || new Date().toISOString(),
      ends_at: data.ends_at || null,
      active: true,
    }).select().single();
    if (error) return { ok: false as const, error: error.message };

    // Difusión al canal de Telegram (TELEGRAM_ALERTS_CHAT_ID)
    let channel: { ok: boolean; error?: string } = { ok: false, error: "TELEGRAM_ALERTS_CHAT_ID no configurado" };
    const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;
    if (chatId) {
      const lines = [
        `⚠️ <b>${escapeHtml(data.header)}</b>`,
        data.description ? `\n${escapeHtml(data.description)}` : "",
        `\n<b>Causa:</b> ${CAUSE_LABELS[data.cause] || data.cause}`,
        `<b>Efecto:</b> ${EFFECT_LABELS[data.effect] || data.effect}`,
        data.route_ids.length ? `<b>Líneas:</b> ${escapeHtml(data.route_ids.join(", "))}` : "",
        data.ends_at ? `<b>Hasta:</b> ${new Date(data.ends_at).toLocaleString("es-ES")}` : "",
        data.url ? `\n${escapeHtml(data.url)}` : "",
        `\nhttps://arroyobus.lovable.app/avisos`,
      ].filter(Boolean);
      try {
        const res = await sendMessage(chatId, lines.join("\n"));
        channel = res?.ok ? { ok: true } : { ok: false, error: res?.description || "Telegram rechazó el mensaje" };
      } catch (e) {
        channel = { ok: false, error: (e as Error).message };
      }
    }

    return { ok: true as const, id: row.id, channel };
  });

export const listAlertsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("service_alerts").select("*").order("created_at", { ascending: false }).limit(100);
  return data || [];
});

export const deactivateAlert = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("service_alerts").update({ active: false, updated_at: new Date().toISOString() }).eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const listActiveAlertsPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("service_alerts").select("*")
    .eq("active", true)
    .lte("starts_at", nowIso)
    .order("starts_at", { ascending: false })
    .limit(50);
  return (data || []).filter((a: any) => !a.ends_at || a.ends_at > nowIso);
});