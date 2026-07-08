const API_BASE = "https://api.telegram.org";

function getToken(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN;
  if (!t) throw new Error("TELEGRAM_BOT_TOKEN no configurado");
  return t;
}

async function call(method: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`${API_BASE}/bot${getToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) {
    console.error("Telegram API error", method, res.status, json);
  }
  return json;
}

export function sendMessage(chatId: number | string, text: string, opts: Record<string, unknown> = {}) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...opts,
  });
}

export function sendLocation(chatId: number | string, latitude: number, longitude: number, opts: Record<string, unknown> = {}) {
  return call("sendLocation", { chat_id: chatId, latitude, longitude, ...opts });
}

export function editMessageText(chatId: number | string, messageId: number, text: string, opts: Record<string, unknown> = {}) {
  return call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...opts,
  });
}

export function answerCallbackQuery(id: string, text?: string, showAlert = false) {
  return call("answerCallbackQuery", {
    callback_query_id: id,
    ...(text ? { text } : {}),
    show_alert: showAlert,
  });
}

export function setWebhook(url: string, secretToken?: string) {
  return call("setWebhook", {
    url,
    allowed_updates: ["message", "edited_message", "callback_query"],
    ...(secretToken ? { secret_token: secretToken } : {}),
  });
}

export function deleteWebhook() {
  return call("deleteWebhook", { drop_pending_updates: false });
}

export function getWebhookInfo() {
  return call("getWebhookInfo", {});
}