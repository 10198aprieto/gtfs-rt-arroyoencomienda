import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const PASSENGER_PREFIX = "👥 Pasajeros";
export const PASSENGER_DISCLAIMER =
  "Publicado por pasajeros del bus. Esta información no está verificada y puede no ser fiable.";

const TYPES = {
  delay: { label: "Retraso", effect: "SIGNIFICANT_DELAYS", cause: "OTHER_CAUSE" },
  full: { label: "Bus lleno", effect: "REDUCED_SERVICE", cause: "OTHER_CAUSE" },
  breakdown: { label: "Avería", effect: "REDUCED_SERVICE", cause: "TECHNICAL_PROBLEM" },
  detour: { label: "Desvío", effect: "DETOUR", cause: "OTHER_CAUSE" },
  accident: { label: "Accidente", effect: "SIGNIFICANT_DELAYS", cause: "ACCIDENT" },
  other: { label: "Otra incidencia", effect: "OTHER_EFFECT", cause: "OTHER_CAUSE" },
} as const;
export type PassengerType = keyof typeof TYPES;
export const PASSENGER_TYPES = Object.entries(TYPES).map(([id, t]) => ({ id: id as PassengerType, label: t.label }));

const schema = z.object({
  vehicleId: z.string().trim().min(1).max(20).regex(/^[\w-]+$/),
  type: z.enum(Object.keys(TYPES) as [PassengerType, ...PassengerType[]]),
  text: z.string().trim().min(3, "Describe brevemente la incidencia").max(300, "Máximo 300 caracteres"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function distM(a: number, b: number, c: number, d: number) {
  const R = 6371000, r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export const reportPassengerIncident = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const { fetchAllVehiclePositions } = await import("@/lib/gtfsrt/fetch-arrivals");
    const vehicles = await fetchAllVehiclePositions();
    const v = vehicles.find((x) => x.vehicleId === data.vehicleId);
    if (!v) return { ok: false as const, error: "Ese bus ya no aparece activo." };
    // La posición del bus es aproximada: margen amplio, pero hay que estar cerca
    if (distM(data.lat, data.lon, v.lat, v.lon) > 1500) {
      return { ok: false as const, error: "Tu ubicación no coincide con la de ese bus." };
    }

    const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
    const sb = supabaseAdmin as any;
    const label = v.vehicleName || v.vehicleId;
    const header = `${PASSENGER_PREFIX} · Bus ${label}${v.routeId ? ` (${v.routeId})` : ""}: ${TYPES[data.type].label}`;

    // Evita duplicados: un aviso de pasajeros por bus cada 3 minutos
    const since = new Date(Date.now() - 3 * 60_000).toISOString();
    const { data: recent } = await sb.from("service_alerts").select("id")
      .eq("active", true).like("header", `${PASSENGER_PREFIX} · Bus ${label}%`).gte("created_at", since).limit(1);
    if (recent?.length) return { ok: false as const, error: "Ya se ha avisado de este bus hace un momento." };

    const now = new Date();
    const ends = new Date(now.getTime() + 15 * 60_000);
    const { error } = await sb.from("service_alerts").insert({
      header,
      description: `${data.text}\n\n${PASSENGER_DISCLAIMER}`,
      cause: TYPES[data.type].cause,
      effect: TYPES[data.type].effect,
      stop_ids: [],
      route_ids: v.routeId ? [v.routeId] : [],
      url: null,
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
      active: true,
    });
    if (error) return { ok: false as const, error: "No se pudo publicar ahora mismo." };

    const chatId = process.env["TELEGRAM_ALERTS_CHAT_ID"];
    if (chatId) {
      try {
        const { sendMessage } = await import("@/lib/telegram/api");
        await sendMessage(chatId, [
          `👥 <b>Incidencia de pasajeros</b> · Bus ${esc(label)}${v.routeId ? ` (${esc(v.routeId)})` : ""}`,
          `<b>${TYPES[data.type].label}</b>`,
          esc(data.text),
          `\n<i>${PASSENGER_DISCLAIMER}</i>`,
          `Caduca a las ${ends.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })}.`,
        ].join("\n"));
      } catch (e) {
        console.error("[passenger] telegram", (e as Error).message);
      }
    }
    return { ok: true as const };
  });
