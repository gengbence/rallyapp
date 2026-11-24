import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card, Field, Screen } from '@/components/ui/kit';
import { Spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';
import { usePersistentState } from '@/lib/store';

const CORNERS = ['FL', 'FR', 'RL', 'RR'] as const;
type Corner = (typeof CORNERS)[number];

type Tyres = Record<Corner, { cold: string; hot: string }>;
type Dampers = Record<Corner, { lsBump: string; hsBump: string; rebound: string }>;

const emptyTyres = Object.fromEntries(CORNERS.map((c) => [c, { cold: '', hot: '' }])) as Tyres;
const emptyDampers = Object.fromEntries(CORNERS.map((c) => [c, { lsBump: '', hsBump: '', rebound: '' }])) as Dampers;

function NumberCell({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <View style={styles.cell}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Field value={value} onChangeText={(v) => onChange(v.replace(',', '.'))} keyboardType="decimal-pad" />
    </View>
  );
}

export default function SetupScreen() {
  const [tyres, setTyres] = usePersistentState('setup.tyres', emptyTyres);
  const [dampers, setDampers] = usePersistentState('setup.dampers', emptyDampers);

  return (
    <Screen title={t('tab.setup')}>
      <Card title={t('setup.tyres')}>
        <View style={styles.grid}>
          {CORNERS.map((c) => (
            <View key={c} style={styles.corner}>
              <ThemedText type="smallBold">{c}</ThemedText>
              <NumberCell label={t('setup.cold')} value={tyres[c].cold} onChange={(v) => setTyres({ ...tyres, [c]: { ...tyres[c], cold: v } })} />
              <NumberCell label={t('setup.hot')} value={tyres[c].hot} onChange={(v) => setTyres({ ...tyres, [c]: { ...tyres[c], hot: v } })} />
            </View>
          ))}
        </View>
      </Card>

      <Card title={t('setup.dampers')}>
        <View style={styles.grid}>
          {CORNERS.map((c) => (
            <View key={c} style={styles.corner}>
              <ThemedText type="smallBold">{c}</ThemedText>
              {(['lsBump', 'hsBump', 'rebound'] as const).map((k) => (
                <NumberCell
                  key={k}
                  label={t(`setup.${k}`)}
                  value={dampers[c][k]}
                  onChange={(v) => setDampers({ ...dampers, [c]: { ...dampers[c], [k]: v } })}
                />
              ))}
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  corner: { flexBasis: '45%', flexGrow: 1, gap: Spacing.one },
  cell: { gap: Spacing.half },
});
