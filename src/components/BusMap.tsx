import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import stops from "@/data/stops.json";

interface VehicleEntity {
  id: string;
  vehicle?: {
    trip?: { tripId?: string; routeId?: string };
    position?: { latitude?: number; longitude?: number; speed?: number; bearing?: number };
    vehicle?: { id?: string; label?: string };
    timestamp?: number;
  };
}

interface FeedResponse {
  header?: { timestamp?: number };
  entity?: VehicleEntity[];
}

const ARROYO_CENTER: [number, number] = [41.6167, -4.7836];
const REFRESH_INTERVAL = 15_000;

export default function BusMap() {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const stopMarkersRef = useRef<Map<string, any>>(new Map());
  const stopPopupTimers = useRef<Map<string, any>>(new Map());
  const leafletRef = useRef<any>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch("/api/gtfs-rt/vehicle-positions?format=json");
      if (!res.ok) return;
      const data: FeedResponse = await res.json();
      const entities = data.entity ?? [];

      const map = mapRef.current;
      const L = leafletRef.current;
      if (!map || !L) return;

      const busIcon = L.divIcon({
        html: `<div style="background:hsl(221,83%,53%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M18 18H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
        </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const activeIds = new Set<string>();

      for (const e of entities) {
        const pos = e.vehicle?.position;
        if (!pos?.latitude || !pos?.longitude) continue;

        const id = e.id;
        activeIds.add(id);
        const latlng: [number, number] = [pos.latitude, pos.longitude];

        const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        const label = esc(String(e.vehicle?.vehicle?.label || e.vehicle?.vehicle?.id || id));
        const route = esc(String(e.vehicle?.trip?.routeId || "—"));
        const speed = pos.speed != null ? `${(pos.speed * 3.6).toFixed(0)} km/h` : "—";

        const popupContent = `
          <div style="font-family:system-ui;font-size:13px;line-height:1.5">
            <strong>🚍 ${label}</strong><br/>
            Ruta: <strong>${route}</strong><br/>
            Velocidad: ${speed}
          </div>`;

        const existing = markersRef.current.get(id);
        if (existing) {
          existing.setLatLng(latlng);
          existing.setPopupContent(popupContent);
        } else {
          const marker = L.marker(latlng, { icon: busIcon })
            .bindPopup(popupContent)
            .addTo(map);
          markersRef.current.set(id, marker);
        }
      }

      for (const [id, marker] of markersRef.current) {
        if (!activeIds.has(id)) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
      }

      setCount(activeIds.size);
      setLastUpdate(new Date().toLocaleTimeString("es-ES"));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      leafletRef.current = L.default || L;
      const Leaf = leafletRef.current;

      const map = Leaf.map(containerRef.current, {
        center: ARROYO_CENTER,
        zoom: 14,
        zoomControl: true,
      });

      Leaf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // --- Paradas (GTFS estático) ---
      const stopIcon = Leaf.divIcon({
        html: `<div style="background:white;width:14px;height:14px;border-radius:50%;border:2.5px solid hsl(221,83%,53%);box-shadow:0 1px 3px rgba(0,0,0,.3);"></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8],
      });

      const renderArrivals = async (stopId: string, stopName: string) => {
        try {
          const res = await fetch(`/api/stops/${stopId}`);
          if (!res.ok) return `<div style="font-family:system-ui;font-size:13px"><strong>${stopName}</strong><br/><span style="color:#888">Sin datos</span></div>`;
          const data = await res.json();
          const list = (data.arrivals || []) as Array<any>;
          const rows = list.length
            ? list.map((a) => {
                const color = a.routeColor ? `#${a.routeColor}` : "hsl(221,83%,53%)";
                const short = (a.routeShortName || a.routeName || "—").toString();
                const head = (a.tripHeadsign || "").toString();
                const time = new Date(a.estimatedArrival * 1000).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
                const min = a.isScheduled
                  ? `${time} (horario)`
                  : (a.minutesAway === 0 ? "Ahora" : `${a.minutesAway} min`);
                return `<tr>
                  <td style="padding:4px 6px"><span style="display:inline-block;background:${color};color:#fff;font-weight:600;font-size:11px;padding:2px 7px;border-radius:10px">${short}</span></td>
                  <td style="padding:4px 6px;color:#444;font-size:12px">${head}</td>
                  <td style="padding:4px 6px;text-align:right;font-weight:600;font-size:12px">${min}</td>
                </tr>`;
              }).join("")
            : `<tr><td colspan="3" style="padding:8px;color:#888;font-size:12px;text-align:center">Sin llegadas próximas</td></tr>`;
          return `<div style="font-family:system-ui;min-width:240px">
            <div style="font-weight:600;font-size:13px;margin-bottom:6px">${stopName}</div>
            <div style="font-size:11px;color:#888;margin-bottom:4px">Parada ${stopId}</div>
            <table style="border-collapse:collapse;width:100%">${rows}</table>
          </div>`;
        } catch {
          return `<div style="font-family:system-ui;font-size:13px"><strong>${stopName}</strong><br/><span style="color:#888">Error</span></div>`;
        }
      };

      for (const s of stops as Array<{ id: string; name: string; lat: number; lon: number }>) {
        const m = Leaf.marker([s.lat, s.lon], { icon: stopIcon }).addTo(map);
        m.bindPopup(`<div style="font-family:system-ui;font-size:13px"><strong>${s.name}</strong><br/><span style="color:#888">Cargando llegadas…</span></div>`);
        m.on("popupopen", async () => {
          const html = await renderArrivals(s.id, s.name);
          m.setPopupContent(html);
          // refresh while open every 15s
          const t = setInterval(async () => {
            const h = await renderArrivals(s.id, s.name);
            m.setPopupContent(h);
          }, 15000);
          stopPopupTimers.current.set(s.id, t);
        });
        m.on("popupclose", () => {
          const t = stopPopupTimers.current.get(s.id);
          if (t) { clearInterval(t); stopPopupTimers.current.delete(s.id); }
        });
        stopMarkersRef.current.set(s.id, m);
      }

      fetchVehicles();
    })();

    const interval = setInterval(fetchVehicles, REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
      for (const t of stopPopupTimers.current.values()) clearInterval(t);
      stopPopupTimers.current.clear();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current.clear();
      stopMarkersRef.current.clear();
    };
  }, [fetchVehicles]);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">
            {loading ? "Cargando…" : `${count} bus${count !== 1 ? "es" : ""} activo${count !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastUpdate}
            </span>
          )}
          <button
            onClick={fetchVehicles}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="h-[400px] w-full" />
    </div>
  );
}
