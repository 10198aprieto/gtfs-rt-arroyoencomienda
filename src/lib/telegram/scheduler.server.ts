import { fetchAllArrivals } from "@/lib/gtfsrt/fetch-arrivals";
import { sendLocation, sendMessage } from "./api";
import { escapeHtml, formatArrivalsMessage, formatVehicleLocation, minutesAway } from "./format";
import { getStopById } from "./stops";
import {
  listAllActiveReminders,
  listAllActiveSubscriptions,
  markReminderSent,
  markSubscriptionNotified,
} from "./db.server";

const COOLDOWN_MS = 10 * 60 * 1000;

export async function runTick(): Promise<{ alerts: number; reminders: number }> {
  const arrivals = await fetchAllArrivals();
  const now = Math.floor(Date.now() / 1000);

  // ---- Alertas por proximidad ----
  const subs = await listAllActiveSubscriptions();
  let alertsSent = 0;

  for (const sub of subs) {
    try {
      const cd = sub.last_notified_at ? Date.now() - new Date(sub.last_notified_at).getTime() : Infinity;
      if (cd < COOLDOWN_MS) continue;

      const next = arrivals
        .filter((a) => String(a.stopId) === String(sub.stop_id))
        .filter((a) => a.estimatedArrival >= now - 30)
        .sort((a, b) => a.estimatedArrival - b.estimatedArrival)[0];

      if (!next) continue;
      const min = minutesAway(next.estimatedArrival);
      if (min > sub.threshold_minutes) continue;
      if (sub.last_notified_trip_id && sub.last_notified_trip_id === next.tripId) continue;

      const stop = getStopById(sub.stop_id);
      const route = next.routeShortName || next.routeName || "—";
      await sendMessage(
        sub.chat_id,
        `🔔 <b>Alerta</b>: bus L${escapeHtml(route)} a <b>${min === 0 ? "Ahora" : `${min} min`}</b> de <b>${escapeHtml(stop?.name || sub.stop_id)}</b>.`
      );
      if (next.lat && next.lon) {
        await sendLocation(sub.chat_id, next.lat, next.lon);
        await sendMessage(sub.chat_id, formatVehicleLocation(next));
      }
      await markSubscriptionNotified(sub.id, next.tripId);
      alertsSent++;
    } catch (e) {
      console.error("alert error", sub.id, e);
    }
  }

  // ---- Recordatorios diarios (hora Europa/Madrid) ----
  const rems = await listAllActiveReminders();
  const madrid = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const hh = madrid.getHours();
  const mm = madrid.getMinutes();
  const today = madrid.toISOString().slice(0, 10);
  // weekdays: 1=Mon..7=Sun (ISO)
  const isoWeekday = ((madrid.getDay() + 6) % 7) + 1;
  let remindersSent = 0;

  for (const r of rems) {
    try {
      if (r.last_sent_date === today) continue;
      if (r.hour !== hh || r.minute !== mm) continue;
      if (Array.isArray(r.weekdays) && !r.weekdays.includes(isoWeekday)) continue;

      const stop = getStopById(r.stop_id);
      const stopArrivals = arrivals
        .filter((a) => String(a.stopId) === String(r.stop_id))
        .filter((a) => a.estimatedArrival >= now - 60)
        .sort((a, b) => a.estimatedArrival - b.estimatedArrival);

      await sendMessage(
        r.chat_id,
        `⏰ <b>Recordatorio</b>\n${formatArrivalsMessage(r.stop_id, stop?.name || r.stop_id, stopArrivals)}`
      );
      await markReminderSent(r.id, today);
      remindersSent++;
    } catch (e) {
      console.error("reminder error", r.id, e);
    }
  }

  return { alerts: alertsSent, reminders: remindersSent };
}