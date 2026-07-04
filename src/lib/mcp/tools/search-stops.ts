import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { searchStops, findStop } from "@/lib/telegram/stops";

export default defineTool({
  name: "search_stops",
  title: "Buscar paradas",
  description:
    "Busca paradas de ArroyoBus por número o nombre. Devuelve id, nombre y coordenadas.",
  inputSchema: {
    query: z.string().min(1).describe("Número de parada o texto del nombre."),
    limit: z.number().int().min(1).max(20).optional().describe("Máximo de resultados (por defecto 8)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limit }) => {
    const exact = findStop(query);
    const many = searchStops(query, limit ?? 8);
    const seen = new Set<string>();
    const results = [exact, ...many]
      .filter((s): s is NonNullable<typeof s> => !!s)
      .filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
      .map((s) => ({ id: s.id, name: s.name, lat: s.lat, lon: s.lon }));
    if (!results.length) {
      return { content: [{ type: "text", text: `Sin resultados para "${query}".` }] };
    }
    const text = results.map((s) => `${s.id} · ${s.name}`).join("\n");
    return { content: [{ type: "text", text }], structuredContent: { results } };
  },
});