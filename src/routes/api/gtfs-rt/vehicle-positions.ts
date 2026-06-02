import { createFileRoute } from "@tanstack/react-router";
import { fetchAllVehiclePositions, type VehiclePosition, type ArrivalData } from "@/lib/gtfsrt/fetch-arrivals";
import { buildVehiclePositionsFeed, buildVehiclePositionsJson } from "@/lib/gtfsrt/encode";

function toArrival(v: VehiclePosition): ArrivalData {
  return {
    tripId: "",
    vehicleId: v.vehicleId,
    routeId: v.routeId,
    routeName: v.routeId,
    stopId: "",
    stopName: "",
    estimatedArrival: v.timestamp ?? Math.floor(Date.now() / 1000),
    lat: v.lat,
    lon: v.lon,
    speed: v.speed,
    bearing: v.bearing,
    routeShortName: v.routeId === "Roja" ? "R" : v.routeId === "Azul" ? "A" : v.routeId,
    routeColor: v.routeId === "Roja" ? "ca0d32" : v.routeId === "Azul" ? "3b4cd1" : undefined,
    tripHeadsign: v.vehicleName,
  };
}

export const Route = createFileRoute("/api/gtfs-rt/vehicle-positions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        const vehicles = await fetchAllVehiclePositions();
        const arrivals: ArrivalData[] = vehicles.map(toArrival);

        if (format === "json") {
          return Response.json(buildVehiclePositionsJson(arrivals), {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "public, max-age=15",
            },
          });
        }

        const pb = buildVehiclePositionsFeed(arrivals);
        return new Response(pb.buffer as ArrayBuffer, {
          headers: {
            "Content-Type": "application/x-protobuf",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=15",
          },
        });
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      },
    },
  },
});
