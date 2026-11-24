import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase kliens. Amíg nincs beállítva (.env.local), az app offline,
 * helyi adatokkal működik, és ez null.
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { storage: localStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      })
    : null;
