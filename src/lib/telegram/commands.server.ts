import { fetchAllArrivals, type ArrivalData } from "@/lib/gtfsrt/fetch-arrivals";
import { answerCallbackQuery, editMessageText, sendLocation, sendMessage } from "./api";
import {
  escapeHtml,
  formatArrivalsMessage,
  formatVehicleLocation,
  minutesAway,
} from "./format";
import { findStop, getStopById, nearestStops, searchStops } from "./stops";
import {
  addFavorite,
  addReminder,
  addSubscription,
  deactivateReminder,
  deactivateSubscription,
  getAlertsOptIn,
  listFavorites,
  listReminders,
  listSubscriptions,
  removeFavorite,
  setAlertsOptIn,
  upsertUser,
} from "./db.server";
import { COMBINAR_TEXT, TARIFAS_TEXT } from "./tarifas";

const HELP = [
  "🚍 <b>ArroyoBus Bot</b>",
  "",
  "Comandos principales:",
  "• <code>/parada &lt;id|nombre&gt;</code> — próximas llegadas y posición del bus",
  "• <code>/buscar &lt;nombre&gt;</code> — busca paradas por nombre",
  "• 📍 Envía tu <b>ubicación</b> y te muestro las paradas más cercanas",
  "",
  "Favoritas:",
  "• <code>/favorita &lt;parada&gt; [alias]</code> — guardar parada",
  "• <code>/favoritas</code> — ver tus paradas guardadas",
  "• <code>/quitarfavorita &lt;parada&gt;</code>",
  "",
  "Alertas y recordatorios:",
  "• <code>/alertar &lt;parada&gt; &lt;min&gt;</code> — avisa cuando un bus esté a ≤ X min",
  "• <code>/recordar &lt;parada&gt; &lt;HH:MM&gt;</code> — recordatorio diario",
  "• <code>/misalertas</code> — listar y borrar alertas/recordatorios",
  "• <code>/avisos</code> — activar/desactivar avisos de servicio",
  "",
  "Información:",
  "• <code>/tarifas</code> — precios y tarjeta BusCyL",
  "• <code>/combinar</code> — transbordos con AUVASA (Valladolid)",
  "• <code>/ayuda</code> — esta ayuda",
  "",
  "También puedes escribir el número o nombre de una parada.",
].join("\n");

async function arrivalsForStop(stopId: string): Promise<ArrivalData[]> {
  const all = await fetchAllArrivals();
  const now = Math.floor(Date.now() / 1000);
  return all
    .filter((a) => String(a.stopId) === String(stopId))
    .filter((a) => a.estimatedArrival >= now - 60)
    .sort((a, b) => a.estimatedArrival - b.estimatedArrival);
}

function stopKeyboard(stopId: string, isFavorite: boolean) {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Actualizar", callback_data: `r:${stopId}` },
        isFavorite
          ? { text: "★ Quitar favorita", callback_data: `f-:${stopId}` }
          : { text: "☆ Favorita", callback_data: `f+:${stopId}` },
      ],
      [
        { text: "🔔 Alerta 5 min", callback_data: `a5:${stopId}` },
        { text: "🗺️ Ver en mapa", url: `https://arroyobus.lovable.app/parada/${stopId}` },
      ],
    ],
  };
}

async function isFavorite(chatId: number, stopId: string): Promise<boolean> {
  const favs = await listFavorites(chatId);
  return favs.some((f: any) => String(f.stop_id) === String(stopId));
}

async function replyStop(chatId: number, stopId: string) {
  const stop = getStopById(stopId);
  if (!stop) {
    await sendMessage(chatId, `❌ No encuentro la parada <code>${escapeHtml(stopId)}</code>.`);
    return;
  }
  const arrivals = await arrivalsForStop(stopId);
  const fav = await isFavorite(chatId, stopId);
  await sendMessage(chatId, formatArrivalsMessage(stopId, stop.name, arrivals), {
    reply_markup: stopKeyboard(stopId, fav),
  });

  const next = arrivals.find((a) => a.lat && a.lon);
  if (next) {
    await sendLocation(chatId, next.lat, next.lon);
    await sendMessage(chatId, formatVehicleLocation(next));
  }
}

async function editStopMessage(chatId: number, messageId: number, stopId: string) {
  const stop = getStopById(stopId);
  if (!stop) return;
  const arrivals = await arrivalsForStop(stopId);
  const fav = await isFavorite(chatId, stopId);
  await editMessageText(chatId, messageId, formatArrivalsMessage(stopId, stop.name, arrivals), {
    reply_markup: stopKeyboard(stopId, fav),
  });
}

async function replyNearby(chatId: number, lat: number, lon: number) {
  const near = nearestStops(lat, lon, 5);
  if (!near.length) {
    await sendMessage(chatId, "No encuentro paradas cercanas.");
    return;
  }
  const lines = near.map((s) => `• <code>${s.id}</code> — ${escapeHtml(s.name)} · <b>${Math.round(s.meters)} m</b>`);
  const buttons = near.map((s) => [{ text: `${s.id} · ${s.name.slice(0, 40)}`, callback_data: `s:${s.id}` }]);
  await sendMessage(chatId, `📍 <b>Paradas más cercanas</b>:\n${lines.join("\n")}`, {
    reply_markup: { inline_keyboard: buttons },
  });
}

async function handleCallback(cb: any): Promise<void> {
  const chatId: number | undefined = cb?.message?.chat?.id;
  const messageId: number | undefined = cb?.message?.message_id;
  const data: string = cb?.data ?? "";
  const id: string = cb?.id;
  if (!chatId || !id) return;

  const [action, arg] = data.split(":");
  try {
    if ((action === "r" || action === "s") && arg) {
      if (action === "r" && messageId) {
        await editStopMessage(chatId, messageId, arg);
        await answerCallbackQuery(id, "Actualizado");
      } else {
        await replyStop(chatId, arg);
        await answerCallbackQuery(id);
      }
      return;
    }
    if (action === "f+" && arg) {
      await addFavorite(chatId, arg);
      await answerCallbackQuery(id, "★ Guardada en favoritas");
      if (messageId) await editStopMessage(chatId, messageId, arg);
      return;
    }
    if (action === "f-" && arg) {
      await removeFavorite(chatId, arg);
      await answerCallbackQuery(id, "Quitada de favoritas");
      if (messageId) await editStopMessage(chatId, messageId, arg);
      return;
    }
    if (action === "a5" && arg) {
      await addSubscription(chatId, arg, 5);
      const stop = getStopById(arg);
      await answerCallbackQuery(id, `Alerta creada (≤5 min)`, true);
      await sendMessage(chatId, `✅ Te avisaré cuando un bus esté a ≤ 5 min de <b>${escapeHtml(stop?.name || arg)}</b>.`);
      return;
    }
    await answerCallbackQuery(id);
  } catch (e) {
    console.error("callback error", e);
    await answerCallbackQuery(id, "Error", true);
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
  if (update?.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  const msg = update?.message ?? update?.edited_message;
  if (!msg?.chat?.id) return;
  const chatId: number = msg.chat.id;

  // Ubicación compartida
  if (msg.location && typeof msg.location.latitude === "number") {
    await upsertUser({
      chat_id: chatId,
      username: msg.from?.username,
      first_name: msg.from?.first_name,
      language_code: msg.from?.language_code,
    });
    await replyNearby(chatId, msg.location.latitude, msg.location.longitude);
    return;
  }

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

      case "/tarifas":
      case "/tarifa":
      case "/precio":
      case "/precios":
      case "/buscyl":
        await sendMessage(chatId, TARIFAS_TEXT);
        return;

      case "/combinar":
      case "/auvasa":
      case "/transbordo":
      case "/transbordos":
        await sendMessage(chatId, COMBINAR_TEXT);
        return;

      case "/avisos": {
        const now = await getAlertsOptIn(chatId);
        const next = !now;
        await setAlertsOptIn(chatId, next);
        await sendMessage(
          chatId,
          next
            ? "🔔 Avisos de servicio <b>activados</b>. Te enviaré incidencias y desvíos en cuanto se publiquen."
            : "🔕 Avisos de servicio <b>desactivados</b>. Usa <code>/avisos</code> para volver a activarlos."
        );
        return;
      }

      case "/favorita":
      case "/fav": {
        const parts = args.split(/\s+/).filter(Boolean);
        if (!parts.length) {
          await sendMessage(chatId, "Uso: <code>/favorita &lt;parada&gt; [alias]</code>");
          return;
        }
        const stop = findStop(parts[0]);
        if (!stop) {
          await sendMessage(chatId, `❌ No encuentro la parada «${escapeHtml(parts[0])}».`);
          return;
        }
        const alias = parts.slice(1).join(" ").trim() || undefined;
        await addFavorite(chatId, stop.id, alias);
        await sendMessage(chatId, `★ Guardada <b>${escapeHtml(stop.name)}</b>${alias ? ` como «${escapeHtml(alias)}»` : ""}.`);
        return;
      }

      case "/favoritas":
      case "/favs": {
        const favs = await listFavorites(chatId);
        if (!favs.length) {
          await sendMessage(chatId, "No tienes paradas favoritas. Añádelas con <code>/favorita &lt;parada&gt;</code> o usa el botón ☆ en cualquier parada.");
          return;
        }
        const buttons = favs.map((f: any) => {
          const stop = getStopById(f.stop_id);
          const label = f.alias || stop?.name || f.stop_id;
          return [{ text: `★ ${String(label).slice(0, 50)}`, callback_data: `s:${f.stop_id}` }];
        });
        await sendMessage(chatId, "★ <b>Tus paradas favoritas</b>:", {
          reply_markup: { inline_keyboard: buttons },
        });
        return;
      }

      case "/quitarfavorita":
      case "/desfavorita": {
        if (!args) {
          await sendMessage(chatId, "Uso: <code>/quitarfavorita &lt;parada&gt;</code>");
          return;
        }
        const stop = findStop(args);
        if (!stop) {
          await sendMessage(chatId, `❌ No encuentro «${escapeHtml(args)}».`);
          return;
        }
        await removeFavorite(chatId, stop.id);
        await sendMessage(chatId, `🗑️ Quitada <b>${escapeHtml(stop.name)}</b> de favoritas.`);
        return;
      }

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