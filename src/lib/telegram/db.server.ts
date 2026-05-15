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