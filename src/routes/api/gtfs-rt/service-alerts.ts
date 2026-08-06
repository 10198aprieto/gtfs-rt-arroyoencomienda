import { createFileRoute } from "@tanstack/react-router";
import { buildServiceAlertsFeed, buildServiceAlertsJson, type AlertRow } from "@/lib/gtfsrt/encode-alerts";

export const Route = createFileRoute("/api/gtfs-rt/service-alerts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const nowIso = new Date().toISOString();
        const { data, error } = await supabaseAdmin
          .from("service_alerts")
          .select("id,header,description,cause,effect,stop_ids,route_ids,url,starts_at,ends_at")
          .eq("active", true)
          .lte("starts_at", nowIso)
          .order("starts_at", { ascending: false })
          .limit(200);

        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }

        const alerts = ((data ?? []) as AlertRow[]).filter((a) => !a.ends_at || a.ends_at > nowIso);

        if (format === "json") {
          return Response.json(buildServiceAlertsJson(alerts), {
            headers: { "Cache-Control": "public, max-age=15", "Access-Control-Allow-Origin": "*" },
          });
        }

        const body = buildServiceAlertsFeed(alerts);
        return new Response(body, {
          headers: {
            "Content-Type": "application/x-protobuf",
            "Cache-Control": "public, max-age=15",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
