// Utilidades compartidas para el indicador de calidad del aire (estación Valladolid Sur).

export const AIR_STATION = "VALLADOLID SUR";

export interface AirQualityRow {
  estacion: string;
  fecha_dato: string;
  no2_ug_m3: number | null;
  o3_ug_m3: number | null;
  pm10_ug_m3: number | null;
  pm25_ug_m3: number | null;
  so2_ug_m3: number | null;
  indice: number | null;
  categoria: string | null;
}

export type AirCategory = "Buena" | "Razonablemente buena" | "Regular" | "Desfavorable" | "Muy desfavorable";

// Umbrales (µg/m³) inspirados en el Índice de Calidad del Aire español (MITECO).
const BANDS: Record<string, number[]> = {
  no2_ug_m3: [40, 90, 120, 230],
  o3_ug_m3: [50, 100, 130, 240],
  pm10_ug_m3: [20, 40, 50, 100],
  pm25_ug_m3: [10, 20, 25, 50],
  so2_ug_m3: [100, 200, 350, 500],
};

const CATEGORIES: AirCategory[] = [
  "Buena",
  "Razonablemente buena",
  "Regular",
  "Desfavorable",
  "Muy desfavorable",
];

/** Devuelve el nivel (1 = mejor, 5 = peor) o null si no hay datos utilizables. */
export function computeAirIndex(values: Record<string, number | null | undefined>): number | null {
  let worst: number | null = null;
  for (const [key, bands] of Object.entries(BANDS)) {
    const v = values[key];
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    let level = bands.length + 1;
    for (let i = 0; i < bands.length; i++) {
      if (v <= bands[i]) { level = i + 1; break; }
    }
    worst = worst === null ? level : Math.max(worst, level);
  }
  return worst;
}

export function categoryFor(index: number | null): AirCategory | null {
  if (!index) return null;
  return CATEGORIES[Math.min(index, CATEGORIES.length) - 1];
}

/** Clases Tailwind (tokens del sistema de diseño) por nivel. */
export function airBadgeClasses(index: number | null): string {
  switch (index) {
    case 1:
    case 2:
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25";
    case 3:
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25";
    default:
      return "bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25";
  }
}