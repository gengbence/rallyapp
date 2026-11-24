import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { t } from '@/lib/i18n';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tab.event')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="flag.checkered" md="flag" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="checklist">
        <NativeTabs.Trigger.Label>{t('tab.checklist')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checklist" md="checklist" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="timing">
        <NativeTabs.Trigger.Label>{t('tab.timing')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="stopwatch" md="timer" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="setup">
        <NativeTabs.Trigger.Label>{t('tab.setup')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="wrench.and.screwdriver" md="build" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="team">
        <NativeTabs.Trigger.Label>{t('tab.team')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="phone.fill" md="call" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
