import type { ArrivalData } from "@/lib/gtfsrt/fetch-arrivals";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function minutesAway(estimatedArrival: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, Math.round((estimatedArrival - now) / 60));
}

export function formatArrivalsMessage(stopId: string, stopName: string, arrivals: ArrivalData[]): string {
  const head = `🚏 <b>${escapeHtml(stopName || `Parada ${stopId}`)}</b>\n<i>Parada ${escapeHtml(stopId)}</i>\n`;
  if (!arrivals.length) return `${head}\nSin llegadas próximas.`;
  const lines = arrivals.slice(0, 6).map((a) => {
    const min = minutesAway(a.estimatedArrival);
    const when = min === 0 ? "Ahora" : `${min} min`;
    const route = a.routeShortName || a.routeName || "—";
    const head2 = a.tripHeadsign ? ` → ${escapeHtml(a.tripHeadsign)}` : "";
    return `🚍 <b>L${escapeHtml(route)}</b>${head2} · <b>${when}</b>`;
  });
  return `${head}\n${lines.join("\n")}`;
}

export function gmapsLink(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}`;
}

export function osmLink(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

export function formatVehicleLocation(a: ArrivalData): string {
  const route = a.routeShortName || a.routeName || "—";
  const speed = a.speed != null ? ` · ${(a.speed * 3.6).toFixed(0)} km/h` : "";
  return `📍 Bus L${escapeHtml(route)} (vehículo ${escapeHtml(a.vehicleId)})${speed}\n` +
    `<a href="${gmapsLink(a.lat, a.lon)}">Google Maps</a> · <a href="${osmLink(a.lat, a.lon)}">OpenStreetMap</a>`;
}