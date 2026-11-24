import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createStageTimer,
  formatStageTime,
  gateCrossingTime,
  processFix,
  type Fix,
  type Gate,
} from '../src/lib/stage-timing.ts';

// Észak felé haladó egyenes út; 1e-5 fok szélesség kb. 1,11 m.
const M_PER_DEG_LAT = 111_195;
const north = (m: number) => m / M_PER_DEG_LAT;
const base = { lat: 47.5, lng: 19.0 };

const gateAt = (metersNorth: number): Gate => ({
  center: { lat: base.lat + north(metersNorth), lng: base.lng },
  bearingDeg: 0,
  radiusM: 20,
});

const fixAt = (metersNorth: number, t: number, metersEast = 0): Fix => ({
  lat: base.lat + north(metersNorth),
  lng: base.lng + metersEast / (M_PER_DEG_LAT * Math.cos((base.lat * Math.PI) / 180)),
  t,
});

test('áthaladás idejét interpolálja', () => {
  // 20 m/s, a kapu 5 m-rel az első mérés után: 250 ms.
  const t = gateCrossingTime(fixAt(-5, 1000), fixAt(15, 2000), gateAt(0));
  assert.ok(t !== null);
  assert.ok(Math.abs(t - 1250) < 5, `kapott: ${t}`);
});

test('ellenkező irányú áthaladás nem számít', () => {
  assert.equal(gateCrossingTime(fixAt(15, 1000), fixAt(-5, 2000), gateAt(0)), null);
});

test('a kapu sugarán kívüli áthaladás nem számít', () => {
  assert.equal(gateCrossingTime(fixAt(-5, 1000, 50), fixAt(15, 2000, 50), gateAt(0)), null);
});

test('teljes szakasz: rajt, menet, cél', () => {
  let timer = createStageTimer(gateAt(0), gateAt(1000));
  // 25 m/s, -10 m-ről indul, 1 Hz.
  for (let i = 0; i <= 45; i++) timer = processFix(timer, fixAt(-10 + 25 * i, i * 1000));
  assert.equal(timer.state.status, 'finished');
  if (timer.state.status !== 'finished') return;
  const elapsed = timer.state.finishT - timer.state.startT;
  assert.ok(Math.abs(elapsed - 40_000) < 20, `kapott: ${elapsed}`);
  assert.equal(formatStageTime(elapsed), '0:40.0');
});

test('pontatlan mérést kihagy', () => {
  const timer = createStageTimer(gateAt(0), gateAt(1000));
  const next = processFix(timer, { ...fixAt(0, 0), accuracy: 80 });
  assert.equal(next, timer);
});

test('időformátum', () => {
  assert.equal(formatStageTime(342_870), '5:42.9');
  assert.equal(formatStageTime(59_960), '1:00.0');
});
