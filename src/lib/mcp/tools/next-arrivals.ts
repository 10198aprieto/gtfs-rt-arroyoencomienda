import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { lookupStop } from "@/lib/voice/query.server";

export default defineTool({
  name: "next_arrivals",
  title: "Próximas llegadas",
  description:
    "Devuelve las próximas llegadas de autobús a una parada de ArroyoBus (Arroyo de la Encomienda). Acepta número o nombre.",
  inputSchema: {
    stop: z.string().min(1).describe("Número o nombre de parada. Ej: '100' o 'Plaza España'."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ stop }) => {
    const r = await lookupStop(stop);
    return {
      content: [{ type: "text", text: r.text }],
      structuredContent: {
        ok: r.ok,
        stopId: r.stopId,
        stopName: r.stopName,
        arrivals: r.arrivals,
        suggestions: r.suggestions,
      },
    };
  },
});