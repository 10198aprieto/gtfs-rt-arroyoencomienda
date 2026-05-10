import { fetchAllArrivals } from "@/lib/gtfsrt/fetch-arrivals";
import { findStop, searchStops, getStopById } from "@/lib/telegram/stops";
import { minutesAway } from "@/lib/telegram/format";

export interface VoiceArrival {
  route: string;
  headsign?: string;
  minutes: number;
  estimatedArrival: number;
  vehicleId: string;
  lat: number;
  lon: number;
}

export interface VoiceResponse {
  ok: boolean;
  stopId?: string;
  stopName?: string;
  arrivals: VoiceArrival[];
  /** Plain text suitable for SMS / WhatsApp (no HTML). */
  text: string;
  /** Spoken text suitable for Alexa / Siri (no symbols, fully expanded). */
  speech: string;
  suggestions?: { id: string; name: string }[];
}

function speakRoute(route: string): string {
  // "L1" -> "línea 1"
  const m = /^L?(\d+)$/i.exec(route);
  if (m) return `línea ${m[1]}`;
  return `línea ${route}`;
}

function speakMinutes(min: number): string {
  if (min <= 0) return "está llegando ahora";
  if (min === 1) return "en 1 minuto";
  return `en ${min} minutos`;
}

export async function lookupStop(query: string): Promise<VoiceResponse> {
  const q = (query || "").trim();
  if (!q) {
    return {
      ok: false,
      arrivals: [],
      text: "Dime el número o el nombre de una parada.",
      speech: "Dime el número o el nombre de una parada.",
    };
  }

  const stop = findStop(q);
  if (!stop) {
    const matches = searchStops(q, 3);
    if (matches.length) {
      const list = matches.map((s) => `${s.id} ${s.name}`).join(", ");
      return {
        ok: false,
        arrivals: [],
        suggestions: matches.map((s) => ({ id: s.id, name: s.name })),
        text: `No encuentro «${q}». ¿Quizá te refieres a: ${list}?`,
        speech: `No encuentro la parada ${q}. Quizá te refieres a: ${matches.map((s) => s.name).join(", o ")}.`,
      };
    }
    return {
      ok: false,
      arrivals: [],
      text: `No he encontrado ninguna parada para «${q}».`,
      speech: `No he encontrado ninguna parada para ${q}.`,
    };
  }

  const all = await fetchAllArrivals();
  const now = Math.floor(Date.now() / 1000);
  const arrivals = all
    .filter((a) => String(a.stopId) === String(stop.id))
    .filter((a) => a.estimatedArrival >= now - 60)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival)
    .slice(0, 4)
    .map<VoiceArrival>((a) => ({
      route: a.routeShortName || a.routeName || "—",
      headsign: a.tripHeadsign,
      minutes: minutesAway(a.estimatedArrival),
      estimatedArrival: a.estimatedArrival,
      vehicleId: a.vehicleId,
      lat: a.lat,
      lon: a.lon,
    }));

  if (!arrivals.length) {
    return {
      ok: true,
      stopId: stop.id,
      stopName: stop.name,
      arrivals: [],
      text: `Parada ${stop.id} - ${stop.name}: sin llegadas próximas.`,
      speech: `En la parada ${stop.name} no hay llegadas próximas en este momento.`,
    };
  }

  const lines = arrivals.map((a) => {
    const when = a.minutes <= 0 ? "Ahora" : `${a.minutes} min`;
    const head = a.headsign ? ` → ${a.headsign}` : "";
    return `L${a.route}${head}: ${when}`;
  });

  const speechLines = arrivals.map((a) => `${speakRoute(a.route)}, ${speakMinutes(a.minutes)}`);

  return {
    ok: true,
    stopId: stop.id,
    stopName: stop.name,
    arrivals,
    text: `🚏 ${stop.name} (${stop.id})\n${lines.join("\n")}`,
    speech: `Próximas llegadas en ${stop.name}: ${speechLines.join(". ")}.`,
  };
}

export { getStopById };