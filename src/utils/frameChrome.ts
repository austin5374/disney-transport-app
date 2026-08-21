import { useEffect, useSyncExternalStore } from 'react';

// Status-bar tint for the desktop phone frame
//
// The frame in App.tsx draws a fake iOS status bar so the web build reads as
// a phone rather than as a page. Its contents have to be white over the
// planner's blue banner and near-black over every white screen, which means
// the frame needs to know which screen is on top.
//
// Passing that down through the navigator would mean every screen re-rendering
// on a tint change. A two-value external store read by exactly one component
// is cheaper and keeps the navigator's job to one line in `onStateChange`.

export type ChromeTint = 'light' | 'dark';

/** Routes that paint a dark field behind the status bar. */
const LIGHT_ON_DARK = new Set(['Plan']);

let routeTint: ChromeTint = 'light';
/** A full-screen sheet covers the route beneath it, so it gets the last word. */
let override: ChromeTint | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(cb => cb());
}

export function setChromeTintForRoute(routeName: string | undefined) {
  const next: ChromeTint = routeName && LIGHT_ON_DARK.has(routeName) ? 'light' : 'dark';
  if (next === routeTint) return;
  routeTint = next;
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

const getSnapshot = (): ChromeTint => override ?? routeTint;

/** Claim the status bar's tint for as long as `active` holds. A white sheet
 *  opened over the blue planner would otherwise leave white glyphs on white. */
export function useChromeTintOverride(tint: ChromeTint, active: boolean) {
  useEffect(() => {
    if (!active) return;
    override = tint;
    notify();
    return () => { override = null; notify(); };
  }, [tint, active]);
}

export function useChromeTint(): ChromeTint {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Walk a React Navigation state down to the route the user is actually on. */
export function deepestRouteName(state: unknown): string | undefined {
  let node = state as { index?: number; routes?: { name: string; state?: unknown }[] } | undefined;
  let name: string | undefined;
  while (node?.routes?.length) {
    const route = node.routes[node.index ?? 0];
    if (!route) break;
    name = route.name;
    node = route.state as typeof node;
  }
  return name;
}
