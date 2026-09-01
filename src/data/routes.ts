export interface RouteMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
  emoji: string;
  shapes: string[];
}

export const ROUTES: RouteMeta[] = [
  { id: "Azul", name: "Línea Azul", desc: "Valladolid · La Vega · Sotoverde", color: "#3b4cd1", emoji: "🔵", shapes: ["Azul"] },
  { id: "Roja", name: "Línea Roja", desc: "Valladolid · La Flecha · Sotoverde", color: "#ca0d32", emoji: "🔴", shapes: ["Roja"] },
  { id: "Verde", name: "Línea Verde", desc: "Arroyo · Universidades", color: "#0fab6a", emoji: "🟢", shapes: ["Verde_ida", "Verde_vuelta"] },
  { id: "Buho", name: "Búho", desc: "Plaza Poniente · Arroyo (noche)", color: "#7c3aed", emoji: "🟣", shapes: ["Buho"] },
];

export function routeMeta(routeId?: string | null): RouteMeta | undefined {
  if (!routeId) return undefined;
  const key = String(routeId).toLowerCase();
  return ROUTES.find((r) => r.id.toLowerCase() === key || key.includes(r.id.toLowerCase()));
}

export function routeColor(routeId?: string | null, fallback = "#1d4ed8") {
  return routeMeta(routeId)?.color ?? fallback;
}
