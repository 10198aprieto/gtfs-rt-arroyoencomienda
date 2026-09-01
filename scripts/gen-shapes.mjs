import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const tmp = "/tmp/gtfs-shapes";
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
execSync(`unzip -o -q public/GTFS_Static.zip -d ${tmp}`);

const parse = (f) => {
  const txt = fs.readFileSync(path.join(tmp, f), "utf8").replace(/^\uFEFF/, "");
  const [head, ...rows] = txt.trim().split(/\r?\n/);
  const cols = head.split(",");
  return rows.map((r) => Object.fromEntries(r.split(",").map((v, i) => [cols[i], v?.trim()])));
};

const shapes = {};
for (const p of parse("shapes.txt")) {
  (shapes[p.shape_id] ??= []).push([Number(p.shape_pt_lat), Number(p.shape_pt_lon), Number(p.shape_pt_sequence)]);
}
const out = {};
for (const [id, pts] of Object.entries(shapes)) {
  pts.sort((a, b) => a[2] - b[2]);
  out[id] = pts.map(([la, lo]) => [Number(la.toFixed(5)), Number(lo.toFixed(5))]);
}
fs.writeFileSync("src/data/shapes.json", JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.length}`).join("\n"));
