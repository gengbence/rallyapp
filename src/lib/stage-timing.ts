/**
 * GPS alapú szakaszidő-mérés.
 *
 * A rajt és a cél egy-egy "kapu": egy pont, a menetirány (bearing) és egy
 * sugár. A kapu egy, a menetirányra merőleges szakasz. Akkor számít
 * áthaladásnak, ha két egymást követő GPS mérés a kapuvonal két oldalára
 * esik, és az áthaladási pont a sugáron belül van. Az áthaladás időpontját
 * a két mérés között lineárisan interpoláljuk, így 1 Hz-es GPS mellett is
 * tized másodperces felbontást kapunk.
 */

export type GeoPoint = { lat: number; lng: number };

export type Fix = GeoPoint & {
  /** Unix idő ezredmásodpercben. */
  t: number;
  /** Becsült pontosság méterben, ha a GPS megadja. */
  accuracy?: number;
};

export type Gate = {
  center: GeoPoint;
  /** Menetirány fokban, 0 = észak, 90 = kelet. */
  bearingDeg: number;
  /** A kapu fél szélessége méterben. */
  radiusM: number;
};

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineM(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Pont helyi síkkoordinátái (méter, x = kelet, y = észak) az origóhoz képest. */
function toLocal(origin: GeoPoint, p: GeoPoint): { x: number; y: number } {
  const x = toRad(p.lng - origin.lng) * Math.cos(toRad(origin.lat)) * EARTH_RADIUS_M;
  const y = toRad(p.lat - origin.lat) * EARTH_RADIUS_M;
  return { x, y };
}

/**
 * Ha a prev -> curr mozgás menetirányban átlépte a kaput, visszaadja az
 * interpolált áthaladási időt (ms), különben null-t.
 */
export function gateCrossingTime(prev: Fix, curr: Fix, gate: Gate): number | null {
  const b = toRad(gate.bearingDeg);
  // Menetirány egységvektora (x = kelet, y = észak).
  const dir = { x: Math.sin(b), y: Math.cos(b) };
  const p = toLocal(gate.center, prev);
  const c = toLocal(gate.center, curr);
  // Előjeles távolság a kapuvonaltól a menetirány mentén.
  const along = (q: { x: number; y: number }) => q.x * dir.x + q.y * dir.y;
  const across = (q: { x: number; y: number }) => q.x * dir.y - q.y * dir.x;
  const ap = along(p);
  const ac = along(c);
  // Csak hátulról előre (menetirányban) történő áthaladás számít.
  if (!(ap < 0 && ac >= 0)) return null;
  const f = ap === ac ? 0 : -ap / (ac - ap);
  const lateral = across(p) + f * (across(c) - across(p));
  if (Math.abs(lateral) > gate.radiusM) return null;
  return prev.t + f * (curr.t - prev.t);
}

export type TimerState =
  | { status: 'armed' }
  | { status: 'running'; startT: number; distanceM: number; last: Fix }
  | { status: 'finished'; startT: number; finishT: number; distanceM: number };

export type StageTimer = {
  start: Gate;
  finish: Gate;
  state: TimerState;
  /** Az utolsó feldolgozott mérés, a kapuáthaladás vizsgálatához. */
  prev?: Fix;
};

export function createStageTimer(start: Gate, finish: Gate): StageTimer {
  return { start, finish, state: { status: 'armed' } };
}

/** Rossz pontosságú méréseket (pl. alagút, erdő) kihagyjuk. */
export const MAX_ACCEPTED_ACCURACY_M = 30;

/** Új GPS mérés feldolgozása. Tiszta függvény: új állapotot ad vissza. */
export function processFix(timer: StageTimer, fix: Fix): StageTimer {
  if (fix.accuracy !== undefined && fix.accuracy > MAX_ACCEPTED_ACCURACY_M) return timer;
  const prev = timer.prev;
  const next: StageTimer = { ...timer, prev: fix };
  if (!prev || fix.t <= prev.t) return next;

  const s = timer.state;
  if (s.status === 'armed') {
    const t = gateCrossingTime(prev, fix, timer.start);
    if (t !== null) next.state = { status: 'running', startT: t, distanceM: 0, last: fix };
    return next;
  }
  if (s.status === 'running') {
    const t = gateCrossingTime(prev, fix, timer.finish);
    const distanceM = s.distanceM + haversineM(s.last, fix);
    next.state =
      t !== null
        ? { status: 'finished', startT: s.startT, finishT: t, distanceM }
        : { ...s, distanceM, last: fix };
    return next;
  }
  return next;
}

/** Idő formázása rally stílusban: m:ss.t */
export function formatStageTime(ms: number): string {
  const tenths = Math.round(ms / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}
