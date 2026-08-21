import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Everything the app remembers
//
// There was no persistence of any kind: recents, filters and the trip you
// were looking at were React state and nothing else, so a browser refresh
// wiped the lot. "Save Trip" was a sheet that said saving was not available.
//
// One hook over AsyncStorage — localStorage on web, the native store on a
// phone — covers all of it. Reads are asynchronous, so every value starts at
// its default and settles a frame later; nothing here is on a hot path.

const PREFIX = 'wdw-transport:';

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // A quota error, a private window, corrupted JSON: none of these are
    // worth interrupting a trip over.
    return fallback;
  }
}

async function write(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* see above */
  }
}

/**
 * State that outlives the session. Behaves like useState, plus a `ready` flag
 * for the brief moment before the stored value has been read back.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    let live = true;
    read(key, initial).then(stored => {
      if (!live) return;
      setValue(stored);
      setReady(true);
    });
    return () => { live = false; };
    // `initial` is a default, not a dependency: re-reading because a caller
    // passed a fresh array literal would clobber what the user just did.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      void write(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, update, ready];
}

export const StorageKeys = {
  recents: 'recents',
  savedTrips: 'saved-trips',
  filters: 'filters',
} as const;
