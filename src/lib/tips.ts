/** Offline tudástár: gyors, ellenőrzött tippek. Később a backendről frissül. */
export type Tip = { symptom: string; quickFix: string };

export const TIPS_HU: Tip[] = [
  { symptom: 'Túlmelegedés (vízhőfok magas)', quickFix: 'Fűtést maxra, ventilátor biztosíték és relé ellenőrzése, hűtő elején sár/fű eltávolítása. Ha forr, ne nyisd a kupakot melegen.' },
  { symptom: 'Defekt szakaszon', quickFix: 'Biztonságos helyen állj meg, háromszög/OK tábla. Csavarok keresztben húzása, 1–2 km után utánhúzás.' },
  { symptom: 'Nem indul, kattog az indító', quickFix: 'Akku saruk és testkábel ellenőrzése, főkapcsoló állása. Betolás 2. fokozatban, ha szabály engedi.' },
  { symptom: 'Fékpedál hosszú, puha', quickFix: 'Fékolaj szint és szivárgás ellenőrzése, pumpálás. Szervizben légtelenítés, betétvastagság mérése.' },
  { symptom: 'Kuplung csúszik', quickFix: 'Nagy fokozatban kímélő tempó a szervizig, hidraulika folyadék és szivárgás ellenőrzése.' },
  { symptom: 'Intercom nem működik', quickFix: 'Sisak csatlakozók, erősítő biztosíték és földelés ellenőrzése. Tartalék: kézjelek megbeszélve.' },
];

export const TIPS_EN: Tip[] = [
  { symptom: 'Overheating (high coolant temp)', quickFix: 'Heater on full, check fan fuse and relay, clear mud/grass from the radiator. Never open the cap when hot.' },
  { symptom: 'Puncture on a stage', quickFix: 'Stop in a safe spot, triangle/OK board. Tighten nuts crosswise, re-check after 1–2 km.' },
  { symptom: 'No start, starter clicks', quickFix: 'Check battery terminals, earth strap and kill switch. Bump start in 2nd if rules allow.' },
  { symptom: 'Long, soft brake pedal', quickFix: 'Check fluid level and leaks, pump the pedal. At service: bleed and measure pad thickness.' },
  { symptom: 'Clutch slipping', quickFix: 'Gentle driving in high gear to service, check hydraulic fluid and leaks.' },
  { symptom: 'Intercom not working', quickFix: 'Check helmet plugs, amp fuse and ground. Fallback: agreed hand signals.' },
];
