// GTFS-RT ServiceAlerts encoder (manual protobuf, no native deps)

export type AlertRow = {
  id: string;
  header: string;
  description: string | null;
  cause: string;
  effect: string;
  stop_ids: string[] | null;
  route_ids: string[] | null;
  url: string | null;
  starts_at: string;
  ends_at: string | null;
};

const VARINT = 0;
const LENGTH_DELIMITED = 2;

function varint(value: number): number[] {
  const bytes: number[] = [];
  let v = Math.max(0, Math.floor(value)) >>> 0;
  while (v > 0x7f) { bytes.push((v & 0x7f) | 0x80); v >>>= 7; }
  bytes.push(v & 0x7f);
  return bytes;
}
const tag = (f: number, w: number) => varint((f << 3) | w);
function str(f: number, v: string): number[] {
  const e = new TextEncoder().encode(v);
  return [...tag(f, LENGTH_DELIMITED), ...varint(e.length), ...e];
}
const uint = (f: number, v: number) => [...tag(f, VARINT), ...varint(v)];
function msg(f: number, content: number[]): number[] {
  return [...tag(f, LENGTH_DELIMITED), ...varint(content.length), ...content];
}

const CAUSE_ENUM: Record<string, number> = {
  UNKNOWN_CAUSE: 1, OTHER_CAUSE: 2, TECHNICAL_PROBLEM: 3, STRIKE: 4, DEMONSTRATION: 5,
  ACCIDENT: 6, HOLIDAY: 7, WEATHER: 8, MAINTENANCE: 9, CONSTRUCTION: 10,
  POLICE_ACTIVITY: 11, MEDICAL_EMERGENCY: 12,
};
const EFFECT_ENUM: Record<string, number> = {
  NO_SERVICE: 1, REDUCED_SERVICE: 2, SIGNIFICANT_DELAYS: 3, DETOUR: 4, ADDITIONAL_SERVICE: 5,
  MODIFIED_SERVICE: 6, OTHER_EFFECT: 7, UNKNOWN_EFFECT: 8, STOP_MOVED: 9, NO_EFFECT: 10,
  ACCESSIBILITY_ISSUE: 11,
};

function translated(field: number, text: string): number[] {
  const translation = [...str(1, text), ...str(2, "es")];
  return msg(field, msg(1, translation));
}

function encodeAlert(a: AlertRow): number[] {
  const start = Math.floor(new Date(a.starts_at).getTime() / 1000);
  const end = a.ends_at ? Math.floor(new Date(a.ends_at).getTime() / 1000) : null;
  const period = [...uint(1, start), ...(end ? uint(2, end) : [])];

  const informed: number[] = [];
  for (const r of a.route_ids ?? []) informed.push(...msg(5, str(2, r)));
  for (const s of a.stop_ids ?? []) informed.push(...msg(5, str(5, s)));
  if (informed.length === 0) informed.push(...msg(5, str(1, "arroyobus")));

  return [
    ...msg(1, period),
    ...informed,
    ...uint(6, CAUSE_ENUM[a.cause] ?? 1),
    ...uint(7, EFFECT_ENUM[a.effect] ?? 8),
    ...(a.url ? translated(8, a.url) : []),
    ...translated(10, a.header),
    ...(a.description ? translated(11, a.description) : []),
  ];
}

export function buildServiceAlertsFeed(alerts: AlertRow[]): Uint8Array {
  const now = Math.floor(Date.now() / 1000);
  const header = [...str(1, "2.0"), ...uint(2, 0), ...uint(4, now)];
  const parts: number[] = [...msg(1, header)];
  for (const a of alerts) {
    const entity = [...str(1, a.id), ...msg(5, encodeAlert(a))];
    parts.push(...msg(2, entity));
  }
  return new Uint8Array(parts);
}

export function buildServiceAlertsJson(alerts: AlertRow[]) {
  const now = Math.floor(Date.now() / 1000);
  return {
    header: { gtfsRealtimeVersion: "2.0", incrementality: "FULL_DATASET", timestamp: now },
    entity: alerts.map((a) => ({
      id: a.id,
      alert: {
        activePeriod: [{
          start: Math.floor(new Date(a.starts_at).getTime() / 1000),
          ...(a.ends_at ? { end: Math.floor(new Date(a.ends_at).getTime() / 1000) } : {}),
        }],
        informedEntity: [
          ...(a.route_ids ?? []).map((routeId) => ({ routeId })),
          ...(a.stop_ids ?? []).map((stopId) => ({ stopId })),
          ...((a.route_ids?.length || a.stop_ids?.length) ? [] : [{ agencyId: "arroyobus" }]),
        ],
        cause: a.cause,
        effect: a.effect,
        ...(a.url ? { url: { translation: [{ text: a.url, language: "es" }] } } : {}),
        headerText: { translation: [{ text: a.header, language: "es" }] },
        ...(a.description ? { descriptionText: { translation: [{ text: a.description, language: "es" }] } } : {}),
      },
    })),
  };
}
