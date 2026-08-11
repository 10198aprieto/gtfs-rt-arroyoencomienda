// Regenera src/data/stops.json y src/data/schedule.json desde un GTFS estático descomprimido.
// Uso: node scripts/gen-gtfs-data.mjs /ruta/gtfs
import fs from "fs";
import path from "path";

const dir = process.argv[2];
if (!dir) { console.error("Uso: node scripts/gen-gtfs-data.mjs <dir-gtfs>"); process.exit(1); }

function parseCsv(file) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8").replace(/^\uFEFF/, "").trim();
  const rows = [];
  let field = "", row = [], inQ = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQ) {
      if (c === '"') { if (raw[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  row.push(field); rows.push(row);
  const head = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const stops = parseCsv("stops.txt").map((s) => ({
  id: s.stop_id, name: s.stop_name, desc: s.stop_desc || undefined,
  lat: Number(s.stop_lat), lon: Number(s.stop_lon),
}));

const routes = Object.fromEntries(parseCsv("routes.txt").map((r) => [r.route_id, r]));
const trips = Object.fromEntries(parseCsv("trips.txt").map((t) => [t.trip_id, t]));

// days index: 0 = domingo ... 6 = sábado
const services = {};
for (const c of parseCsv("calendar.txt")) {
  services[c.service_id] = {
    days: [c.sunday, c.monday, c.tuesday, c.wednesday, c.thursday, c.friday, c.saturday].map((v) => v === "1"),
    start: c.start_date, end: c.end_date,
  };
}

const toSec = (t) => { const [h, m, s] = t.split(":").map(Number); return h * 3600 + m * 60 + (s || 0); };

const byStop = {};
for (const st of parseCsv("stop_times.txt")) {
  const trip = trips[st.trip_id];
  if (!trip || !services[trip.service_id]) continue;
  const route = routes[trip.route_id] ?? {};
  (byStop[st.stop_id] ||= []).push({
    tripId: trip.trip_id,
    serviceId: trip.service_id,
    routeId: trip.route_id,
    routeShortName: route.route_short_name || trip.route_id,
    routeColor: route.route_color || "888888",
    headsign: st.stop_headsign || trip.trip_headsign || "",
    sec: toSec(st.departure_time || st.arrival_time),
  });
}
for (const k of Object.keys(byStop)) byStop[k].sort((a, b) => a.sec - b.sec);

fs.writeFileSync("src/data/stops.json", JSON.stringify(stops, null, 2) + "\n");
fs.writeFileSync("src/data/schedule.json", JSON.stringify({ services, stops: byStop }) + "\n");
console.log("stops:", stops.length, "| paradas con horario:", Object.keys(byStop).length, "| servicios:", Object.keys(services).length);
