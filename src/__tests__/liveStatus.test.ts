import { TRANSIT_LINES } from '../data/lines';
import { getTemporaryBridges, LineStatus, STATUS_LABEL, CROWD_LABEL } from '../utils/liveStatus';

// The engine is a pure function of the clock, so these tests can pin time and
// assert exact behaviour. The previous engine re-seeded itself with
// Math.random() on every load, which made all of this untestable and meant a
// browser refresh silently re-rolled which lines were down.

const REAL_NOW = Date.now;
const freeze = (ms: number) => { Date.now = () => ms; };
afterEach(() => { Date.now = REAL_NOW; });

/** Load a fresh copy of the module so its internal snapshot starts empty. */
function loadEngine() {
  let mod!: typeof import('../utils/liveStatus');
  jest.isolateModules(() => { mod = require('../utils/liveStatus'); });
  return mod;
}

const AUG_20_2026_1400 = new Date(2026, 7, 20, 14, 0, 0, 0).getTime();

describe('determinism', () => {
  it('produces an identical board for the same instant across fresh loads', () => {
    freeze(AUG_20_2026_1400);
    const a = loadEngine().getLiveStatus();
    const b = loadEngine().getLiveStatus();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('survives a reload without re-rolling which lines are disrupted', () => {
    freeze(AUG_20_2026_1400);
    const first = loadEngine().getLiveStatus();
    const disruptedFirst = Object.values(first).filter(s => s.status !== 'operating').map(s => s.lineId);

    // Same instant, brand new module instance — the "refresh the page" case.
    const second = loadEngine().getLiveStatus();
    const disruptedSecond = Object.values(second).filter(s => s.status !== 'operating').map(s => s.lineId);

    expect(disruptedSecond).toEqual(disruptedFirst);
  });

  it('does move over the course of a day', () => {
    const signatures = new Set<string>();
    for (let hour = 8; hour <= 22; hour++) {
      freeze(new Date(2026, 7, 20, hour, 0, 0, 0).getTime());
      const board = loadEngine().getLiveStatus();
      signatures.add(Object.values(board).map(s => `${s.lineId}:${s.status}`).join(','));
    }
    expect(signatures.size).toBeGreaterThan(1);
  });
});

describe('board shape', () => {
  let board: Record<string, LineStatus>;
  beforeEach(() => {
    freeze(AUG_20_2026_1400);
    board = loadEngine().getLiveStatus();
  });

  it('covers every transit line', () => {
    for (const line of TRANSIT_LINES) expect(board[line.id]).toBeDefined();
  });

  it('gives a down line an estimated return time and no departures', () => {
    for (const s of Object.values(board)) {
      if (s.status !== 'down') continue;
      expect(s.etaMinutes).toBeGreaterThan(0);
      expect(s.nextArrivals).toEqual([]);
      expect(s.detail).toBeTruthy();
    }
  });

  it('gives a running line non-negative, ordered departures', () => {
    for (const s of Object.values(board)) {
      if (s.status === 'down') continue;
      for (const m of s.nextArrivals) expect(m).toBeGreaterThanOrEqual(0);
      if (s.nextArrivals.length === 2) {
        expect(s.nextArrivals[0]).toBeLessThanOrEqual(s.nextArrivals[1]);
      }
    }
  });

  it('reports departures for every line except the continuously loading ones', () => {
    for (const line of TRANSIT_LINES) {
      const s = board[line.id];
      if (s.status === 'down') continue;
      const continuous = s.headwayMinutes[1] <= 1;
      expect(s.nextArrivals.length).toBe(continuous ? 0 : 2);
    }
  });

  it('derives monorail headway from the number of trains on the beam', () => {
    for (const id of ['mono-express', 'mono-resort', 'mono-epcot']) {
      const s = board[id];
      expect(s.trainsInService).toBeGreaterThanOrEqual(2);
      expect(s.trainsInService).toBeLessThanOrEqual(4);
    }
    expect(board['mono-epcot'].trainsInService).toBe(2);
    expect(board['bus-mk'].trainsInService).toBeNull();
  });

  it('uses only known status and crowd labels', () => {
    for (const s of Object.values(board)) {
      expect(STATUS_LABEL[s.status]).toBeTruthy();
      expect(CROWD_LABEL[s.crowd]).toBeTruthy();
    }
  });
});

describe('countdowns', () => {
  it('tick downward as time passes rather than jumping around', () => {
    freeze(AUG_20_2026_1400);
    const board = loadEngine().getLiveStatus();

    // Pick any line that is running and has a scheduled departure board.
    const line = TRANSIT_LINES.find(l => {
      const s = board[l.id];
      return s.status === 'operating' && s.nextArrivals.length === 2;
    });
    expect(line).toBeDefined();

    let previous: number | null = null;
    let decreases = 0;

    for (let minute = 0; minute < 20; minute++) {
      freeze(AUG_20_2026_1400 + minute * 60_000);
      const s = loadEngine().getLiveStatus()[line!.id];
      if (s.status !== 'operating') break;
      const next = s.nextArrivals[0];

      if (previous !== null) {
        if (next < previous) {
          decreases++;
        } else if (next > previous) {
          // A countdown may only reset upward once a departure has left.
          expect(previous).toBeLessThanOrEqual(1);
        }
      }
      previous = next;
    }

    expect(decreases).toBeGreaterThan(3);
  });
});

describe('coordinated outages', () => {
  it('never strands a single Seven Seas Lagoon boat while its dock-mates run', () => {
    const lagoon = ['boat-ferry', 'boat-gold', 'boat-red', 'boat-green', 'boat-blue'];
    // Weather takes the whole body of water at once; an ordinary single-line
    // fault does not. Scan a full day of half-hour windows for a state where
    // a weather message appears on some but not all of the group.
    for (let m = 0; m < 24 * 60; m += 10) {
      freeze(new Date(2026, 7, 20, 0, 0, 0, 0).getTime() + m * 60_000);
      const board = loadEngine().getLiveStatus();
      const weathered = lagoon.filter(id => /lightning|weather|winds/i.test(board[id].detail ?? ''));
      if (weathered.length === 0) continue;
      expect(weathered.length).toBe(lagoon.length);
    }
  });

  it('brings up a temporary bus only while the beam it covers is down', () => {
    for (let m = 0; m < 24 * 60; m += 10) {
      freeze(new Date(2026, 7, 20, 0, 0, 0, 0).getTime() + m * 60_000);
      const board = loadEngine().getLiveStatus();
      const bridges = getTemporaryBridges(board);
      const hasEpcotBridge = bridges.some(b => b.id === 'temp-bus-epcot');
      expect(hasEpcotBridge).toBe(board['mono-epcot'].status === 'down');
    }
  });
});
