import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendMessage } from "@/lib/telegram/api";
import { getAdminSession } from "./session.server";

const schema = z.object({
  text: z.string().trim().min(1, "Texto vacío").max(3500, "Máximo 3500 caracteres"),
});

export const sendIncident = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const session = await getAdminSession();
    if (!session.data.admin) {
      return { ok: false as const, error: "No autenticado" };
    }
    const { broadcastPush } = await import("@/lib/push/send.server");
    const push = await broadcastPush({ title: "🚧 Incidencia", body: data.text.slice(0, 300), url: "/avisos" });
    const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;
    if (!chatId) {
      return push.sent > 0 ? { ok: true as const } : { ok: false as const, error: "TELEGRAM_ALERTS_CHAT_ID no configurado" };
    }
    try {
      const res = await sendMessage(chatId, `🚧 <b>Incidencia</b>\n\n${data.text}`);
      if (!res?.ok) {
        return { ok: false as const, error: res?.description || "Telegram no respondió correctamente" };
      }
    } catch (e) {
      return { ok: false as const, error: `No se pudo contactar con Telegram: ${(e as Error).message}` };
    }
    return { ok: true as const };
  });