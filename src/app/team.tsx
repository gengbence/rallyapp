import { useState } from 'react';
import { Linking } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button, Card, Field, Row, Screen } from '@/components/ui/kit';
import { locale, t } from '@/lib/i18n';
import { usePersistentState } from '@/lib/store';
import { TIPS_EN, TIPS_HU } from '@/lib/tips';

type Contact = { id: string; label: string; phone: string };

const DEFAULT_CONTACTS: Contact[] = [{ id: 'sos', label: 'SOS 112', phone: '112' }];

export default function TeamScreen() {
  const [contacts, setContacts] = usePersistentState('team.contacts', DEFAULT_CONTACTS);
  const [label, setLabel] = useState('');
  const [phone, setPhone] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const tips = locale === 'hu' ? TIPS_HU : TIPS_EN;

  const add = () => {
    if (!label.trim() || !phone.trim()) return;
    setContacts([...contacts, { id: String(Date.now()), label: label.trim(), phone: phone.trim() }]);
    setLabel('');
    setPhone('');
  };

  return (
    <Screen title={t('tab.team')}>
      <Card title={t('team.quickDial')}>
        {contacts.map((c) => (
          <Button
            key={c.id}
            label={`${c.label} · ${c.phone}`}
            variant={c.phone === '112' ? 'danger' : 'primary'}
            onPress={() => Linking.openURL(`tel:${c.phone.replace(/\s/g, '')}`)}
          />
        ))}
        <Row>
          <Field value={label} onChangeText={setLabel} placeholder="Szerviz / Service" style={{ flex: 1 }} />
          <Field value={phone} onChangeText={setPhone} placeholder="+36…" keyboardType="phone-pad" style={{ flex: 1 }} />
        </Row>
        <Button label={t('common.save')} variant="secondary" onPress={add} />
      </Card>

      <Card title={t('team.tips')}>
        {tips.map((tip, i) => (
          <ThemedText key={tip.symptom} onPress={() => setOpen(open === i ? null : i)}>
            {open === i ? '▾' : '▸'} {tip.symptom}
            {open === i ? `\n${tip.quickFix}` : ''}
          </ThemedText>
        ))}
      </Card>
    </Screen>
  );
}
