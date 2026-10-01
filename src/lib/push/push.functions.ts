import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const subSchema = z.object({
  endpoint: z.string().url().max(1000).startsWith("https://"),
  p256dh: z.string().min(10).max(200),
  auth: z.string().min(4).max(100),
  stopIds: z.array(z.string().max(20)).max(20).default([]),
  alerts: z.boolean().default(true),
  arrivals: z.boolean().default(true),
});

async function publicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = (process.env["SUPABASE_URL"] || "").trim();
  const key = (process.env["SUPABASE_PUBLISHABLE_KEY"] || "").trim();
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  }) as any;
}

export const savePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((d) => subSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    const { error } = await sb.rpc("upsert_push_subscription", {
      _endpoint: data.endpoint, _p256dh: data.p256dh, _auth: data.auth,
      _stop_ids: data.stopIds, _alerts: data.alerts, _arrivals: data.arrivals,
    });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ endpoint: z.string().url().max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await publicClient();
    await sb.rpc("delete_push_subscription", { _endpoint: data.endpoint });
    return { ok: true as const };
  });
