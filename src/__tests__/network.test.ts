import { DESTINATIONS } from '../data/destinations';
import { TRANSIT_LINES, isInService } from '../data/lines';
import {
  getActiveRoutes, journeyMinutes, expectedWait, isRouteClosed, applyFilters,
} from '../utils/routing';
import { computeStatusAt, arrivalsForLeg, LineStatus, CROWD_WAIT_FACTOR } from '../utils/liveStatus';
import { ActiveFilters } from '../types';

const BASE: ActiveFilters = { sort: 'fastest', noWater: false, accessible: false };
const AFTERNOON = new Date(2026, 7, 20, 14, 0, 0);
const isPaid = (legs: { mode: string }[]) => legs.some(l => l.mode === 'minnie_van');

const PAIRS: [string, string][] = [];
for (const a of DESTINATIONS) {
  for (const b of DESTINATIONS) if (a.id !== b.id) PAIRS.push([a.id, b.id]);
}

describe('network coverage', () => {
  // The audit that produced these numbers ran over every ordered pair, which
  // is the only way this class of gap shows up: it is never the pair you
  // happen to test by hand.
  it('answers every pair with something other than a paid car', () => {
    const carOnly = PAIRS.filter(([a, b]) =>
      getActiveRoutes(a, b, AFTERNOON).every(r => isPaid(r.legs))
    );
    expect(carOnly).toEqual([]);
  });

  it('never proposes a journey long enough to be a mistake', () => {
    for (const [a, b] of PAIRS) {
      const transit = getActiveRoutes(a, b, AFTERNOON).filter(r => !isPaid(r.legs));
      if (transit.length === 0) continue;
      const best = Math.min(...transit.map(r => journeyMinutes(r)));
      expect([a, b, best <= 95]).toEqual([a, b, true]);
    }
  });

  it('does not offer a paid car for a walk across the street', () => {
    // Boardwalk to Boardwalk Inn is three minutes on foot, and used to come
    // with the offer of a six-minute taxi.
    const routes = getActiveRoutes('BW', 'BWI', AFTERNOON);
    expect(routes.some(r => isPaid(r.legs))).toBe(false);
  });

  it('prices the paid option instead of only disclaiming it', () => {
    const car = getActiveRoutes('POP', 'MK', AFTERNOON).find(r => isPaid(r.legs))!;
    expect(car.priceUsd).toBeGreaterThan(0);
    expect(car.notes).toMatch(/\$\d+/);
  });

  it('connects every pair of stops that share a boat or Skyliner line', () => {
    for (const line of TRANSIT_LINES) {
      if (!line.stops) continue;
      const flat = line.stops.flat();
      for (const from of flat) {
        for (const to of flat) {
          if (from === to) continue;
          const sameStop = line.stops.some(s => s.includes(from) && s.includes(to));
          if (sameStop) continue;
          const direct = getActiveRoutes(from, to, AFTERNOON)
            .some(r => r.legs.length === 1 && r.legs[0].mode === line.mode);
          expect([line.id, from, to, direct]).toEqual([line.id, from, to, true]);
        }
      }
    }
  });
});

describe('operating hours', () => {
  const at = (h: number, m = 0) => new Date(2026, 7, 20, h, m, 0).getTime();

  it('closes every line overnight', () => {
    const board = computeStatusAt(at(3));
    for (const line of TRANSIT_LINES) {
      expect([line.id, board[line.id].status]).toEqual([line.id, 'closed']);
      expect(board[line.id].nextArrivals).toEqual([]);
    }
  });

  it('says why a closed line is closed, and gets the direction right', () => {
    expect(computeStatusAt(at(6))['mono-express'].detail).toMatch(/Service starts at/);
    expect(computeStatusAt(at(23, 45))['sky-hs'].detail).toMatch(/ended for the night/);
  });

  it('runs the monorail during the day', () => {
    const board = computeStatusAt(at(13));
    expect(board['mono-express'].status).not.toBe('closed');
  });

  it('agrees with the window each line publishes', () => {
    for (const line of TRANSIT_LINES) {
      for (const hour of [3, 8, 13, 21, 23]) {
        const date = new Date(2026, 7, 20, hour, 0, 0);
        const running = computeStatusAt(date.getTime())[line.id].status !== 'closed';
        expect([line.id, hour, running]).toEqual([line.id, hour, isInService(line, date)]);
      }
    }
  });
});

describe('live service changes the answer', () => {
  const at = (h: number) => new Date(2026, 7, 20, h, 0, 0).getTime();

  function boardWith(lineId: string, patch: Partial<LineStatus>) {
    const board = computeStatusAt(at(13));
    return { ...board, [lineId]: { ...board[lineId], ...patch } };
  }

  it('charges a down line the length of its own outage', () => {
    const board = computeStatusAt(at(13));
    const running = expectedWait('monorail_express', 'TTC', 'MK',
      { ...board, 'mono-express': { ...board['mono-express'], status: 'operating', crowd: 'light' } });
    const down = expectedWait('monorail_express', 'TTC', 'MK',
      boardWith('mono-express', { status: 'down', etaMinutes: 14, crowd: 'light' }));
    expect(down).toBeGreaterThanOrEqual(14);
    expect(down - running).toBeGreaterThanOrEqual(14);
  });

  it('charges a delayed line more than a running one', () => {
    const plain = expectedWait('bus', 'POP', 'MK',
      boardWith('bus-mk', { status: 'operating', crowd: 'light' }));
    const delayed = expectedWait('bus', 'POP', 'MK',
      boardWith('bus-mk', { status: 'delayed', crowd: 'light' }));
    expect(delayed).toBeGreaterThan(plain);
  });

  it('makes a crowd cost time', () => {
    const light = expectedWait('bus', 'POP', 'MK',
      boardWith('bus-mk', { status: 'operating', crowd: 'light' }));
    const heavy = expectedWait('bus', 'POP', 'MK',
      boardWith('bus-mk', { status: 'operating', crowd: 'heavy' }));
    expect(heavy).toBeGreaterThan(light);
    expect(CROWD_WAIT_FACTOR.heavy).toBeGreaterThan(CROWD_WAIT_FACTOR.light);
  });

  it('drops a route whose line has shut for the night', () => {
    const night = computeStatusAt(new Date(2026, 7, 21, 2, 0, 0).getTime());
    const all = getActiveRoutes('POLY', 'MK', AFTERNOON);
    expect(all.some(r => isRouteClosed(r, night))).toBe(true);
    const kept = applyFilters(all, BASE, night).filter(r => !isPaid(r.legs));
    // The monorail and the launches are shut at two in the morning. The
    // footpath is not, and has no line to close: whatever survives here rides
    // nothing.
    expect(kept.length).toBeGreaterThan(0);
    for (const r of kept) expect(r.legs.every(l => l.mode === 'walk')).toBe(true);
  });
});

describe('shared bus lines', () => {
  const now = new Date(2026, 7, 20, 13, 0, 0).getTime();

  it('gives two resorts on the same line different countdowns', () => {
    const pop = arrivalsForLeg('bus-mk', 'POP', now);
    const akl = arrivalsForLeg('bus-mk', 'AKL', now);
    expect(pop.length).toBeGreaterThan(0);
    expect(pop).not.toEqual(akl);
  });

  it('keeps a countdown stable for the same stop', () => {
    expect(arrivalsForLeg('bus-mk', 'POP', now)).toEqual(arrivalsForLeg('bus-mk', 'POP', now));
  });
});
