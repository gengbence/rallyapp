import Storage from 'expo-sqlite/kv-store';
import { useCallback, useState } from 'react';

/**
 * Egyszerű, offline, eszközön tárolt állapot (SQLite kv-store).
 * A Supabase szinkron erre épül majd rá.
 */
export function usePersistentState<T>(key: string, initial: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = Storage.getItemSync(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (next: T) => {
      setValue(next);
      Storage.setItemSync(key, JSON.stringify(next));
    },
    [key],
  );
  return [value, set];
}
