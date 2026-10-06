import { lookupStop } from "@/lib/voice/query.server";
import { fetchAllArrivals, fetchAllVehiclePositions } from "@/lib/gtfsrt/fetch-arrivals";
import { findStop } from "@/lib/telegram/stops";
import { ROUTES, routeMeta } from "@/data/routes";
import { minutesAway } from "@/lib/telegram/format";

export interface AlexaReply {
  speech: string;
  end: boolean;
  reprompt?: string;
  session?: Record<string, unknown>;
}

const ASK_MORE = "¿Quieres saber algo más?";
const keep = (speech: string, session?: Record<string, unknown>): AlexaReply => ({
  speech: `${speech} ${ASK_MORE}`,
  end: false,
  reprompt: ASK_MORE,
  session,
});

export const WELCOME =
  "Bienvenido a Arroyo Bus. Puedes preguntarme cuándo llega el bus a una parada, cuándo pasa una línea concreta, si hay avisos, cuántos buses circulan, las tarifas, la tarjeta BusCyL, cómo llegar al hospital o a la universidad, o el teléfono de atención. ¿Qué quieres saber?";

export const HELP =
  "Algunos ejemplos: «próximo bus en la parada 100», «cuándo pasa la línea azul por Plaza España», «hay avisos», «cuántos buses hay circulando», «dónde está la línea roja», «cuánto cuesta el billete», «qué es BusCyL», «cómo voy al hospital Río Hortega», «qué líneas hay», «horario del búho» o «teléfono de atención». ¿Qué quieres saber?";

function slot(intent: any, ...names: string[]): string {
  const slots = intent?.slots || {};
  for (const n of names) {
    const s = slots[n];
    const resolved = s?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.name;
    const v = resolved || s?.value;
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

function matchRoute(text: string) {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/buho|noct/.test(t)) return ROUTES.find((r) => r.id === "Buho");
  if (/azul/.test(t)) return ROUTES.find((r) => r.id === "Azul");
  if (/roj/.test(t)) return ROUTES.find((r) => r.id === "Roja");
  if (/verde|univers/.test(t)) return ROUTES.find((r) => r.id === "Verde");
  return undefined;
}

const say = (min: number) => (min <= 0 ? "está llegando" : min === 1 ? "en 1 minuto" : `en ${min} minutos`);

async function stopReply(q: string): Promise<AlexaReply> {
  const r = await lookupStop(q);
  return r.ok ? keep(r.speech, { lastStop: r.stopId }) : keep(r.speech);
}

async function lineAtStop(lineText: string, stopText: string): Promise<AlexaReply> {
  const route = matchRoute(lineText);
  if (!route) return keep(`No conozco la línea ${lineText}. Las líneas son Azul, Roja, Verde y Búho.`);
  const stop = findStop(stopText);
  if (!stop) return keep(`No encuentro la parada ${stopText}.`);
  const r = await lookupStop(stop.id);
  const hits = r.arrivals.filter((a) => routeMeta(a.route)?.id === route.id);
  if (!hits.length) return keep(`Ahora mismo no hay llegadas próximas de la ${route.name} en ${stop.name}.`, { lastStop: stop.id });
  const list = hits.slice(0, 2).map((a) => say(a.minutes) + (a.isScheduled ? " según horario" : "")).join(", y la siguiente ");
  return keep(`La ${route.name} llega a ${stop.name} ${list}.`, { lastStop: stop.id });
}

async function alertsReply(): Promise<AlexaReply> {
  try {
    const { supabaseAdmin } = await import("@/lib/admin/supabase-admin.server");
    const now = new Date().toISOString();
    const { data } = await supabaseAdmin
      .from("service_alerts")
      .select("header,ends_at")
      .eq("active", true)
      .lte("starts_at", now)
      .order("starts_at", { ascending: false })
      .limit(10);
    const list = (data || []).filter((a: any) => !a.ends_at || a.ends_at > now);
    if (!list.length) return keep("No hay avisos activos. El servicio funciona con normalidad.");
    const clean = (s: string) => s.replace(/[\p{Extended_Pictographic}]/gu, "").trim();
    return keep(
      `Hay ${list.length} ${list.length === 1 ? "aviso" : "avisos"}: ${list.slice(0, 3).map((a: any) => clean(a.header)).join(". ")}.`
    );
  } catch {
    return keep("No he podido consultar los avisos ahora mismo.");
  }
}

async function activeBusesReply(lineText?: string): Promise<AlexaReply> {
  const vps = await fetchAllVehiclePositions();
  const route = lineText ? matchRoute(lineText) : undefined;
  if (route) {
    const n = vps.filter((v) => routeMeta(v.routeId)?.id === route.id).length;
    return keep(n ? `Hay ${n} ${n === 1 ? "autobús" : "autobuses"} de la ${route.name} circulando ahora.` : `Ahora no hay ningún autobús de la ${route.name} circulando.`);
  }
  if (!vps.length) return keep("Ahora mismo no hay autobuses circulando o no recibo su posición.");
  const parts = ROUTES.map((r) => [r, vps.filter((v) => routeMeta(v.routeId)?.id === r.id).length] as const)
    .filter(([, n]) => n > 0)
    .map(([r, n]) => `${n} de la ${r.name}`);
  return keep(`Hay ${vps.length} autobuses circulando${parts.length ? `: ${parts.join(", ")}` : ""}.`);
}

async function whereIsLine(lineText: string): Promise<AlexaReply> {
  const route = matchRoute(lineText);
  if (!route) return keep("¿Qué línea? Azul, Roja, Verde o Búho.");
  const arr = (await fetchAllArrivals())
    .filter((a) => routeMeta(a.routeId)?.id === route.id)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of arr) {
    if (seen.has(a.vehicleId)) continue;
    seen.add(a.vehicleId);
    out.push(`un bus llegará a ${a.stopName} ${say(minutesAway(a.estimatedArrival))}`);
    if (out.length >= 2) break;
  }
  if (!out.length) return keep(`Ahora no tengo ningún autobús de la ${route.name} en ruta.`);
  return keep(`${route.name}: ${out.join("; y otro, ")}.`);
}

const DESTINOS: Array<[RegExp, string]> = [
  [/rio hortega|hurh/, "Para el Hospital Río Hortega, bájate en Paseo de Zorrilla 65, frente al centro comercial, y coge Auvasa línea 9, C1, 6, H o 7."],
  [/clinico|hcuv/, "Para el Hospital Clínico, coge Auvasa línea 1 o 2 dirección Covaresa o San Pedro Regalado y bájate en Avenida Ramón y Cajal 3. Son unos 17 minutos."],
  [/campus|delibes|universidad|uva/, "Para el campus Miguel Delibes, bájate en la Estación de Autobuses, camina a la parada de Auvasa Calle Recondo 4 y coge la línea 2 hasta Plaza Carmen Ferreiro. También puedes usar la Línea Verde de Arroyo Bus."],
  [/plaza mayor|fuente dorada/, "Para la Plaza Mayor, bájate en Paseo de Zorrilla 65 y coge Auvasa línea 1 o 2 hasta Fuente Dorada."],
  [/plaza espana/, "Para Plaza España, bájate en la Estación de Autobuses y sigue andando por Calle Recondo, Calle Gamazo y Plaza Madrid."],
  [/tren|campo grande|renfe|estacion/, "Para la estación de tren Campo Grande, bájate en la Estación de Autobuses y camina hacia el este por la Calle Recondo."],
];

function destinoReply(text: string): AlexaReply {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hit = DESTINOS.find(([re]) => re.test(t));
  if (hit) return keep(`${hit[1]} Recuerda que con BusCyL el transbordo a Auvasa no es gratuito.`);
  return keep(`No tengo una ruta guardada para ${text || "ese destino"}. Puedo orientarte al Río Hortega, el Clínico, la universidad, Plaza Mayor, Plaza España o la estación de tren. Para otros sitios usa el planificador en arroyobus punto net.`);
}

export async function handleIntent(intent: any, session: Record<string, any> = {}): Promise<AlexaReply> {
  const name: string = intent?.name || "";
  switch (name) {
    case "AMAZON.HelpIntent":
      return { speech: HELP, end: false, reprompt: "¿Qué quieres saber?" };
    case "AMAZON.StopIntent":
    case "AMAZON.CancelIntent":
    case "AMAZON.NoIntent":
      return { speech: "Hasta pronto. ¡Buen viaje!", end: true };
    case "AMAZON.YesIntent":
      return { speech: "Dime, ¿qué quieres saber?", end: false, reprompt: "¿Qué quieres saber?" };
    case "AMAZON.RepeatIntent":
    case "RefrescarIntent":
      if (session.lastStop) return stopReply(String(session.lastStop));
      return keep("Todavía no me has preguntado por ninguna parada.");
    case "ParadaIntent": {
      const q = slot(intent, "parada", "stop", "numero");
      if (!q) return { speech: "¿Qué parada quieres consultar? Dime su número o su nombre.", end: false, reprompt: "¿Qué parada?" };
      return stopReply(q);
    }
    case "LineaParadaIntent": {
      const l = slot(intent, "linea");
      const p = slot(intent, "parada") || String(session.lastStop || "");
      if (!l) return keep("¿Qué línea? Azul, Roja, Verde o Búho.");
      if (!p) return keep(`¿En qué parada quieres saber cuándo pasa la línea ${l}?`);
      return lineAtStop(l, p);
    }
    case "DondeLineaIntent":
      return whereIsLine(slot(intent, "linea"));
    case "AvisosIntent":
      return alertsReply();
    case "BusesActivosIntent":
      return activeBusesReply(slot(intent, "linea") || undefined);
    case "LineasIntent":
      return keep(
        "Arroyo Bus tiene cuatro líneas: " +
          ROUTES.map((r) => `la ${r.name}, ${r.desc.replace(/ ·/g, ",").replace(" (noche)", ", de noche")}`).join("; ") +
          "."
      );
    case "TarifasIntent":
      return keep("El billete sencillo cuesta 1 euro con 80 y se compra a bordo. Con la tarjeta BusCyL tienes descuentos, y es gratuita para empadronados en Castilla y León.");
    case "BuscylIntent":
      return keep("La tarjeta BusCyL sustituye a los antiguos abonos de la Junta. Es gratuita para empadronados en Castilla y León y se pide en buscyl punto es. Al subir, acércala al validador. Ojo: en los autobuses urbanos de Auvasa, dentro de Valladolid, no sirve.");
    case "CombinarIntent":
    case "ComoLlegarIntent":
      return destinoReply(slot(intent, "destino"));
    case "BuhoIntent":
      return keep("El Búho es la línea nocturna entre Plaza Poniente, en Valladolid, y Arroyo. Para la hora exacta, pregúntame por una parada concreta, por ejemplo «cuándo pasa el búho por la parada 100».");
    case "TelefonoIntent":
      return keep("Puedes llamar al teléfono de atención 941 68 30 91. También puedes usar el bot de Telegram o la web arroyobus punto net.");
    case "PeticionIntent":
      return keep("Los vecinos han lanzado una petición en Change punto org por un transporte público digno en Arroyo de la Encomienda. Encontrarás el enlace para firmar en arroyobus punto net.");
    case "AMAZON.FallbackIntent":
    default: {
      const q = slot(intent, "parada", "consulta");
      if (q) return stopReply(q);
      return { speech: `No te he entendido. ${HELP}`, end: false, reprompt: "¿Qué quieres saber?" };
    }
  }
}
