import fs from "fs";
const stops = JSON.parse(fs.readFileSync("src/data/stops.json","utf8"));
const slugify = (s) => s.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/&/g," y ")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
const used = new Map();
const map = {};
for (const s of stops) {
  let slug = slugify(s.name);
  if (used.has(slug)) slug = `${slug}-${s.id}`;
  used.set(slug, true);
  map[s.id] = slug;
}
const inverse = Object.fromEntries(Object.entries(map).map(([id,sl]) => [sl, id]));
const out = `// AUTO-GENERATED. Run scripts/gen-stop-slugs.mjs to refresh.
export const STOP_ID_TO_SLUG: Record<string,string> = ${JSON.stringify(map,null,2)};
export const SLUG_TO_STOP_ID: Record<string,string> = ${JSON.stringify(inverse,null,2)};
export function slugForStop(id: string): string | undefined { return STOP_ID_TO_SLUG[String(id)]; }
export function stopIdForSlug(slug: string): string | undefined { return SLUG_TO_STOP_ID[slug]; }
`;
fs.mkdirSync("scripts",{recursive:true});
fs.writeFileSync("scripts/gen-stop-slugs.mjs", fs.readFileSync(new URL(import.meta.url),"utf8"));
fs.writeFileSync("src/data/stop-slugs.ts", out);
console.log("OK", Object.keys(map).length, "stops");
