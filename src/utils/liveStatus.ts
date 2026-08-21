import { useMemo, useSyncExternalStore } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { TRANSIT_LINES, TransitLine, isInService, serviceStartLabel } from '../data/lines';
import { unit, pick, between } from './deterministic';

// Deterministic live-status engine
//
// Every value here is a pure function of (line, wall-clock time). Nothing is
// stored, nothing is mutated on a timer, and no call to Math.random() appears
// anywhere in this file.
//
// The previous engine re-seeded itself with Math.random() on every page load:
// refreshing the browser re-rolled which lines were down, so a reader could
// watch the Skyliner get suspended for lightning, reload, and find it running
// again. Deriving state from the clock instead means the board is stable
// across reloads, identical on every device, reproducible in a test, and free
// of any persistence layer.
//
// The ticker that remains exists only to re-render countdowns.

export type ServiceStatus = 'operating' | 'delayed' | 'down' | 'closed';
export type CrowdLevel = 'light' | 'moderate' | 'heavy';

export interface LineStatus {
  lineId: string;
  status: ServiceStatus;
  detail: string | null;
  /** For 'down': estimated minutes until service is restored. */
  etaMinutes: number | null;
  /** Minutes until the next departures (0 = boarding now). */
  nextArrivals: number[];
  crowd: CrowdLevel;
  updatedAt: number;
  headwayMinutes: [number, number];
  /** Monorail only: how many trains are running this beam. */
  trainsInService: number | null;
}

/** Lines whose departures depend on which stop you are standing at, not on
 *  the line as a whole. Every resort shares one "All resorts to Magic
 *  Kingdom" line, so a single countdown for it would show the same number at
 *  Pop Century and at Animal Kingdom Lodge — the one thing a bus-time feature
 *  must never do. The board shows these as a headway range; a trip screen,
 *  which knows the origin, gets a real countdown from nextArrivalsFrom(). */
function isStopScheduled(line: TransitLine): boolean {
  return line.stations[0] === 'All resorts';
}

const TICK_MS = 20_000;
const MINUTE = 60_000;
/** Disruptions are decided per half-hour window. */
const EPISODE_MS = 30 * MINUTE;

// Monorail headway model
// Each beam runs a fixed number of trains, and headway follows from that count
// rather than being a flat range.

function rollTrainsInService(lineId: string, episode: number): number | null {
  if (lineId === 'mono-epcot') return 2;
  if (lineId === 'mono-express') return unit('trains', lineId, episode) < 0.5 ? 3 : 4;
  if (lineId === 'mono-resort') return unit('trains', lineId, episode) < 0.7 ? 4 : 3;
  return null;
}

function monorailHeadway(lineId: string, trains: number): [number, number] {
  if (lineId === 'mono-epcot') return [8, 10];
  if (lineId === 'mono-express') return trains >= 4 ? [2, 3] : [3, 4];
  return trains >= 4 ? [4, 5] : [8, 9]; // mono-resort
}

function effectiveHeadway(line: TransitLine, trains: number | null): [number, number] {
  return trains != null ? monorailHeadway(line.id, trains) : line.headwayMinutes;
}

// Disruption copy

const DOWN_MESSAGES: Record<string, string[]> = {
  Monorail: [
    'Down for mechanical inspection',
    'Track switching issue near the TTC, crews on scene',
    'Train being cycled out of service',
  ],
  Skyliner: [
    'Paused for an extended guest boarding',
    'Cabin taken out of rotation for cleaning',
  ],
  Boats: [
    'Vessel change in progress',
    'Docked for routine maintenance',
  ],
  Buses: [
    'Temporary detour, expect longer travel times',
    'Service interruption, additional buses en route',
  ],
};

const DELAY_MESSAGES: Record<string, string[]> = {
  Monorail: [
    'Trains running at reduced speed, expect longer waits',
    'Brief boarding delays due to platform crowding',
  ],
  Skyliner: [
    'Intermittent pauses for guest loading',
    'Moving at reduced speed due to gusty winds',
  ],
  Boats: [
    'Running behind schedule, heavy guest volume',
    'Minor delays while vessels are repositioned',
  ],
  Buses: [
    'Longer waits due to high demand, extra buses being added',
    'Delays from traffic on property roads',
  ],
};

// Coordinated weather
// Watercraft and the Skyliner are grouped by the body of water or cable system
// they actually run on, so a storm cell takes out everything on that system
// together. Never the whole property's boats at once, and never one boat
// alone while its dock-mates keep running. Because each group's outage is a
// function of the same episode key, the coordination is structural rather than
// something the code has to keep in sync.

const WEATHER_GROUPS: { key: string; lines: string[]; messages: string[]; chance: number }[] = [
  {
    key: 'seven-seas',
    lines: ['boat-ferry', 'boat-gold', 'boat-red', 'boat-green', 'boat-blue'],
    messages: ['Docked for lightning in the area', 'Docked for weather, high winds on the water'],
    chance: 0.06,
  },
  {
    key: 'crescent-lake',
    lines: ['boat-friendship'],
    messages: ['Docked for lightning in the area', 'Docked for weather, high winds on the water'],
    chance: 0.06,
  },
  {
    key: 'disney-springs-water',
    lines: ['boat-sassagoula'],
    messages: ['Docked for lightning in the area', 'Docked for weather, high winds on the water'],
    chance: 0.05,
  },
  {
    key: 'skyliner',
    lines: ['sky-epcot', 'sky-hs', 'sky-pop'],
    messages: ['Suspended for lightning in the area', 'Suspended for high winds'],
    chance: 0.05,
  },
];

const MONORAIL_LIGHTNING_STAGE1 =
  'Suspended for lightning in the area. The EPCOT beam runs longest, so it goes first';
const MONORAIL_LIGHTNING_STAGE2 =
  'Lightning in the area, all monorail beams suspended until it clears';

interface Episode {
  status: ServiceStatus;
  detail: string;
  /** ms offset from the episode start */
  startOffset: number;
  durationMs: number;
}

/** Weather episode covering a whole system, if one is active this episode. */
function weatherEpisode(lineId: string, episode: number): Episode | null {
  for (const g of WEATHER_GROUPS) {
    if (!g.lines.includes(lineId)) continue;
    if (unit('weather', g.key, episode) >= g.chance) return null;
    const startOffset = between(0, EPISODE_MS - 12 * MINUTE, 'weather-start', g.key, episode);
    const durationMs = between(10, 28, 'weather-dur', g.key, episode) * MINUTE;
    return {
      status: 'down',
      detail: pick(g.messages, 'weather-msg', g.key, episode),
      startOffset,
      durationMs,
    };
  }
  return null;
}

/** Monorail lightning escalates: the EPCOT beam goes first, and if the cell
 *  persists all three beams go down together and come back together. */
function monorailLightning(lineId: string, episode: number): Episode | null {
  if (!lineId.startsWith('mono-')) return null;
  const strike = unit('mono-lightning', episode);
  if (strike >= 0.05) return null;

  const escalates = unit('mono-escalate', episode) < 0.4;
  const startOffset = between(0, EPISODE_MS - 15 * MINUTE, 'mono-start', episode);

  if (lineId === 'mono-epcot') {
    return {
      status: 'down',
      detail: escalates ? MONORAIL_LIGHTNING_STAGE2 : MONORAIL_LIGHTNING_STAGE1,
      startOffset,
      durationMs: between(12, 26, 'mono-dur', episode) * MINUTE,
    };
  }
  if (!escalates) return null;
  return {
    status: 'down',
    detail: MONORAIL_LIGHTNING_STAGE2,
    // The other two beams follow a few minutes behind and clear with EPCOT.
    startOffset: startOffset + 4 * MINUTE,
    durationMs: between(12, 26, 'mono-dur', episode) * MINUTE - 4 * MINUTE,
  };
}

/** An ordinary, single-line, non-weather disruption. */
function ordinaryEpisode(line: TransitLine, episode: number): Episode | null {
  const r = unit('disrupt', line.id, episode);
  const startOffset = between(0, EPISODE_MS - 8 * MINUTE, 'disrupt-start', line.id, episode);
  if (r < 0.035) {
    return {
      status: 'down',
      detail: pick(DOWN_MESSAGES[line.group], 'down-msg', line.id, episode),
      startOffset,
      durationMs: between(8, 24, 'down-dur', line.id, episode) * MINUTE,
    };
  }
  if (r < 0.14) {
    return {
      status: 'delayed',
      detail: pick(DELAY_MESSAGES[line.group], 'delay-msg', line.id, episode),
      startOffset,
      durationMs: between(6, 18, 'delay-dur', line.id, episode) * MINUTE,
    };
  }
  return null;
}

/** Resolve which episode, if any, has this line disrupted right now. Looks at
 *  the previous episode too, so an outage that started near the end of one
 *  window can still be in progress. */
function activeDisruption(line: TransitLine, now: number): { detail: string; status: ServiceStatus; endsAt: number } | null {
  const current = Math.floor(now / EPISODE_MS);
  for (const episode of [current - 1, current]) {
    const base = episode * EPISODE_MS;
    const ep =
      weatherEpisode(line.id, episode) ??
      monorailLightning(line.id, episode) ??
      ordinaryEpisode(line, episode);
    if (!ep) continue;
    const start = base + ep.startOffset;
    const end = start + ep.durationMs;
    if (now >= start && now < end) {
      return { detail: ep.detail, status: ep.status, endsAt: end };
    }
  }
  return null;
}

// Arrivals
// A fixed schedule per line: departures land on a repeating interval with a
// per-line phase offset, so countdowns tick down smoothly and never jump
// backwards on a re-render.

/** Extra wait a delayed line adds, as a multiplier on its headway. Used both
 *  by the countdown here and by the journey cost model in routing.ts, which
 *  previously used the undelayed headway and so disagreed with the number
 *  printed directly beneath it. */
export const DELAY_HEADWAY_FACTOR = 1.6;

function nextArrivals(
  line: TransitLine, headway: [number, number], now: number, delayed: boolean, stopId?: string,
): number[] {
  const [lo, hi] = headway;
  if (hi <= 1) return []; // continuous loading
  const meanMs = ((lo + hi) / 2) * MINUTE * (delayed ? DELAY_HEADWAY_FACTOR : 1);
  const phase = unit('phase', line.id, stopId ?? '') * meanMs;
  const sincePhase = now - phase;
  const nextIndex = Math.ceil(sincePhase / meanMs);
  return [0, 1].map(k => {
    const at = phase + (nextIndex + k) * meanMs;
    return Math.max(0, Math.round((at - now) / MINUTE));
  });
}

// Crowding

function crowdBaseline(hour: number): CrowdLevel {
  if (hour >= 7 && hour < 11) return 'heavy';    // morning rush to parks
  if (hour >= 20 && hour < 23) return 'heavy';   // park-close exodus
  if (hour >= 11 && hour < 14) return 'moderate';
  if (hour >= 17 && hour < 20) return 'moderate';
  return 'light';
}

function crowdFor(lineId: string, now: number): CrowdLevel {
  const d = new Date(now);
  const base = crowdBaseline(d.getHours());
  // Re-rolled every 20 minutes so the board moves without flickering.
  const r = unit('crowd', lineId, Math.floor(now / (20 * MINUTE)));
  if (base === 'heavy')    return r < 0.6  ? 'heavy'    : r < 0.9 ? 'moderate' : 'light';
  if (base === 'moderate') return r < 0.55 ? 'moderate' : r < 0.8 ? 'light'    : 'heavy';
  return r < 0.7 ? 'light' : r < 0.95 ? 'moderate' : 'heavy';
}

// Snapshot

function computeLine(line: TransitLine, now: number): LineStatus {
  const episode = Math.floor(now / EPISODE_MS);
  const trainsInService = rollTrainsInService(line.id, episode);
  const headway = effectiveHeadway(line, trainsInService);
  const date = new Date(now);

  // Hours come first. A line that is shut cannot be delayed, cannot be held
  // for lightning, and certainly cannot have a train two minutes out.
  if (!isInService(line, date)) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    const ended = minutes >= 12 * 60;
    return {
      lineId: line.id,
      status: 'closed',
      detail: ended
        ? 'Service has ended for the night'
        : `Service starts at ${serviceStartLabel(line)}`,
      etaMinutes: null,
      nextArrivals: [],
      crowd: 'light',
      updatedAt: now,
      headwayMinutes: headway,
      trainsInService: null,
    };
  }

  const disruption = activeDisruption(line, now);
  const status: ServiceStatus = disruption?.status ?? 'operating';

  return {
    lineId: line.id,
    status,
    detail: disruption?.detail ?? null,
    etaMinutes: status === 'down' && disruption
      ? Math.max(1, Math.ceil((disruption.endsAt - now) / MINUTE))
      : null,
    nextArrivals: status === 'down' || isStopScheduled(line)
      ? []
      : nextArrivals(line, headway, now, status === 'delayed'),
    crowd: crowdFor(line.id, now),
    updatedAt: now,
    headwayMinutes: headway,
    trainsInService,
  };
}

/** The whole board at an arbitrary moment, computed rather than cached.
 *  Every value in this engine is a pure function of (line, wall clock), so
 *  the planner's "show me a different time of day" control can finally reach
 *  the live layer instead of only reordering the route list. */
export function computeStatusAt(at: number): Record<string, LineStatus> {
  const out: Record<string, LineStatus> = {};
  for (const line of TRANSIT_LINES) out[line.id] = computeLine(line, at);
  return out;
}

/** The countdown a trip screen should show for one leg: seeded per stop for
 *  the shared bus lines, and per line for everything else. */
export function arrivalsForLeg(
  lineId: string, fromStopId: string, at: number = Date.now(),
): number[] {
  const line = TRANSIT_LINES.find(l => l.id === lineId);
  if (!line) return [];
  return nextArrivalsFrom(lineId, isStopScheduled(line) ? fromStopId : undefined, at);
}

/** A countdown for one line at one stop. */
export function nextArrivalsFrom(
  lineId: string, stopId: string | undefined, at: number = Date.now(),
): number[] {
  const line = TRANSIT_LINES.find(l => l.id === lineId);
  if (!line) return [];
  const status = computeLine(line, at);
  if (status.status === 'closed' || status.status === 'down') return [];
  return nextArrivals(line, status.headwayMinutes, at, status.status === 'delayed', stopId);
}

function sameStatus(a: LineStatus | undefined, b: LineStatus): boolean {
  if (!a) return false;
  return a.status === b.status &&
    a.detail === b.detail &&
    a.etaMinutes === b.etaMinutes &&
    a.crowd === b.crowd &&
    a.trainsInService === b.trainsInService &&
    a.headwayMinutes[0] === b.headwayMinutes[0] &&
    a.headwayMinutes[1] === b.headwayMinutes[1] &&
    a.nextArrivals.length === b.nextArrivals.length &&
    a.nextArrivals.every((n, i) => n === b.nextArrivals[i]);
}

let snapshot: Record<string, LineStatus> = {};
let lastUpdated = 0;

const boardListeners = new Set<() => void>();
const lineListeners = new Map<string, Set<() => void>>();
let ticker: ReturnType<typeof setInterval> | null = null;

function recompute() {
  const now = Date.now();
  const next: Record<string, LineStatus> = {};
  const changed: string[] = [];

  for (const line of TRANSIT_LINES) {
    const fresh = computeLine(line, now);
    // Reusing the previous object when nothing meaningful changed is what
    // lets a single card subscribe to a single line without re-rendering on
    // every tick of the whole board.
    if (sameStatus(snapshot[line.id], fresh)) {
      next[line.id] = snapshot[line.id];
    } else {
      next[line.id] = fresh;
      changed.push(line.id);
    }
  }

  lastUpdated = now;
  if (changed.length === 0 && Object.keys(snapshot).length > 0) return;

  snapshot = next;
  boardListeners.forEach(cb => cb());
  for (const id of changed) lineListeners.get(id)?.forEach(cb => cb());
}

function startTicker() {
  if (ticker) return;
  ticker = setInterval(recompute, TICK_MS);
}

function stopTicker() {
  if (!ticker) return;
  clearInterval(ticker);
  ticker = null;
}

function hasListeners(): boolean {
  if (boardListeners.size > 0) return true;
  for (const set of lineListeners.values()) if (set.size > 0) return true;
  return false;
}

// A 20-second interval that keeps firing in a backgrounded tab is pure waste,
// and the old engine never cleared its interval at all.
let visibilityBound = false;
function bindVisibility() {
  if (visibilityBound) return;
  visibilityBound = true;

  if (Platform.OS === 'web') {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        stopTicker();
      } else if (hasListeners()) {
        recompute();
        startTicker();
      }
    });
    return;
  }

  AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      if (hasListeners()) { recompute(); startTicker(); }
    } else {
      stopTicker();
    }
  });
}

function ensureRunning() {
  if (Object.keys(snapshot).length === 0) recompute();
  bindVisibility();
  if (hasListeners()) startTicker();
}

// Public API

export function getLiveStatus(): Record<string, LineStatus> {
  if (Object.keys(snapshot).length === 0) recompute();
  return snapshot;
}

export function subscribeLiveStatus(cb: () => void): () => void {
  boardListeners.add(cb);
  ensureRunning();
  return () => {
    boardListeners.delete(cb);
    if (!hasListeners()) stopTicker();
  };
}

export function subscribeLine(lineId: string, cb: () => void): () => void {
  let set = lineListeners.get(lineId);
  if (!set) { set = new Set(); lineListeners.set(lineId, set); }
  set.add(cb);
  ensureRunning();
  return () => {
    set!.delete(cb);
    if (!hasListeners()) stopTicker();
  };
}

/** Recompute now. With a clock-derived model there is nothing to re-roll.
 *  this just advances countdowns to the current second. */
export function refreshLiveStatus() {
  recompute();
}

export function useLiveStatus(): Record<string, LineStatus> {
  return useSyncExternalStore(subscribeLiveStatus, getLiveStatus, getLiveStatus);
}

/** Subscribe to a single line. A card using this re-renders only when its own
 *  service actually changes, not on every tick of the whole board. */
export function useLineStatus(lineId: string | undefined): LineStatus | undefined {
  const subscribe = (cb: () => void) => (lineId ? subscribeLine(lineId, cb) : () => {});
  const get = () => (lineId ? getLiveStatus()[lineId] : undefined);
  return useSyncExternalStore(subscribe, get, get);
}

export function getLastUpdated(): number {
  return lastUpdated;
}

/** The board as it stands, or as it would stand at another moment. The
 *  planner's time control now reaches the live layer: set it to 8am and the
 *  arrivals, the crowding and the closures all move with it, instead of the
 *  route list alone changing while the countdowns stayed on the real clock. */
export function useLiveStatusAt(at: number | null): Record<string, LineStatus> {
  const live = useLiveStatus();
  return useMemo(() => (at == null ? live : computeStatusAt(at)), [at, live]);
}

// Temporary bus bridges
// Derived entirely from monorail/ferry status, not simulated lines of their
// own. Disney brings up shuttle buses to cover a beam outage and pulls them
// once the monorail is running again, so these exist only for as long as
// their trigger condition holds.

export interface TemporaryBridge {
  id: string;
  name: string;
  stations: string[];
  note: string;
}

export function getTemporaryBridges(status: Record<string, LineStatus>): TemporaryBridge[] {
  const epcotMono = status['mono-epcot'];
  const resortMono = status['mono-resort'];
  const expressMono = status['mono-express'];
  const ferry = status['boat-ferry'];
  const bridges: TemporaryBridge[] = [];

  if (epcotMono?.status === 'down') {
    bridges.push({
      id: 'temp-bus-epcot',
      name: 'Temporary Bus: TTC to EPCOT',
      stations: ['Transportation & Ticket Center', 'EPCOT'],
      note: 'Running while the EPCOT Monorail is down. Ends as soon as monorail service resumes.',
    });
  }

  if (resortMono?.status === 'down' && (resortMono.etaMinutes ?? 0) >= 20) {
    bridges.push({
      id: 'temp-bus-resort-loop',
      name: 'Temporary Bus: TTC, Polynesian, Grand Floridian, Contemporary',
      stations: ['Transportation & Ticket Center', 'Polynesian Village', 'Grand Floridian', 'Contemporary'],
      note: 'Added because the Resort Monorail outage is expected to run long. Ends as soon as monorail service resumes.',
    });
  }

  if (expressMono?.status === 'down' && ferry?.status === 'down') {
    bridges.push({
      id: 'temp-bus-mk',
      name: 'Temporary Bus: TTC to Magic Kingdom',
      stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
      note: 'Running while both the Express Monorail and the ferry are down. Ends as soon as monorail service resumes.',
    });
  }

  return bridges;
}

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  operating: 'Operating',
  delayed: 'Delayed',
  down: 'Temporarily Down',
  closed: 'Not Running',
};

/** How much longer a crowd makes you wait. Heavy crowding at park close is
 *  the single biggest driver of real waiting time on this network — you watch
 *  a full monorail leave without you — and until now the app computed a crowd
 *  level and then ignored it everywhere. */
export const CROWD_WAIT_FACTOR: Record<CrowdLevel, number> = {
  light: 1,
  moderate: 1.25,
  heavy: 1.6,
};

export const CROWD_LABEL: Record<CrowdLevel, string> = {
  light: 'Light crowds',
  moderate: 'Moderate crowds',
  heavy: 'Heavy crowds',
};
