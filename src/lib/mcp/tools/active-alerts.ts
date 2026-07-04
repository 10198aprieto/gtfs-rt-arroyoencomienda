import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "active_alerts",
  title: "Avisos activos",
  description:
    "Lista los avisos de servicio activos de ArroyoBus (incidencias, desvíos, paradas suspendidas).",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Máximo de avisos (por defecto 20)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("service_alerts")
      .select("*")
      .eq("active", true)
      .lte("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
    const alerts = (data || []).filter((a: any) => !a.ends_at || a.ends_at > nowIso);
    if (!alerts.length) {
      return { content: [{ type: "text", text: "No hay avisos activos." }], structuredContent: { alerts: [] } };
    }
    const text = alerts
      .map((a: any) => `• ${a.header}${a.description ? ` — ${a.description}` : ""}`)
      .join("\n");
    return { content: [{ type: "text", text }], structuredContent: { alerts } };
  },
});