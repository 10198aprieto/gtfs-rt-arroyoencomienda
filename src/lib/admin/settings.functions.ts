import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./session.server";

const SETTING_KEYS = [
  "gtfs_rt_vehicle_positions_url",
  "gtfs_rt_trip_updates_url",
  "gtfs_static_url",
  "san_antonio_banner_text",
  "telegram_bot_link",
] as const;
type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  gtfs_rt_vehicle_positions_url: "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt?format=json",
  gtfs_rt_trip_updates_url: "https://enzeyiwpoomhlxmcjivn.supabase.co/functions/v1/gtfs-rt-trip-updates?format=json",
  gtfs_static_url: "/GTFS_Static.zip",
  san_antonio_banner_text: "⚠️ Fiestas San Antonio · Plaza de España suspendida 8–19 jun · La Flecha solo Glorieta del Cañazo desde el mié 10 (17:00) · Búho Fiestas gratuito 10–13 jun",
  telegram_bot_link: "https://t.me/arroyobus_bot",
};

export const getAllSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
  const { data } = await supabaseAdmin.from("app_settings").select("key, value, updated_at");
  const map: Record<string, { value: string; updated_at: string | null }> = {};
  for (const k of SETTING_KEYS) map[k] = { value: DEFAULT_SETTINGS[k], updated_at: null };
  for (const row of data || []) {
    if (SETTING_KEYS.includes(row.key as SettingKey)) {
      const v = (row.value as any)?.v ?? row.value;
      map[row.key] = { value: typeof v === "string" ? v : JSON.stringify(v), updated_at: row.updated_at as string };
    }
  }
  return map;
});

const updateSchema = z.object({
  key: z.enum(SETTING_KEYS),
  value: z.string().min(1).max(2000),
});

export const updateSetting = createServerFn({ method: "POST" })
  .inputValidator((d) => updateSchema.parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: data.key, value: { v: data.value }, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return { ok: false as const, error: error.message };
    await supabaseAdmin.from("admin_audit_log").insert({ action: "update_setting", meta: { key: data.key } });
    return { ok: true as const };
  });

export const resetSetting = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ key: z.enum(SETTING_KEYS) }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
    await supabaseAdmin.from("app_settings").delete().eq("key", data.key);
    await supabaseAdmin.from("admin_audit_log").insert({ action: "reset_setting", meta: { key: data.key } });
    return { ok: true as const };
  });

export const listSecretsStatus = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const names = [
    "ACTIOSAE_API_KEY", "ACTIOSAE_PROXY_URL", "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_ADMIN_TOKEN", "TELEGRAM_ALERTS_CHAT_ID",
    "SESSION_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD",
  ];
  return names.map((n) => ({ name: n, present: !!process.env[n] }));
});