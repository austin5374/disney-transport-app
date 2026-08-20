import { useSyncExternalStore } from 'react';
import { TRANSIT_LINES, TransitLine } from '../data/lines';

// ─── Simulated live status engine ────────────────────────────────────────────
// A single shared store drives every screen so the whole app agrees on what's
// running. Statuses drift over time (weighted random transitions on a tick),
// outages carry a return-to-service countdown, and arrival times are real
// timestamps so countdowns are smooth and consistent.

export type ServiceStatus = 'operating' | 'delayed' | 'down';
export type CrowdLevel = 'light' | 'moderate' | 'heavy';

export interface LineStatus {
  lineId: string;
  status: ServiceStatus;
  detail: string | null;
  etaMinutes: number | null;     // for 'down': estimated minutes to restore
  nextArrivals: number[];        // minutes until next departures (0 = boarding)
  crowd: CrowdLevel;
  updatedAt: number;
  headwayMinutes: [number, number]; // effective headway (monorail: derived from trainsInService)
  trainsInService: number | null;   // monorail only: how many trains are running this beam
}

interface InternalLineState {
  status: ServiceStatus;
  detail: string | null;
  restoreAt: number | null;      // epoch ms when a disruption clears
  arrivalTimestamps: number[];   // epoch ms of upcoming departures
  crowd: CrowdLevel;
  trainsInService: number | null;
}

const TICK_MS = 20_000;

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.round(rand(min, max));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Monorail headway model ──────────────────────────────────────────────────
// Each monorail line ("beam") runs a fixed number of trains at a time, and
// headway follows directly from that count rather than being a flat range.
//   EPCOT line:   always 2 trains  → 8–10 min headway
//   Express line: 3 trains → 3–4 min · 4 trains → 2–3 min
//   Resort line:  3 trains → 8–9 min · 4 trains (typical) → 4–5 min
function rollTrainsInService(lineId: string): number | null {
  if (lineId === 'mono-epcot') return 2;
  if (lineId === 'mono-express') return Math.random() < 0.5 ? 3 : 4;
  if (lineId === 'mono-resort') return Math.random() < 0.7 ? 4 : 3;
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

// ─── Disruption copy ─────────────────────────────────────────────────────────
// Weather-caused outages (lightning, high wind) are handled separately below
// so they can be coordinated across a whole area/system at once, instead of
// each line independently rolling its own "it's storming" outage. These pools
// are for the ordinary, single-line, non-weather reasons a line goes down.

const DOWN_MESSAGES: Record<string, string[]> = {
  Monorail: [
    'Down for mechanical inspection',
    'Track switching issue near TTC, crews on scene',
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

// ─── Coordinated weather outages ─────────────────────────────────────────────
// Real WDW watercraft and the Skyliner are grouped by the body of water / cable
// system they actually run on, so a storm cell takes out everything on that
// system together — never the whole property's boats at once, and never one
// boat alone while its dock-mates keep running. Monorail is lightning-only
// (never grounded for wind or rain) and escalates: the EPCOT beam is longest
// and most exposed, so it goes down first; if the storm continues, the Resort
// and Express beams go down together right after. All three come back at once
// once the beam is confirmed clear.

const SEVEN_SEAS_LAGOON_BOATS = ['boat-ferry', 'boat-gold', 'boat-red', 'boat-green', 'boat-blue'];
const CRESCENT_LAKE_BOATS = ['boat-friendship'];
const DISNEY_SPRINGS_BOATS = ['boat-sassagoula'];
const BOAT_ZONES = [SEVEN_SEAS_LAGOON_BOATS, CRESCENT_LAKE_BOATS, DISNEY_SPRINGS_BOATS];
const SKYLINER_SYSTEM = ['sky-epcot', 'sky-hs', 'sky-pop'];

const BOAT_WEATHER_MESSAGES = ['Docked for lightning in the area', 'Docked for weather, high winds on the water'];
const SKYLINER_WEATHER_MESSAGES = ['Suspended for lightning in the area', 'Suspended for high winds'];
const MONORAIL_LIGHTNING_STAGE1 = 'Suspended for lightning in the area — EPCOT Line affected first, its beam runs longest';
const MONORAIL_LIGHTNING_STAGE2 = 'Lightning in the area, all monorail beams suspended until it clears';

// Puts every line in a group down together on a shared restoreAt, so the
// existing per-line "clear expired disruption" check in tick() naturally
// brings the whole group back in the same tick — no separate recovery path
// needed. Skips lines already down (weather or otherwise) so one event
// doesn't stomp another already in progress.
function maybeStartGroupWeather(lineIds: string[], messages: string[], chance: number, durationMinutes: [number, number]) {
  if (lineIds.some(id => state.get(id)!.status === 'down')) return;
  if (Math.random() >= chance) return;
  const restoreAt = Date.now() + randInt(durationMinutes[0], durationMinutes[1]) * 60_000;
  const message = pick(messages);
  for (const id of lineIds) {
    const s = state.get(id)!;
    s.status = 'down';
    s.detail = message;
    s.restoreAt = restoreAt;
    s.arrivalTimestamps = [];
  }
}

function maybeAdvanceMonorailLightning() {
  const epcot = state.get('mono-epcot')!;
  const resort = state.get('mono-resort')!;
  const express = state.get('mono-express')!;

  const stage2 = resort.status === 'down' && resort.detail === MONORAIL_LIGHTNING_STAGE2;
  if (stage2) return; // already worst-case; shared restoreAt will clear all three together

  const stage1 = epcot.status === 'down' && epcot.detail === MONORAIL_LIGHTNING_STAGE1;
  if (stage1) {
    if (Math.random() < 0.05) {
      const restoreAt = Date.now() + randInt(15, 30) * 60_000;
      for (const s of [epcot, resort, express]) {
        s.status = 'down';
        s.detail = MONORAIL_LIGHTNING_STAGE2;
        s.restoreAt = restoreAt;
        s.arrivalTimestamps = [];
      }
    }
    return;
  }

  if (epcot.status === 'operating' && Math.random() < 0.0025) {
    epcot.status = 'down';
    epcot.detail = MONORAIL_LIGHTNING_STAGE1;
    epcot.restoreAt = Date.now() + randInt(10, 20) * 60_000;
    epcot.arrivalTimestamps = [];
  }
}

// ─── Store ───────────────────────────────────────────────────────────────────

const state = new Map<string, InternalLineState>();
let snapshot: Record<string, LineStatus> = {};
let lastUpdated = Date.now();
const listeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | null = null;

function crowdBaseline(): CrowdLevel {
  const h = new Date().getHours();
  if (h >= 7 && h < 11) return 'heavy';     // morning rush to parks
  if (h >= 20 && h < 23) return 'heavy';    // park-close exodus
  if (h >= 11 && h < 14) return 'moderate';
  if (h >= 17 && h < 20) return 'moderate';
  return 'light';
}

function rollCrowd(): CrowdLevel {
  const base = crowdBaseline();
  const r = Math.random();
  if (base === 'heavy')    return r < 0.6 ? 'heavy' : r < 0.9 ? 'moderate' : 'light';
  if (base === 'moderate') return r < 0.55 ? 'moderate' : r < 0.8 ? 'light' : 'heavy';
  return r < 0.7 ? 'light' : r < 0.95 ? 'moderate' : 'heavy';
}

function seedArrivals(headway: [number, number], from = Date.now()): number[] {
  const [minH, maxH] = headway;
  if (maxH <= 1) return []; // continuous loading (Skyliner)
  const first = from + rand(0.3, maxH) * 60_000;
  const second = first + rand(Math.max(minH, 3), maxH) * 60_000;
  return [first, second];
}

function applyDisruption(line: TransitLine, s: InternalLineState, kind: ServiceStatus) {
  s.status = kind;
  if (kind === 'down') {
    s.detail = pick(DOWN_MESSAGES[line.group]);
    s.restoreAt = Date.now() + randInt(8, 25) * 60_000;
  } else if (kind === 'delayed') {
    s.detail = pick(DELAY_MESSAGES[line.group]);
    s.restoreAt = Date.now() + randInt(5, 15) * 60_000;
  } else {
    s.detail = null;
    s.restoreAt = null;
  }
}

function initState() {
  const now = Date.now();
  for (const line of TRANSIT_LINES) {
    const trainsInService = rollTrainsInService(line.id);
    state.set(line.id, {
      status: 'operating',
      detail: null,
      restoreAt: null,
      trainsInService,
      arrivalTimestamps: seedArrivals(effectiveHeadway(line, trainsInService), now),
      crowd: rollCrowd(),
    });
  }
  // Seed an interesting board: one line down, two delayed
  const shuffled = [...TRANSIT_LINES].sort(() => Math.random() - 0.5);
  applyDisruption(shuffled[0], state.get(shuffled[0].id)!, 'down');
  applyDisruption(shuffled[1], state.get(shuffled[1].id)!, 'delayed');
  applyDisruption(shuffled[2], state.get(shuffled[2].id)!, 'delayed');
}

function tick() {
  const now = Date.now();

  // Coordinated weather first, so the per-line loop below sees these lines
  // already 'down' and skips rolling an independent disruption on top.
  for (const zone of BOAT_ZONES) {
    maybeStartGroupWeather(zone, BOAT_WEATHER_MESSAGES, 0.0015, [10, 30]);
  }
  maybeStartGroupWeather(SKYLINER_SYSTEM, SKYLINER_WEATHER_MESSAGES, 0.002, [8, 25]);
  maybeAdvanceMonorailLightning();

  for (const line of TRANSIT_LINES) {
    const s = state.get(line.id)!;

    const headway = effectiveHeadway(line, s.trainsInService);

    // Clear expired disruptions
    if (s.restoreAt && now >= s.restoreAt) {
      applyDisruption(line, s, 'operating');
      s.arrivalTimestamps = seedArrivals(headway, now);
    }

    // Random new disruptions (rare per tick; steady-state ≈ 2-3 advisories
    // across the 19 lines, mostly delays)
    if (s.status === 'operating') {
      const r = Math.random();
      if (r < 0.0015) applyDisruption(line, s, 'down');
      else if (r < 0.006) applyDisruption(line, s, 'delayed');
    }

    // Advance the arrival board
    if (s.status !== 'down') {
      s.arrivalTimestamps = s.arrivalTimestamps.filter(t => t > now - 30_000);
      const [minH, maxH] = headway;
      const delayFactor = s.status === 'delayed' ? 1.6 : 1;
      while (s.arrivalTimestamps.length < 2 && maxH > 1) {
        const base = s.arrivalTimestamps.length
          ? s.arrivalTimestamps[s.arrivalTimestamps.length - 1]
          : now;
        s.arrivalTimestamps.push(base + rand(Math.max(minH, 2), maxH) * delayFactor * 60_000);
      }
    } else {
      s.arrivalTimestamps = [];
    }

    // Occasionally re-roll crowding
    if (Math.random() < 0.1) s.crowd = rollCrowd();
  }
  lastUpdated = now;
  publish();
}

function publish() {
  const now = Date.now();
  const next: Record<string, LineStatus> = {};
  for (const line of TRANSIT_LINES) {
    const s = state.get(line.id)!;
    next[line.id] = {
      lineId: line.id,
      status: s.status,
      detail: s.detail,
      etaMinutes: s.restoreAt && s.status === 'down'
        ? Math.max(1, Math.ceil((s.restoreAt - now) / 60_000))
        : null,
      nextArrivals: s.arrivalTimestamps
        .map(t => Math.max(0, Math.round((t - now) / 60_000)))
        .slice(0, 2),
      crowd: s.crowd,
      updatedAt: lastUpdated,
      headwayMinutes: effectiveHeadway(line, s.trainsInService),
      trainsInService: s.trainsInService,
    };
  }
  snapshot = next;
  listeners.forEach(cb => cb());
}

function ensureRunning() {
  if (state.size === 0) {
    initState();
    publish();
  }
  if (!ticker) ticker = setInterval(tick, TICK_MS);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getLiveStatus(): Record<string, LineStatus> {
  ensureRunning();
  return snapshot;
}

export function subscribeLiveStatus(cb: () => void): () => void {
  ensureRunning();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Pull-to-refresh: nudge arrival estimates and re-publish immediately. */
export function refreshLiveStatus() {
  ensureRunning();
  for (const line of TRANSIT_LINES) {
    const s = state.get(line.id)!;
    if (s.status !== 'down' && Math.random() < 0.4) {
      s.arrivalTimestamps = s.arrivalTimestamps.map(t => t + randInt(-45, 45) * 1000);
    }
  }
  lastUpdated = Date.now();
  publish();
}

export function useLiveStatus(): Record<string, LineStatus> {
  return useSyncExternalStore(subscribeLiveStatus, getLiveStatus, getLiveStatus);
}

export function useLineStatus(lineId: string): LineStatus | undefined {
  return useLiveStatus()[lineId];
}

export function getLastUpdated(): number {
  return lastUpdated;
}

// ─── Temporary bus bridges ───────────────────────────────────────────────────
// Derived entirely from monorail/ferry status, not simulated lines of their
// own — Disney brings up shuttle buses to cover a beam outage, and pulls them
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
      name: 'Temporary Bus: TTC ↔ EPCOT',
      stations: ['Transportation & Ticket Center', 'EPCOT'],
      note: 'Running while the EPCOT Monorail is down. Ends as soon as monorail service resumes.',
    });
  }

  if (resortMono?.status === 'down' && (resortMono.etaMinutes ?? 0) >= 30) {
    bridges.push({
      id: 'temp-bus-resort-loop',
      name: 'Temporary Bus: TTC · Polynesian · Grand Floridian · Contemporary',
      stations: ['Transportation & Ticket Center', 'Polynesian Village', 'Grand Floridian', 'Contemporary'],
      note: 'Added because the Resort Monorail outage is expected to run long. Ends as soon as monorail service resumes.',
    });
  }

  if (expressMono?.status === 'down' && ferry?.status === 'down') {
    bridges.push({
      id: 'temp-bus-mk',
      name: 'Temporary Bus: TTC ↔ Magic Kingdom',
      stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
      note: 'Running while both the Express Monorail and the ferry are down. Ends as soon as monorail service resumes.',
    });
  }

  return bridges;
}

// Status display helpers
export const STATUS_LABEL: Record<ServiceStatus, string> = {
  operating: 'Operating',
  delayed: 'Delayed',
  down: 'Temporarily Down',
};

export const CROWD_LABEL: Record<CrowdLevel, string> = {
  light: 'Light crowds',
  moderate: 'Moderate crowds',
  heavy: 'Heavy crowds',
};
