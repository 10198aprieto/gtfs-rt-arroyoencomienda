import { createFileRoute } from "@tanstack/react-router";
import { handleUpdate } from "@/lib/telegram/commands.server";
import { isUpdateProcessed, markUpdateProcessed } from "@/lib/telegram/db.server";

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let update: any;
        try {
          update = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const updateId = update?.update_id;
        if (typeof updateId !== "number") {
          return Response.json({ ok: true, ignored: true });
        }

        // Idempotencia: Telegram reenvía si no respondemos rápido
        if (await isUpdateProcessed(updateId)) {
          return Response.json({ ok: true, duplicate: true });
        }
        await markUpdateProcessed(updateId);

        try {
          await handleUpdate(update);
        } catch (e) {
          console.error("webhook handleUpdate error", e);
        }
        return Response.json({ ok: true });
      },
      GET: async () => Response.json({ ok: true, hint: "POST only" }),
    },
  },
});