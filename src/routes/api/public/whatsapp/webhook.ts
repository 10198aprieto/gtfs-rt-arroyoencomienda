import { createFileRoute } from "@tanstack/react-router";
import { lookupStop } from "@/lib/voice/query.server";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function twiml(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

const HELP = [
  "🚍 ArroyoBus por WhatsApp",
  "",
  "Escribe el número o el nombre de una parada para ver las próximas llegadas.",
  "Ej: 100, Camino Viejo, Plaza...",
  "",
  "Comandos:",
  "• ayuda — muestra esta ayuda",
].join("\n");

export const Route = createFileRoute("/api/public/whatsapp/webhook")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true, hint: "Twilio WhatsApp webhook (POST application/x-www-form-urlencoded)" }),
      POST: async ({ request }) => {
        let body = "";
        try {
          const form = await request.formData();
          body = String(form.get("Body") || "").trim();
        } catch {
          return twiml("⚠️ No he podido leer tu mensaje.");
        }
        if (!body) return twiml(HELP);
        const lower = body.toLowerCase();
        if (["ayuda", "help", "start", "hola", "/start"].includes(lower)) {
          return twiml(HELP);
        }
        try {
          const r = await lookupStop(body);
          let msg = r.text;
          const next = r.arrivals.find((a) => a.lat && a.lon);
          if (next) {
            msg += `\n\n📍 Bus L${next.route}: https://www.google.com/maps?q=${next.lat},${next.lon}`;
          }
          return twiml(msg);
        } catch (e) {
          console.error("whatsapp webhook error", e);
          return twiml("⚠️ Error consultando llegadas. Inténtalo de nuevo.");
        }
      },
    },
  },
});