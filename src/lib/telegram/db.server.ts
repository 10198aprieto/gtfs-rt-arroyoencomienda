import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function upsertUser(user: { chat_id: number; username?: string; first_name?: string; language_code?: string }) {
  await supabaseAdmin.from("telegram_users").upsert(
    { ...user, last_seen_at: new Date().toISOString() },
    { onConflict: "chat_id" }
  );
}

export async function isUpdateProcessed(updateId: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("telegram_processed_updates")
    .select("update_id")
    .eq("update_id", updateId)
    .maybeSingle();
  return !!data;
}

export async function markUpdateProcessed(updateId: number) {
  await supabaseAdmin.from("telegram_processed_updates").insert({ update_id: updateId });
}

export async function addSubscription(chatId: number, stopId: string, thresholdMinutes: number) {
  await supabaseAdmin.from("telegram_subscriptions").insert({
    chat_id: chatId,
    stop_id: stopId,
    threshold_minutes: thresholdMinutes,
  });
}

export async function listSubscriptions(chatId: number) {
  const { data } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("*")
    .eq("chat_id", chatId)
    .eq("active", true);
  return data ?? [];
}

export async function deactivateSubscription(id: string, chatId: number) {
  await supabaseAdmin
    .from("telegram_subscriptions")
    .update({ active: false })
    .eq("id", id)
    .eq("chat_id", chatId);
}

export async function listAllActiveSubscriptions() {
  const { data } = await supabaseAdmin
    .from("telegram_subscriptions")
    .select("*")
    .eq("active", true);
  return data ?? [];
}

export async function markSubscriptionNotified(id: string, tripId: string) {
  await supabaseAdmin
    .from("telegram_subscriptions")
    .update({ last_notified_at: new Date().toISOString(), last_notified_trip_id: tripId })
    .eq("id", id);
}

export async function addReminder(chatId: number, stopId: string, hour: number, minute: number) {
  await supabaseAdmin.from("telegram_reminders").insert({
    chat_id: chatId,
    stop_id: stopId,
    hour,
    minute,
  });
}

export async function listReminders(chatId: number) {
  const { data } = await supabaseAdmin
    .from("telegram_reminders")
    .select("*")
    .eq("chat_id", chatId)
    .eq("active", true);
  return data ?? [];
}

export async function deactivateReminder(id: string, chatId: number) {
  await supabaseAdmin
    .from("telegram_reminders")
    .update({ active: false })
    .eq("id", id)
    .eq("chat_id", chatId);
}

export async function listAllActiveReminders() {
  const { data } = await supabaseAdmin
    .from("telegram_reminders")
    .select("*")
    .eq("active", true);
  return data ?? [];
}

export async function markReminderSent(id: string, date: string) {
  await supabaseAdmin
    .from("telegram_reminders")
    .update({ last_sent_date: date })
    .eq("id", id);
}

// ---- Favoritos ----
export async function addFavorite(chatId: number, stopId: string, alias?: string) {
  await supabaseAdmin.from("telegram_favorites").upsert(
    { chat_id: chatId, stop_id: stopId, alias: alias ?? null },
    { onConflict: "chat_id,stop_id" }
  );
}

export async function listFavorites(chatId: number) {
  const { data } = await supabaseAdmin
    .from("telegram_favorites")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function removeFavorite(chatId: number, stopId: string) {
  await supabaseAdmin
    .from("telegram_favorites")
    .delete()
    .eq("chat_id", chatId)
    .eq("stop_id", stopId);
}

// ---- Avisos automáticos ----
export async function setAlertsOptIn(chatId: number, optIn: boolean) {
  await supabaseAdmin
    .from("telegram_users")
    .update({ alerts_opt_in: optIn })
    .eq("chat_id", chatId);
}

export async function getAlertsOptIn(chatId: number): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("telegram_users")
    .select("alerts_opt_in")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data?.alerts_opt_in ?? true;
}

export async function listAlertOptInChatIds(): Promise<number[]> {
  const { data } = await supabaseAdmin
    .from("telegram_users")
    .select("chat_id")
    .eq("alerts_opt_in", true);
  return (data ?? []).map((r: any) => Number(r.chat_id));
}

export async function listActiveServiceAlerts() {
  const nowIso = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from("service_alerts")
    .select("*")
    .eq("active", true)
    .lte("starts_at", nowIso);
  return (data ?? []).filter((a: any) => !a.ends_at || a.ends_at > nowIso);
}

export async function chatAlreadyNotified(chatId: number, alertId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("telegram_alert_notified")
    .select("id")
    .eq("chat_id", chatId)
    .eq("alert_id", alertId)
    .maybeSingle();
  return !!data;
}

export async function markAlertNotified(chatId: number, alertId: string) {
  await supabaseAdmin
    .from("telegram_alert_notified")
    .insert({ chat_id: chatId, alert_id: alertId });
}