// Genera src/data/auvasa/{stops,patterns,trips}.json desde el GTFS de AUVASA.
// Fuente: repositorio api-auvasa de VallaBus (https://github.com/VallaBus/api-auvasa)
// Uso: node scripts/gen-auvasa.mjs [ruta-al-zip]
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync } from "child_process";

const GTFS_URL = "http://212.170.201.204:50080/GTFSRTapi/api/gtfsfile";
const OUT_DIR = "src/data/auvasa";

function parseCsv(raw) {
  raw = raw.replace(/^\uFEFF/, "").trim();
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "auvasa-"));
let zipPath = process.argv[2];
if (!zipPath) {
  zipPath = path.join(tmp, "auvasa.zip");
  console.log("Descargando GTFS de AUVASA…");
  execFileSync("curl", ["-sL", "--max-time", "120", "-o", zipPath, GTFS_URL]);
}
execFileSync("unzip", ["-o", "-q", zipPath, "-d", tmp]);
const read = (f) => parseCsv(fs.readFileSync(path.join(tmp, f), "utf8"));

const toSec = (t) => { const [h, m, s] = String(t).split(":").map(Number); return h * 3600 + m * 60 + (s || 0); };

const stopsRaw = read("stops.txt");
const stops = stopsRaw.map((s) => ({
  id: s.stop_id,
  code: s.stop_code || undefined,
  name: s.stop_name,
  lat: Number(s.stop_lat),
  lon: Number(s.stop_lon),
}));

const routes = Object.fromEntries(read("routes.txt").map((r) => [r.route_id, r]));
const tripsRaw = Object.fromEntries(read("trips.txt").map((t) => [t.trip_id, t]));

// stop_times agrupados por viaje
const byTrip = new Map();
for (const st of read("stop_times.txt")) {
  if (!tripsRaw[st.trip_id]) continue;
  let arr = byTrip.get(st.trip_id);
  if (!arr) { arr = []; byTrip.set(st.trip_id, arr); }
  arr.push({ seq: Number(st.stop_sequence), stop: st.stop_id, sec: toSec(st.departure_time || st.arrival_time) });
}

const patterns = [];
const patternIndex = new Map();
const trips = [];
const usedServices = new Set();

for (const [tripId, list] of byTrip) {
  if (list.length < 2) continue;
  list.sort((a, b) => a.seq - b.seq);
  const t = tripsRaw[tripId];
  const route = routes[t.route_id] ?? {};
  const stopIds = list.map((x) => x.stop);
  const key = `${t.route_id}|${t.direction_id || "0"}|${stopIds.join(",")}`;
  let idx = patternIndex.get(key);
  if (idx === undefined) {
    const base = list[0].sec;
    idx = patterns.length;
    patternIndex.set(key, idx);
    patterns.push({
      routeId: t.route_id,
      short: route.route_short_name || t.route_id,
      long: route.route_long_name || "",
      color: route.route_color || "005CA9",
      headsign: t.trip_headsign || "",
      stops: stopIds,
      offsets: list.map((x) => x.sec - base),
    });
  }
  trips.push({ p: idx, s: t.service_id, t: list[0].sec });
  usedServices.add(t.service_id);
}
trips.sort((a, b) => a.t - b.t);

// Días de servicio: calendar.txt (si trae filas) + calendar_dates.txt
const services = {};
let calendar = [];
try { calendar = read("calendar.txt"); } catch { /* opcional */ }
for (const c of calendar) {
  if (!usedServices.has(c.service_id)) continue;
  services[c.service_id] = {
    days: [c.sunday, c.monday, c.tuesday, c.wednesday, c.thursday, c.friday, c.saturday].map((v) => v === "1"),
    start: c.start_date,
    end: c.end_date,
    dates: [],
    except: [],
  };
}
let dates = [];
try { dates = read("calendar_dates.txt"); } catch { /* opcional */ }
for (const d of dates) {
  if (!usedServices.has(d.service_id)) continue;
  const s = (services[d.service_id] ||= { days: [false, false, false, false, false, false, false], start: "", end: "", dates: [], except: [] });
  if (d.exception_type === "1") s.dates.push(d.date);
  else s.except.push(d.date);
}
for (const s of Object.values(services)) { s.dates.sort(); s.except.sort(); }

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "stops.json"), JSON.stringify(stops) + "\n");
fs.writeFileSync(path.join(OUT_DIR, "patterns.json"), JSON.stringify(patterns) + "\n");
fs.writeFileSync(path.join(OUT_DIR, "trips.json"), JSON.stringify({ services, trips }) + "\n");

console.log(
  "AUVASA →",
  stops.length, "paradas |",
  patterns.length, "patrones |",
  trips.length, "viajes |",
  Object.keys(services).length, "servicios",
);
