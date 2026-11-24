import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import Storage from 'expo-sqlite/kv-store';

import { processFix, type Fix, type StageTimer } from './stage-timing';

export const STAGE_TIMING_TASK = 'stage-timing-location';
const TIMER_KEY = 'timing.activeTimer';

type Listener = (timer: StageTimer) => void;
const listeners = new Set<Listener>();

/** A képernyő feliratkozik az időmérő állapotváltozásaira. */
export function onTimerChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadActiveTimer(): StageTimer | null {
  const raw = Storage.getItemSync(TIMER_KEY);
  return raw ? (JSON.parse(raw) as StageTimer) : null;
}

export function saveActiveTimer(timer: StageTimer | null): void {
  if (timer) Storage.setItemSync(TIMER_KEY, JSON.stringify(timer));
  else Storage.removeItemSync(TIMER_KEY);
}

// A feladatot modul szinten kell definiálni, hogy háttérben is fusson.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(STAGE_TIMING_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const fixes: Fix[] = data.locations.map((l) => ({
    lat: l.coords.latitude,
    lng: l.coords.longitude,
    t: l.timestamp,
    accuracy: l.coords.accuracy ?? undefined,
  }));
  // Az állapotot itt, a háttérfeladatban dolgozzuk fel és mentjük,
  // így a mérés akkor is megy, ha a képernyő ki van kapcsolva.
  let timer = loadActiveTimer();
  if (!timer) return;
  for (const fix of fixes) timer = processFix(timer, fix);
  saveActiveTimer(timer);
  listeners.forEach((l) => l(timer));
  if (timer.state.status === 'finished') await stopStageTiming();
});

export async function startStageTiming(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') return false;
  await Location.startLocationUpdatesAsync(STAGE_TIMING_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 1000,
    distanceInterval: 0,
    activityType: Location.ActivityType.AutomotiveNavigation,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Rally App',
      notificationBody: 'Szakaszidő-mérés fut / Stage timing running',
    },
  });
  return true;
}

export async function stopStageTiming(): Promise<void> {
  if (await Location.hasStartedLocationUpdatesAsync(STAGE_TIMING_TASK)) {
    await Location.stopLocationUpdatesAsync(STAGE_TIMING_TASK);
  }
}
