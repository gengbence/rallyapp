# Rally App

Versenyző párosoknak (pilóta + navigátor) szóló mobilapp iOS-re és Androidra: bepakolási lista, időterv, helyszínek Google Maps linkkel, menetlevél fotó, GPS alapú szakaszidő, keréknyomás és futómű/gátló beállítások, csapat gyorshívó, gyors hibaelhárítási tippek.

A termék- és műszaki terv: [Rally app – termék- és műszaki terv](https://claude.ai/artifact/WJCyJw3jjTiBL5Uv11931J)

## Technológia

- Expo (SDK 58), React Native, TypeScript, Expo Router
- Offline tárolás: `expo-sqlite` kv-store (később Supabase szinkron)
- Backend: Supabase (Postgres + RLS, Auth, Storage), séma: `supabase/migrations/`
- GPS: `expo-location` + `expo-task-manager` háttérfeladat

## Indítás

```bash
npm install
cp .env.example .env.local   # opcionális, backend nélkül is fut
npx expo start
```

A háttér GPS miatt az Expo Go nem elég, development build kell:

```bash
npx eas-cli@latest build --profile development --platform android   # vagy ios
```

## Ellenőrzés

```bash
npm run typecheck
npm test          # szakaszidő logika tesztjei (Node 22+)
```

## Szerkezet

| Útvonal | Tartalom |
| --- | --- |
| `src/app/index.tsx` | Verseny: időterv, helyszínek, PDF kiírás, menetlevél fotó |
| `src/app/checklist.tsx` | Bepakolási lista sablonból |
| `src/app/timing.tsx` | GPS szakaszidő: rajt/cél kapu, mérés, eredmények |
| `src/app/setup.tsx` | Keréknyomás és 3 utas gátló beállítások |
| `src/app/team.tsx` | Gyorshívó és hibaelhárítási tippek |
| `src/lib/stage-timing.ts` | Kapu-áthaladás és időmérés (tiszta logika, tesztelt) |
| `src/lib/gps-task.ts` | Háttér helymeghatározás és mérési állapot |
| `supabase/migrations/` | Adatbázis-séma és jogosultságok |
