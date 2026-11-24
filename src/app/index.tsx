import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Row, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { locale, t } from '@/lib/i18n';
import { mapsDirectionsUrl } from '@/lib/maps';
import { usePersistentState } from '@/lib/store';

type Location = { id: string; name: string; address: string; lat?: number; lng?: number };
type ScheduleItem = { id: string; title: string; startsAt: string; done: boolean };

// Mintaadat, amíg nincs PDF import és backend.
const SAMPLE_LOCATIONS: Location[] = [
  { id: 'sp', name: 'Szervizpark', address: 'Eger, Nagyváradi utca' },
  { id: 'adm', name: 'Adminisztratív átvétel', address: 'Eger, Dobó István tér' },
];
const SAMPLE_SCHEDULE: ScheduleItem[] = [
  { id: '1', title: 'Adminisztratív átvétel', startsAt: '2027-04-16T09:00:00+02:00', done: false },
  { id: '2', title: 'Gépátvétel', startsAt: '2027-04-16T11:30:00+02:00', done: false },
  { id: '3', title: 'Shakedown', startsAt: '2027-04-16T15:00:00+02:00', done: false },
  { id: '4', title: 'Rajt – SS1', startsAt: '2027-04-17T08:05:00+02:00', done: false },
];

const fmt = new Intl.DateTimeFormat(locale === 'hu' ? 'hu-HU' : 'en-GB', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export default function EventScreen() {
  const [schedule, setSchedule] = usePersistentState('event.schedule', SAMPLE_SCHEDULE);
  const [locations] = usePersistentState('event.locations', SAMPLE_LOCATIONS);
  const [timeCards, setTimeCards] = usePersistentState<string[]>('event.timeCards', []);
  const [regulations, setRegulations] = usePersistentState<string | null>('event.regulations', null);

  const toggle = (id: string) =>
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  const pickPdf = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (res.canceled) return;
    setRegulations(res.assets[0].name);
    // TODO: feltöltés Supabase Storage-ba és Edge Function feldolgozás.
    Alert.alert(t('event.importPdf'), t('event.importPdfSoon'));
  };

  const takeTimeCard = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setTimeCards([res.assets[0].uri, ...timeCards]);
  };

  return (
    <Screen title="Eger Rallye 2027">
      <Card title={t('event.schedule')}>
        {[...schedule]
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
          .map((s) => (
            <ThemedText
              key={s.id}
              onPress={() => toggle(s.id)}
              themeColor={s.done ? 'textSecondary' : 'text'}
              style={s.done && styles.done}>
              {fmt.format(new Date(s.startsAt))} · {s.title}
            </ThemedText>
          ))}
      </Card>

      <Card title={t('event.locations')}>
        {locations.map((l) => (
          <View key={l.id} style={styles.location}>
            <ThemedText>{l.name}</ThemedText>
            <ThemedText
              type="linkPrimary"
              onPress={() =>
                Linking.openURL(mapsDirectionsUrl(l.lat !== undefined && l.lng !== undefined ? { lat: l.lat, lng: l.lng } : l.address))
              }>
              {t('event.openMaps')}
            </ThemedText>
          </View>
        ))}
      </Card>

      <Card>
        <Button label={t('event.importPdf')} onPress={pickPdf} />
        {regulations ? <ThemedText type="small">{regulations}</ThemedText> : null}
      </Card>

      <Card title={t('event.timeCard')}>
        <Button label={t('event.timeCard')} variant="secondary" onPress={takeTimeCard} />
        <Row>
          {timeCards.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.thumb} contentFit="cover" />
          ))}
        </Row>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  done: { textDecorationLine: 'line-through' },
  location: { gap: Spacing.half },
  thumb: { width: 72, height: 96, borderRadius: Spacing.two },
});
