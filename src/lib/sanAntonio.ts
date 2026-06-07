// Datos centralizados de las modificaciones por Fiestas de San Antonio 2026.
// Cuando termine la festividad basta con cambiar END_TS o borrar SUSPENDED_STOPS.

export const SAN_ANTONIO_END_TS = new Date("2026-06-20T00:00:00+02:00").getTime();

export function isSanAntonioActive(now: number = Date.now()): boolean {
  return now < SAN_ANTONIO_END_TS;
}

/** IDs de paradas suspendidas en La Flecha (excepto Glorieta del Cañazo) desde el 10 jun 17:00 al 14 jun. */
export const FLECHA_SUSPENDED_STOP_IDS = new Set<string>([
  // Plaza de España (suspendida 8–19 jun)
  "31", "45",
  // La Flecha (suspendidas mié 10 17:00 → dom 14)
  "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "20", "21", "22", "23", "26", "27", "28", "29",
  "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
  "68", "69", "70", "71", "72", "73",
]);

/** Sólo Plaza de España (suspendida del 8 al 19 jun). */
export const PLAZA_ESPANA_STOP_IDS = new Set<string>(["31", "45"]);

/** Glorieta del Cañazo — única parada activa en La Flecha durante los días pico. */
export const CANAZO_STOP_IDS = new Set<string>(["30", "46"]);

/** C/ Picones 15 (cabecera del Búho Fiestas) = parada 30. */
export const BUHO_FIESTAS_STOP_IDS = new Set<string>(["30", "46"]);

/** Horarios del Búho Fiestas por día (salidas desde Glorieta del Cañazo / C/ Picones 15). */
export const BUHO_FIESTAS_SCHEDULE: Array<{ label: string; date: string; times: string[] }> = [
  { label: "Miércoles 10 jun", date: "2026-06-10", times: ["00:00", "01:00", "02:00", "03:00", "04:00"] },
  { label: "Jueves 11 jun",    date: "2026-06-11", times: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00"] },
  { label: "Viernes 12 jun",   date: "2026-06-12", times: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"] },
  { label: "Sábado 13 jun",    date: "2026-06-13", times: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00"] },
];

export type SanAntonioStatus =
  | { kind: "none" }
  | { kind: "plaza-espana" }       // suspendida 8–19 jun
  | { kind: "flecha-suspended" }   // suspendida desde 10 jun 17:00
  | { kind: "canazo" }             // hub durante las fiestas
  | { kind: "buho-fiestas" };      // cabecera Búho Fiestas

export function stopSanAntonioStatus(stopId: string): SanAntonioStatus {
  const id = String(stopId);
  if (!isSanAntonioActive()) return { kind: "none" };
  if (BUHO_FIESTAS_STOP_IDS.has(id)) return { kind: "buho-fiestas" };
  if (CANAZO_STOP_IDS.has(id)) return { kind: "canazo" };
  if (PLAZA_ESPANA_STOP_IDS.has(id)) return { kind: "plaza-espana" };
  if (FLECHA_SUSPENDED_STOP_IDS.has(id)) return { kind: "flecha-suspended" };
  return { kind: "none" };
}

export const SAN_ANTONIO_BANNER_TEXT =
  "⚠️ Fiestas San Antonio · Plaza de España suspendida 8–19 jun · La Flecha solo Glorieta del Cañazo desde el mié 10 (17:00) · Búho Fiestas gratuito 10–13 jun";