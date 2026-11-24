import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, Screen } from '@/components/ui/kit';
import {
  loadActiveTimer,
  onTimerChange,
  saveActiveTimer,
  startStageTiming,
  stopStageTiming,
} from '@/lib/gps-task';
import { t } from '@/lib/i18n';
import { createStageTimer, formatStageTime, type Gate, type StageTimer } from '@/lib/stage-timing';
import { usePersistentState } from '@/lib/store';

type Run = { id: string; stage: string; timeMs: number; distanceM: number; at: string };

const GATE_RADIUS_M = 25;

async function gateHere(): Promise<Gate | null> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
  return {
    center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
    // Álló helyzetben nincs menetirány; ilyenkor 0 (észak), recce közben guruló autóval érdemes felvenni.
    bearingDeg: pos.coords.heading && pos.coords.heading >= 0 ? pos.coords.heading : 0,
    radiusM: GATE_RADIUS_M,
  };
}

export default function TimingScreen() {
  const [start, setStart] = usePersistentState<Gate | null>('timing.start', null);
  const [finish, setFinish] = usePersistentState<Gate | null>('timing.finish', null);
  const [runs, setRuns] = usePersistentState<Run[]>('timing.runs', []);
  const [timer, setTimer] = useState<StageTimer | null>(() => loadActiveTimer());
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onTimerChange(setTimer), []);

  useEffect(() => {
    if (timer?.state.status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [timer?.state.status]);

  useEffect(() => {
    if (timer?.state.status !== 'finished') return;
    const s = timer.state;
    setRuns([
      { id: String(s.finishT), stage: `SS${runs.length + 1}`, timeMs: s.finishT - s.startT, distanceM: s.distanceM, at: new Date(s.finishT).toISOString() },
      ...runs,
    ]);
    saveActiveTimer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer?.state.status]);

  const setGate = async (which: 'start' | 'finish') => {
    const g = await gateHere();
    if (!g) return setError(t('timing.noPermission'));
    setError(null);
    (which === 'start' ? setStart : setFinish)(g);
  };

  const arm = async () => {
    if (!start || !finish) return;
    const fresh = createStageTimer(start, finish);
    saveActiveTimer(fresh);
    setTimer(fresh);
    if (!(await startStageTiming())) {
      saveActiveTimer(null);
      setTimer(null);
      setError(t('timing.noPermission'));
    }
  };

  const stop = async () => {
    await stopStageTiming();
    saveActiveTimer(null);
    setTimer(null);
  };

  const s = timer?.state;
  const display =
    s?.status === 'running' ? formatStageTime(now - s.startT) : s?.status === 'finished' ? formatStageTime(s.finishT - s.startT) : '0:00.0';
  const statusLabel =
    s?.status === 'armed' ? t('timing.armed') : s?.status === 'running' ? t('timing.running') : s?.status === 'finished' ? t('timing.finished') : '';

  return (
    <Screen title={t('tab.timing')}>
      <Card>
        <ThemedText type="title" style={styles.clock}>
          {display}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{statusLabel}</ThemedText>
        {timer ? (
          <Button label={t('timing.stop')} variant="danger" onPress={stop} />
        ) : (
          <Button label={t('timing.arm')} onPress={arm} disabled={!start || !finish} />
        )}
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      </Card>

      <Card>
        <Row>
          <Button label={`${t('timing.setStart')}${start ? ' ✓' : ''}`} variant="secondary" onPress={() => setGate('start')} />
          <Button label={`${t('timing.setFinish')}${finish ? ' ✓' : ''}`} variant="secondary" onPress={() => setGate('finish')} />
        </Row>
      </Card>

      {runs.length > 0 ? (
        <Card>
          {runs.map((r) => (
            <ThemedText key={r.id}>
              {r.stage} · {formatStageTime(r.timeMs)} · {(r.distanceM / 1000).toFixed(2)} km
            </ThemedText>
          ))}
        </Card>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary">
        {t('timing.disclaimer')}
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clock: { fontVariant: ['tabular-nums'] },
  error: { color: '#C62828' },
});
