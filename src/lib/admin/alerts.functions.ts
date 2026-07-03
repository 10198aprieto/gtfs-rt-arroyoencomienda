import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./session.server";

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
    return { ok: true as const, id: row.id };
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