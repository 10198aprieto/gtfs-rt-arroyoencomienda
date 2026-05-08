import { createFileRoute } from "@tanstack/react-router";
import { sendMessage } from "@/lib/telegram/api";

export const Route = createFileRoute("/api/public/telegram/broadcast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const adminToken = process.env.TELEGRAM_ADMIN_TOKEN;
        const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;
        if (!adminToken || !chatId) {
          return Response.json({ ok: false, error: "Canal de incidencias no configurado" }, { status: 503 });
        }
        const auth = request.headers.get("authorization") || "";
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : request.headers.get("x-admin-token") || "";
        if (provided !== adminToken) {
          return new Response("Unauthorized", { status: 401 });
        }
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const text = String(body?.text || "").trim();
        if (!text || text.length > 3500) {
          return Response.json({ ok: false, error: "text requerido (1..3500)" }, { status: 400 });
        }
        const res = await sendMessage(chatId, `🚧 <b>Incidencia</b>\n\n${text}`);
        return Response.json({ ok: !!res?.ok, telegram: res });
      },
    },
  },
});