// Deterministic pseudo-randomness
//
// This app simulates things it cannot know — service disruptions, crowd
// levels, the hour Disney brings a beam online — and the first version did it
// with Math.random() on a timer. That had an obvious problem: refreshing the
// page rerolled everything. You could watch the Skyliner shut for lightning,
// hit reload, and it was running again.
//
// Everything is derived from a key instead. Same key, same answer, on every
// device and every reload, with no stored state anywhere. That is what lets a
// test freeze the clock and assert an exact board, and what stops two people
// standing next to each other seeing different apps.
//
// Lives in its own module because both the status engine and the route
// generators need it, and the status engine already imports the line data —
// so the helpers cannot live in either without a cycle.

/** FNV-1a. Stable across engines; we only need spread, not cryptography. */
function hash(key: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** A uniform value in [0, 1) for any key. */
export function unit(...parts: (string | number)[]): number {
  let x = hash(parts.join('|'));
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0;
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0;
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export const pick = <T,>(arr: T[], ...seed: (string | number)[]): T =>
  arr[Math.floor(unit(...seed) * arr.length) % arr.length];

export const between = (lo: number, hi: number, ...seed: (string | number)[]): number =>
  Math.round(lo + unit(...seed) * (hi - lo));

/** A key that changes once a day and is the same for everyone looking. */
export const dayKey = (at: Date): string =>
  `${at.getFullYear()}-${at.getMonth() + 1}-${at.getDate()}`;
