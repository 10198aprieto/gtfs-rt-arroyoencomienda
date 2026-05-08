import { fetchAllArrivals, type ArrivalData } from "@/lib/gtfsrt/fetch-arrivals";
import { sendLocation, sendMessage } from "./api";
import {
  escapeHtml,
  formatArrivalsMessage,
  formatVehicleLocation,
  minutesAway,
} from "./format";
import { findStop, getStopById, searchStops } from "./stops";
import {
  addReminder,
  addSubscription,
  deactivateReminder,
  deactivateSubscription,
  listReminders,
  listSubscriptions,
  upsertUser,
} from "./db.server";

const HELP = [
  "🚍 <b>ArroyoBus Bot</b>",
  "",
  "Comandos:",
  "• <code>/parada &lt;id|nombre&gt;</code> — próximas llegadas y posición del bus",
  "• <code>/buscar &lt;nombre&gt;</code> — busca paradas por nombre",
  "• <code>/alertar &lt;parada&gt; &lt;min&gt;</code> — avisa cuando un bus esté a ≤ X min",
  "• <code>/recordar &lt;parada&gt; &lt;HH:MM&gt;</code> — recordatorio diario",
  "• <code>/misalertas</code> — listar y borrar alertas/recordatorios",
  "• <code>/ayuda</code> — esta ayuda",
  "",
  "También puedes escribir directamente el número o nombre de una parada.",
].join("\n");

async function arrivalsForStop(stopId: string): Promise<ArrivalData[]> {
  const all = await fetchAllArrivals();
  const now = Math.floor(Date.now() / 1000);
  return all
    .filter((a) => String(a.stopId) === String(stopId))
    .filter((a) => a.estimatedArrival >= now - 60)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival);
}

async function replyStop(chatId: number, stopId: string) {
  const stop = getStopById(stopId);
  if (!stop) {
    await sendMessage(chatId, `❌ No encuentro la parada <code>${escapeHtml(stopId)}</code>.`);
    return;
  }
  const arrivals = await arrivalsForStop(stopId);
  await sendMessage(chatId, formatArrivalsMessage(stopId, stop.name, arrivals));

  // Ubicación del próximo bus, si tenemos coordenadas válidas
  const next = arrivals.find((a) => a.lat && a.lon);
  if (next) {
    await sendLocation(chatId, next.lat, next.lon);
    await sendMessage(chatId, formatVehicleLocation(next));
  }
}

function parseCommand(text: string): { cmd: string; args: string } {
  const t = text.trim();
  if (!t.startsWith("/")) return { cmd: "", args: t };
  const space = t.indexOf(" ");
  const head = space === -1 ? t : t.slice(0, space);
  const args = space === -1 ? "" : t.slice(space + 1).trim();
  // Quita @botname
  const cmd = head.split("@")[0].toLowerCase();
  return { cmd, args };
}

export async function handleUpdate(update: any): Promise<void> {
  const msg = update?.message;
  if (!msg?.chat?.id) return;
  const chatId: number = msg.chat.id;
  const text: string = (msg.text || "").trim();
  if (!text) return;

  await upsertUser({
    chat_id: chatId,
    username: msg.from?.username,
    first_name: msg.from?.first_name,
    language_code: msg.from?.language_code,
  });

  const { cmd, args } = parseCommand(text);

  try {
    switch (cmd) {
      case "/start":
      case "/ayuda":
      case "/help":
        await sendMessage(chatId, HELP);
        return;

      case "/parada": {
        if (!args) {
          await sendMessage(chatId, "Uso: <code>/parada &lt;id|nombre&gt;</code>");
          return;
        }
        const stop = findStop(args);
        if (!stop) {
          await sendMessage(chatId, `❌ No encuentro ninguna parada para «${escapeHtml(args)}». Prueba <code>/buscar</code>.`);
          return;
        }
        await replyStop(chatId, stop.id);
        return;
      }

      case "/buscar": {
        if (!args) {
          await sendMessage(chatId, "Uso: <code>/buscar &lt;nombre&gt;</code>");
          return;
        }
        const list = searchStops(args, 10);
        if (!list.length) {
          await sendMessage(chatId, `Sin resultados para «${escapeHtml(args)}».`);
          return;
        }
        const lines = list.map((s) => `• <code>${s.id}</code> — ${escapeHtml(s.name)}`);
        await sendMessage(chatId, `Resultados:\n${lines.join("\n")}\n\nUsa <code>/parada &lt;id&gt;</code>.`);
        return;
      }

      case "/alertar": {
        const parts = args.split(/\s+/).filter(Boolean);
        if (parts.length < 2) {
          await sendMessage(chatId, "Uso: <code>/alertar &lt;parada&gt; &lt;minutos&gt;</code>");
          return;
        }
        const min = parseInt(parts[parts.length - 1], 10);
        if (!Number.isFinite(min) || min < 1 || min > 60) {
          await sendMessage(chatId, "Minutos debe ser un número entre 1 y 60.");
          return;
        }
        const query = parts.slice(0, -1).join(" ");
        const stop = findStop(query);
        if (!stop) {
          await sendMessage(chatId, `❌ No encuentro la parada «${escapeHtml(query)}».`);
          return;
        }
        await addSubscription(chatId, stop.id, min);
        await sendMessage(chatId, `✅ Alerta creada: te avisaré cuando un bus esté a ≤ ${min} min de <b>${escapeHtml(stop.name)}</b>.`);
        return;
      }

      case "/recordar": {
        const parts = args.split(/\s+/).filter(Boolean);
        if (parts.length < 2) {
          await sendMessage(chatId, "Uso: <code>/recordar &lt;parada&gt; &lt;HH:MM&gt;</code>");
          return;
        }
        const time = parts[parts.length - 1];
        const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
        if (!m) {
          await sendMessage(chatId, "La hora debe tener formato HH:MM (24h).");
          return;
        }
        const query = parts.slice(0, -1).join(" ");
        const stop = findStop(query);
        if (!stop) {
          await sendMessage(chatId, `❌ No encuentro la parada «${escapeHtml(query)}».`);
          return;
        }
        await addReminder(chatId, stop.id, parseInt(m[1], 10), parseInt(m[2], 10));
        await sendMessage(chatId, `✅ Recordatorio diario creado: <b>${escapeHtml(stop.name)}</b> a las ${time} (hora local Madrid).`);
        return;
      }

      case "/misalertas": {
        const subs = await listSubscriptions(chatId);
        const rems = await listReminders(chatId);
        const lines: string[] = [];
        if (subs.length) {
          lines.push("<b>Alertas:</b>");
          for (const s of subs) {
            const stop = getStopById(s.stop_id);
            lines.push(`• ${escapeHtml(stop?.name || s.stop_id)} ≤ ${s.threshold_minutes}min — borrar: <code>/borrar ${s.id}</code>`);
          }
        }
        if (rems.length) {
          if (lines.length) lines.push("");
          lines.push("<b>Recordatorios:</b>");
          for (const r of rems) {
            const stop = getStopById(r.stop_id);
            const hh = String(r.hour).padStart(2, "0");
            const mm = String(r.minute).padStart(2, "0");
            lines.push(`• ${escapeHtml(stop?.name || r.stop_id)} ${hh}:${mm} — borrar: <code>/borrar ${r.id}</code>`);
          }
        }
        await sendMessage(chatId, lines.length ? lines.join("\n") : "No tienes alertas ni recordatorios activos.");
        return;
      }

      case "/borrar": {
        const id = args.trim();
        if (!id) {
          await sendMessage(chatId, "Uso: <code>/borrar &lt;id&gt;</code>");
          return;
        }
        await deactivateSubscription(id, chatId);
        await deactivateReminder(id, chatId);
        await sendMessage(chatId, "🗑️ Eliminado (si existía).");
        return;
      }

      default: {
        // Texto libre: tratarlo como /parada
        const stop = findStop(text);
        if (stop) {
          await replyStop(chatId, stop.id);
        } else {
          await sendMessage(chatId, `No te entiendo. Escribe <code>/ayuda</code> o el número/nombre de una parada.`);
        }
      }
    }
  } catch (err) {
    console.error("handleUpdate error", err);
    await sendMessage(chatId, "⚠️ Error procesando tu petición. Inténtalo de nuevo.");
  }
}

export { minutesAway };