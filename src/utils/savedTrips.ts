import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Saved trips
//
// "Save Trip" used to open a sheet reading "Saving a trip for later is not
// available in this build." A control whose only behaviour is to apologise is
// worse than no control, so it was removed — and then built.
//
// A saved trip is a pair of places, not a route. Routes are regenerated from
// live service every time you ask, so storing one would hand back a stale
// answer weeks later; storing the question means the answer is always current.

export interface SavedTrip {
  fromId: string;
  toId: string;
  savedAt: number;
}

const KEY = 'wdw-transport:saved-trips';
const MAX_TRIPS = 20;

let trips: SavedTrip[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(cb => cb());
}

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        trips = parsed.filter(
          (t): t is SavedTrip =>
            !!t && typeof t.fromId === 'string' && typeof t.toId === 'string'
        );
        notify();
      }
    }
  } catch {
    // Corrupted or unavailable storage just means an empty list.
  }
}

async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(trips));
  } catch {
    /* nothing here is worth interrupting a trip over */
  }
}

const key = (fromId: string, toId: string) => `${fromId}>${toId}`;

export function isTripSaved(fromId: string, toId: string): boolean {
  return trips.some(t => key(t.fromId, t.toId) === key(fromId, toId));
}

export function toggleSavedTrip(fromId: string, toId: string): boolean {
  const k = key(fromId, toId);
  const existing = trips.find(t => key(t.fromId, t.toId) === k);
  trips = existing
    ? trips.filter(t => key(t.fromId, t.toId) !== k)
    : [{ fromId, toId, savedAt: Date.now() }, ...trips].slice(0, MAX_TRIPS);
  notify();
  void persist();
  return !existing;
}

export function removeSavedTrip(fromId: string, toId: string) {
  trips = trips.filter(t => key(t.fromId, t.toId) !== key(fromId, toId));
  notify();
  void persist();
}

function subscribe(cb: () => void) {
  void load();
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const getSnapshot = () => trips;

export function useSavedTrips(): SavedTrip[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useIsTripSaved(fromId: string, toId: string): boolean {
  const all = useSavedTrips();
  return all.some(t => key(t.fromId, t.toId) === key(fromId, toId));
}
