// Datos centralizados de las modificaciones por Fiestas de San Antonio 2026.
// Cuando termine la festividad basta con cambiar END_TS o borrar SUSPENDED_STOPS.

export const SAN_ANTONIO_END_TS = new Date("2026-06-20T00:00:00+02:00").getTime();

export function isSanAntonioActive(now: number = Date.now()): boolean {
  return now < SAN_ANTONIO_END_TS;
}

/** IDs de paradas suspendidas desde el mié 10 jun 17:00 (zona Zaratán / Clavel / Almendrera). */
export const FLECHA_SUSPENDED_STOP_IDS = new Set<string>([
  // C/ Camino de Zaratán 40A, 22 (x2), 2 (x2)
  "34", "35", "36", "40", "41",
  // C/ Clavel 10 y Clavel (Casa de Cultura)
  "42", "43",
  // C/ Almendrera 16 (Casa de Cultura) y Almendrera (CEIP Raimundo de Blas) (x2)
  "32", "33", "44",
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