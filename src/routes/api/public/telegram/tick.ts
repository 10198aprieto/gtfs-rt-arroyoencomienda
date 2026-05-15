import { createFileRoute } from "@tanstack/react-router";
import { runTick } from "@/lib/telegram/scheduler.server";

export const Route = createFileRoute("/api/public/telegram/tick")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runTick();
          return Response.json({ ok: true, ...result });
        } catch (e: any) {
          console.error("tick error", e);
          return Response.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
        }
      },
      GET: async () => {
        const result = await runTick();
        return Response.json({ ok: true, ...result });
      },
    },
  },
});