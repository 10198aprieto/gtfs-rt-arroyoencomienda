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
    const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;
    if (!chatId) {
      return { ok: false as const, error: "TELEGRAM_ALERTS_CHAT_ID no configurado" };
    }
    const res = await sendMessage(chatId, `🚧 <b>Incidencia</b>\n\n${data.text}`);
    if (!res?.ok) {
      return { ok: false as const, error: res?.description || "Telegram rechazó el mensaje" };
    }
    return { ok: true as const };
  });