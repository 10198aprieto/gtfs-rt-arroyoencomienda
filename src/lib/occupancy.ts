// Ocupación GTFS-RT (OccupancyStatus) → nivel tipo Google Maps
export type OccupancyLevel = { level: 0 | 1 | 2 | 3; label: string; color: string; percent: number | null };

const NAMES = [
  "EMPTY",
  "MANY_SEATS_AVAILABLE",
  "FEW_SEATS_AVAILABLE",
  "STANDING_ROOM_ONLY",
  "CRUSHED_STANDING_ROOM_ONLY",
  "FULL",
  "NOT_ACCEPTING_PASSENGERS",
  "NO_DATA_AVAILABLE",
  "NOT_BOARDABLE",
];

export function parseOccupancy(status: unknown, percentage: unknown): OccupancyLevel | null {
  const pct = typeof percentage === "number" && percentage >= 0 ? Math.round(percentage) : null;
  const name = typeof status === "number" ? NAMES[status] : typeof status === "string" ? status.toUpperCase() : undefined;
  let level: 0 | 1 | 2 | 3 | null = null;
  switch (name) {
    case "EMPTY":
    case "MANY_SEATS_AVAILABLE": level = 0; break;
    case "FEW_SEATS_AVAILABLE": level = 1; break;
    case "STANDING_ROOM_ONLY": level = 2; break;
    case "CRUSHED_STANDING_ROOM_ONLY":
    case "FULL":
    case "NOT_ACCEPTING_PASSENGERS": level = 3; break;
  }
  if (level == null && pct != null) level = pct < 40 ? 0 : pct < 70 ? 1 : pct < 90 ? 2 : 3;
  if (level == null) return null;
  const meta = [
    { label: "Poco ocupado", color: "#16a34a" },
    { label: "Bastante ocupado", color: "#ca8a04" },
    { label: "Solo de pie", color: "#ea580c" },
    { label: "Lleno", color: "#dc2626" },
  ][level];
  return { level, ...meta, percent: pct };
}

export function occupancyHtml(o: OccupancyLevel | null): string {
  if (!o) return `<div style="margin-top:4px;font-size:11px;color:#888">Ocupación: sin datos</div>`;
  const people = [0, 1, 2]
    .map((i) => `<span style="opacity:${i <= Math.min(o.level, 2) ? 1 : 0.25}">●</span>`)
    .join("");
  return `<div style="margin-top:4px;display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:10px;background:${o.color}22;color:${o.color};font-size:11px;font-weight:700">
    <span style="letter-spacing:1px">${people}</span>${o.label}${o.percent != null ? ` · ${o.percent}%` : ""}</div>`;
}
