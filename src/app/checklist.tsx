import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Field, Row, Screen } from '@/components/ui/kit';
import { t } from '@/lib/i18n';
import { usePersistentState } from '@/lib/store';

type Item = { id: string; label: string; category: string; checked: boolean };

const TEMPLATE: Item[] = [
  ['Bukósisak (2 db)', 'Felszerelés'],
  ['HANS', 'Felszerelés'],
  ['Overál, aláöltözet, kesztyű, cipő', 'Felszerelés'],
  ['Licencek, jogosítvány, személyi', 'Dokumentumok'],
  ['Versenykiírás, itiner, menetlevél tartó', 'Dokumentumok'],
  ['Stopper, tollak, tripmeter elem', 'Navigáció'],
  ['Pótkerék (2 db), emelő, kerékkulcs', 'Autó'],
  ['Tűzoltó készülék ellenőrizve', 'Autó'],
  ['Elsősegély doboz, SOS/OK tábla, háromszög', 'Biztonság'],
  ['Keréknyomásmérő', 'Szerviz'],
].map(([label, category], i) => ({ id: String(i), label, category, checked: false }));

export default function ChecklistScreen() {
  const [items, setItems] = usePersistentState('checklist.items', TEMPLATE);
  const [draft, setDraft] = useState('');

  const categories = [...new Set(items.map((i) => i.category))];
  const done = items.filter((i) => i.checked).length;

  const add = () => {
    if (!draft.trim()) return;
    setItems([...items, { id: String(Date.now()), label: draft.trim(), category: 'Egyéb', checked: false }]);
    setDraft('');
  };

  return (
    <Screen title={`${t('tab.checklist')} ${done}/${items.length}`}>
      {categories.map((c) => (
        <Card key={c} title={c}>
          {items
            .filter((i) => i.category === c)
            .map((i) => (
              <ThemedText
                key={i.id}
                onPress={() => setItems(items.map((x) => (x.id === i.id ? { ...x, checked: !x.checked } : x)))}
                themeColor={i.checked ? 'textSecondary' : 'text'}>
                {i.checked ? '☑' : '☐'} {i.label}
              </ThemedText>
            ))}
        </Card>
      ))}
      <Card>
        <Field value={draft} onChangeText={setDraft} placeholder={t('checklist.add')} onSubmitEditing={add} />
        <Row>
          <Button label={t('checklist.add')} onPress={add} />
          <Button label={t('checklist.reset')} variant="secondary" onPress={() => setItems(items.map((i) => ({ ...i, checked: false })))} />
        </Row>
      </Card>
    </Screen>
  );
}
