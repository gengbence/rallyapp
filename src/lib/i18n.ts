import { getLocales } from 'expo-localization';

const hu = {
  'tab.event': 'Verseny',
  'tab.checklist': 'Bepakolás',
  'tab.timing': 'Szakaszidő',
  'tab.setup': 'Beállítás',
  'tab.team': 'Csapat',
  'event.schedule': 'Időterv',
  'event.locations': 'Helyszínek',
  'event.openMaps': 'Megnyitás Google Maps-ben',
  'event.importPdf': 'Versenykiírás beolvasása (PDF)',
  'event.importPdfSoon': 'A PDF feldolgozás a backend beállítása után érhető el.',
  'event.timeCard': 'Menetlevél fotó',
  'checklist.add': 'Új tétel',
  'checklist.reset': 'Mind visszaállítása',
  'timing.setStart': 'Rajt kapu = itt',
  'timing.setFinish': 'Cél kapu = itt',
  'timing.arm': 'Mérés indítása',
  'timing.stop': 'Mérés leállítása',
  'timing.armed': 'Várakozás a rajt kapura…',
  'timing.running': 'Szakasz fut',
  'timing.finished': 'Cél',
  'timing.disclaimer':
    'Nem hivatalos, telefonos GPS mérés. Tartsd be a sorozat elektronikus eszközökre vonatkozó szabályait.',
  'timing.noPermission': 'Engedélyezd a helymeghatározást a beállításokban.',
  'setup.tyres': 'Keréknyomás (bar)',
  'setup.cold': 'Hidegen',
  'setup.hot': 'Melegen',
  'setup.dampers': 'Gátlók (kattintás)',
  'setup.lsBump': 'LS bump',
  'setup.hsBump': 'HS bump',
  'setup.rebound': 'Rebound',
  'team.quickDial': 'Gyorshívó',
  'team.tips': 'Gyors hibaelhárítás',
  'common.save': 'Mentés',
  'common.saved': 'Mentve',
} as const;

type Key = keyof typeof hu;

const en: Record<Key, string> = {
  'tab.event': 'Event',
  'tab.checklist': 'Packing',
  'tab.timing': 'Stage time',
  'tab.setup': 'Setup',
  'tab.team': 'Team',
  'event.schedule': 'Schedule',
  'event.locations': 'Locations',
  'event.openMaps': 'Open in Google Maps',
  'event.importPdf': 'Import regulations (PDF)',
  'event.importPdfSoon': 'PDF import is available once the backend is configured.',
  'event.timeCard': 'Time card photo',
  'checklist.add': 'New item',
  'checklist.reset': 'Uncheck all',
  'timing.setStart': 'Start gate = here',
  'timing.setFinish': 'Finish gate = here',
  'timing.arm': 'Start timing',
  'timing.stop': 'Stop timing',
  'timing.armed': 'Waiting for start gate…',
  'timing.running': 'Stage running',
  'timing.finished': 'Finish',
  'timing.disclaimer':
    'Unofficial phone GPS timing. Follow your series rules on electronic devices.',
  'timing.noPermission': 'Allow location access in settings.',
  'setup.tyres': 'Tyre pressure (bar)',
  'setup.cold': 'Cold',
  'setup.hot': 'Hot',
  'setup.dampers': 'Dampers (clicks)',
  'setup.lsBump': 'LS bump',
  'setup.hsBump': 'HS bump',
  'setup.rebound': 'Rebound',
  'team.quickDial': 'Quick dial',
  'team.tips': 'Quick fixes',
  'common.save': 'Save',
  'common.saved': 'Saved',
};

const lang = getLocales()[0]?.languageCode === 'hu' ? 'hu' : 'en';
const dict: Record<Key, string> = lang === 'hu' ? hu : en;

export const locale = lang;
export function t(key: Key): string {
  return dict[key];
}
