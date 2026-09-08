import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const pointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  label: z.string().max(160).optional(),
});

const inputSchema = z.object({
  from: z.union([pointSchema, z.string().min(2).max(160)]),
  to: z.union([pointSchema, z.string().min(2).max(160)]),
});

export type PlanInput = z.infer<typeof inputSchema>;

export const planTripFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { geocode, planTrip } = await import("./plan.server");

    async function resolve(v: PlanInput["from"], fallbackLabel: string) {
      if (typeof v === "string") {
        const g = await geocode(v);
        return g ? { ...g } : null;
      }
      return { lat: v.lat, lon: v.lon, label: v.label || fallbackLabel };
    }

    const origin = await resolve(data.from, "Tu ubicación");
    const destination = await resolve(data.to, "Tu destino");
    if (!origin) return { error: "No hemos encontrado el punto de partida." as const, result: null };
    if (!destination) return { error: "No hemos encontrado ese destino." as const, result: null };

    const result = await planTrip(origin, destination);
    return { error: null, result };
  });
