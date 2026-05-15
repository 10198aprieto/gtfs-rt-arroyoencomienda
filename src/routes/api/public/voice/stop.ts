import { createFileRoute } from "@tanstack/react-router";
import { lookupStop } from "@/lib/voice/query.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handle(query: string) {
  const r = await lookupStop(query);
  return Response.json(r, {
    headers: { ...CORS, "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/voice/stop")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q") || url.searchParams.get("query") || "";
        return handle(q);
      },
      POST: async ({ request }) => {
        let q = "";
        try {
          const ct = request.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const body: any = await request.json();
            q = String(body?.q || body?.query || body?.text || "");
          } else {
            const form = await request.formData();
            q = String(form.get("q") || form.get("query") || form.get("text") || "");
          }
        } catch {}
        return handle(q);
      },
    },
  },
});