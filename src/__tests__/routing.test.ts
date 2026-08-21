import {
  getActiveRoutes, applyFilters, journeyMinutes, waitMinutesFor,
  transferCount, driveMinutes, describeExclusions, expectedWait,
  describeTimeGaps, restrictionLabel,
} from '../utils/routing';
import { DESTINATIONS } from '../data/destinations';
import { RAIL_STATIONS } from '../data/rail';
import { lineForLeg } from '../data/lines';
import { ActiveFilters, Route } from '../types';

const IDS = DESTINATIONS.map(d => d.id);
const PAIRS: [string, string][] = [];
for (const a of IDS) for (const b of IDS) if (a !== b) PAIRS.push([a, b]);

const BASE: ActiveFilters = { sort: 'fastest', noWater: false, accessible: false };
const at = (hour: number) => {
  const d = new Date(2026, 7, 20, hour, 0, 0, 0);
  return d;
};
const isPaid = (r: Route) => r.legs.some(l => l.mode === 'minnie_van');

describe('journey cost model', () => {
  it('counts wait, ride, and walk, not ride alone', () => {
    const [r] = getActiveRoutes('POLY', 'MK', at(11));
    const ride = r.legs.reduce((s, l) => s + l.rideMinutes, 0);
    expect(journeyMinutes(r)).toBeGreaterThanOrEqual(ride);
    expect(journeyMinutes(r)).toBe(ride
      + r.legs.reduce((s, l) => s + (l.walkMinutes ?? 0), 0)
      + waitMinutesFor(r));
  });

  it('charges no wait for continuously loading systems', () => {
    expect(expectedWait('skyliner', 'CBR', 'HS')).toBe(0);
  });

  it('charges a real wait for buses', () => {
    expect(expectedWait('bus', 'POP', 'MK')).toBeGreaterThanOrEqual(5);
  });

  it('charges nothing for walking or a booked car', () => {
    expect(expectedWait('walk', 'BW', 'BWI')).toBe(0);
    expect(expectedWait('minnie_van', 'MK', 'EP')).toBe(0);
  });
});

describe('paid rides', () => {
  it('scales drive time with distance instead of a flat guess', () => {
    // Neighbors should be much shorter than opposite corners of the property.
    const near = driveMinutes('YC', 'BC');
    const far = driveMinutes('MK', 'AKL');
    expect(near).toBeLessThan(far);
    expect(far - near).toBeGreaterThan(3);
  });

  it('is symmetric', () => {
    for (const [a, b] of [['MK', 'EP'], ['POP', 'AKL'], ['DS', 'HS']]) {
      expect(driveMinutes(a, b)).toBe(driveMinutes(b, a));
    }
  });

  it('never ranks above a transit option', () => {
    // The previous engine handed a paid car the "Fastest" badge on 639 of the
    // 1,056 ordered pairs, because it was a flat 18 minutes and transit was
    // charged nothing for waiting.
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      const routes = applyFilters(getActiveRoutes(a, b, at(11)), BASE);
      if (routes.length > 1 && isPaid(routes[0])) offenders.push(`${a}>${b}`);
    }
    expect(offenders).toEqual([]);
  });
});

describe('coverage', () => {
  it('returns at least one option for every ordered pair, at every hour tested', () => {
    for (const hour of [8, 11, 15, 21]) {
      const empty = PAIRS.filter(([a, b]) => getActiveRoutes(a, b, at(hour)).length === 0);
      expect(empty).toEqual([]);
    }
  });

  it('offers a transit option, not just a car, for the overwhelming majority of pairs', () => {
    const carOnly = PAIRS.filter(([a, b]) =>
      getActiveRoutes(a, b, at(11)).every(isPaid)
    );
    expect(carOnly.length / PAIRS.length).toBeLessThan(0.02);
  });

  it('produces routes whose legs actually connect origin to destination', () => {
    for (const [a, b] of PAIRS.slice(0, 400)) {
      for (const r of getActiveRoutes(a, b, at(11))) {
        expect(r.legs[0].from).toBe(r.from);
        expect(r.legs[r.legs.length - 1].to).toBe(r.to);
        for (let i = 1; i < r.legs.length; i++) {
          expect(r.legs[i - 1].to).toBe(r.legs[i].from);
        }
      }
    }
  });
});

describe('filters', () => {
  it('"fastest" orders transit by total journey time', () => {
    for (const [a, b] of PAIRS.slice(0, 300)) {
      const transit = applyFilters(getActiveRoutes(a, b, at(11)), BASE).filter(r => !isPaid(r));
      for (let i = 1; i < transit.length; i++) {
        expect(journeyMinutes(transit[i - 1])).toBeLessThanOrEqual(journeyMinutes(transit[i]));
      }
    }
  });

  it('"transfers" puts the simplest trip first', () => {
    const filters: ActiveFilters = { ...BASE, sort: 'transfers' };
    for (const [a, b] of PAIRS.slice(0, 300)) {
      const transit = applyFilters(getActiveRoutes(a, b, at(11)), filters).filter(r => !isPaid(r));
      for (let i = 1; i < transit.length; i++) {
        expect(transferCount(transit[i - 1])).toBeLessThanOrEqual(transferCount(transit[i]));
      }
    }
  });

  it('changes the order on a real share of the pairs where it could', () => {
    // A sort control whose alternate state changes nothing is decoration. The
    // old "Fastest first" pill was exactly that: both branches of applyFilters
    // sorted by time, so turning it off only hid a badge.
    //
    // Only pairs offering more than one transit option can reorder at all, so
    // measure against that population rather than all 1,056 pairs.
    let couldDiffer = 0;
    let didDiffer = 0;
    for (const [a, b] of PAIRS) {
      const all = getActiveRoutes(a, b, at(11));
      if (all.filter(r => !isPaid(r)).length < 2) continue;
      couldDiffer++;
      const fastest = applyFilters(all, BASE).map(r => r.id).join('|');
      const fewest = applyFilters(all, { ...BASE, sort: 'transfers' }).map(r => r.id).join('|');
      if (fastest !== fewest) didDiffer++;
    }
    expect(couldDiffer).toBeGreaterThan(300);
    expect(didDiffer).toBeGreaterThan(25);

    // And a concrete case, so this cannot pass on statistics alone. EPCOT to
    // Hollywood Studios is the real tradeoff the control exists for: the
    // Skyliner is much quicker but changes cabins at Caribbean Beach, while
    // the bus is direct and slow.
    const all = getActiveRoutes('EP', 'HS', at(11));
    const fastestFirst = applyFilters(all, BASE).filter(r => !isPaid(r))[0];
    const fewestFirst = applyFilters(all, { ...BASE, sort: 'transfers' }).filter(r => !isPaid(r))[0];
    expect(fastestFirst.id).not.toBe(fewestFirst.id);
    expect(journeyMinutes(fastestFirst)).toBeLessThan(journeyMinutes(fewestFirst));
    expect(transferCount(fewestFirst)).toBeLessThan(transferCount(fastestFirst));
  });

  it('"no boats" removes every watercraft route it claims to', () => {
    for (const [a, b] of PAIRS.slice(0, 400)) {
      const kept = applyFilters(getActiveRoutes(a, b, at(11)), { ...BASE, noWater: true });
      expect(kept.filter(r => r.tags.includes('water'))).toEqual([]);
    }
  });

  it('"step-free" removes every route with an inaccessible leg', () => {
    for (const [a, b] of PAIRS.slice(0, 400)) {
      const kept = applyFilters(getActiveRoutes(a, b, at(11)), { ...BASE, accessible: true });
      for (const r of kept) expect(r.legs.every(l => l.accessible)).toBe(true);
    }
  });

  it('explains itself whenever a filter is what emptied the list', () => {
    // The old empty state said "No Disney transport available" even when the
    // user's own filter was responsible, which was true on 62 pairs.
    let checked = 0;
    for (const [a, b] of PAIRS) {
      const all = getActiveRoutes(a, b, at(11));
      for (const filters of [
        { ...BASE, noWater: true },
        { ...BASE, accessible: true },
      ] as ActiveFilters[]) {
        const transit = applyFilters(all, filters).filter(r => !isPaid(r));
        const allTransit = all.filter(r => !isPaid(r));
        if (transit.length === 0 && allTransit.length > 0) {
          expect(describeExclusions(all, filters).length).toBeGreaterThan(0);
          checked++;
        }
      }
    }
    // Guard against the assertion silently never running.
    expect(checked).toBeGreaterThan(0);
  });
});

describe('time-of-day rules', () => {
  it('changes what is offered between early morning and midday', () => {
    const differing = PAIRS.filter(([a, b]) =>
      getActiveRoutes(a, b, at(8)).map(r => r.id).join('|') !==
      getActiveRoutes(a, b, at(11)).map(r => r.id).join('|')
    );
    expect(differing.length).toBeGreaterThan(0);
  });

  it('withholds the direct park-to-park bus before 10 AM', () => {
    const ids = (hour: number) =>
      getActiveRoutes('MK', 'HS', at(hour)).map(r => r.id);

    // Before opening the direct bus is not running, so every option is a
    // transfer through somewhere whose own buses are.
    expect(ids(8)).not.toContain('mk-hs-bus');
    const early = getActiveRoutes('MK', 'HS', at(8)).filter(r => !isPaid(r));
    expect(early.length).toBeGreaterThan(0);
    for (const r of early) expect(r.legs.length).toBeGreaterThan(1);

    // Once park-to-park service starts, the direct bus replaces them.
    expect(ids(11)).toContain('mk-hs-bus');
    expect(getActiveRoutes('MK', 'HS', at(11)).filter(r => !isPaid(r) && r.id.startsWith('synth-')))
      .toEqual([]);
  });

  it('picks the transfer hub by cost rather than from a hardcoded default', () => {
    // The route file used to answer every early-morning trip out of the Magic
    // Kingdom with one hand-written line: walk twelve minutes to the Grand
    // Floridian and take its bus. That was the answer for Hollywood Studios,
    // for Disney Springs and for Animal Kingdom alike, whichever resort was
    // actually the right one and whichever way was actually quickest — while
    // the same app, asked for the Contemporary directly, correctly offered
    // the monorail.
    for (const dest of ['DS', 'AK', 'TL', 'BB']) {
      const best = applyFilters(getActiveRoutes('MK', dest, at(8)), BASE)
        .filter(r => !isPaid(r))[0];
      expect(best.legs[0].to).toBe('CON');
      expect(best.legs[0].mode).toBe('monorail_resort');
    }
  });

  it('compares every mode that can reach the hub, not just the first one found', () => {
    // Grand Floridian as a destination offered a walk, a boat and a monorail
    // and ranked them. Grand Floridian as a stop on the way offered a walk.
    const early = getActiveRoutes('MK', 'DS', at(8)).filter(r => !isPaid(r));
    const accessModes = new Set(early.map(r => r.legs[0].mode));
    expect(accessModes.size).toBeGreaterThan(1);
  });

  it('never boards a flagged-down resort launch when the hop has another option', () => {
    // A flag launch is twenty minutes apart and has to be waited for at a
    // dock. It is a fine way to reach a resort you are going to and a bad way
    // to reach a bus, so a transfer only rides one where the hop has nothing
    // else at all — Wilderness Lodge to the Contemporary, and no more.
    const LAUNCHES = ['water_taxi_gold', 'water_taxi_red', 'water_taxi_green', 'water_taxi_blue'];
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const hour of [8, 13]) {
        for (const r of getActiveRoutes(a, b, at(hour))) {
          if (r.legs.length < 2) continue;
          for (const leg of r.legs) {
            if (!LAUNCHES.includes(leg.mode)) continue;
            const alternatives = getActiveRoutes(leg.from, leg.to, at(hour)).filter(alt =>
              alt.legs.length === 1 && !isPaid(alt) && !LAUNCHES.includes(alt.legs[0].mode));
            if (alternatives.length > 0) offenders.push(`${a}>${b}: ${r.id} rides ${leg.mode}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('never connects through a resort launch on the Magic Kingdom side', () => {
    // Every resort the launches serve is also on the monorail loop or a
    // footpath, so the boat is never the way to reach a connection there.
    const LAUNCHES = ['water_taxi_gold', 'water_taxi_red', 'water_taxi_green', 'water_taxi_blue'];
    for (const [, b] of PAIRS.filter(([x]) => x === 'MK')) {
      for (const r of getActiveRoutes('MK', b, at(8))) {
        if (r.legs.length < 2) continue;
        expect(r.legs.some(l => LAUNCHES.includes(l.mode))).toBe(false);
      }
    }
  });
});

describe('walking', () => {
  it('offers the footpath between the All-Star resorts, and demotes the bus', () => {
    // The only options here were two eighty-minute bus rides through a theme
    // park, the first of them presented as the quickest way — between two
    // resorts that share a sidewalk.
    for (const [a, b] of [['ASMo', 'ASS'], ['ASS', 'ASMo']] as [string, string][]) {
      const transit = applyFilters(getActiveRoutes(a, b, at(11)), BASE).filter(r => !isPaid(r));
      expect(transit[0].legs.every(l => l.mode === 'walk')).toBe(true);
      expect(transit[0].tags).toContain('walk_only');
      const buses = transit.filter(r => r.legs.some(l => l.mode === 'bus'));
      expect(buses.length).toBeGreaterThan(0);
      for (const r of buses) expect(r.tags).toContain('last_resort');
      // ...and a demoted route sorts below everything that is not demoted.
      const lastReal = transit.findIndex(r => r.tags.includes('last_resort'));
      expect(transit.slice(lastReal).every(r => r.tags.includes('last_resort'))).toBe(true);
    }
  });

  it('walks a paved path in both directions', () => {
    // Authored one way and one way only, which is how EPCOT came to have a
    // six-minute walk to the Boardwalk Inn that it would only tell you about
    // if you asked from the Boardwalk Inn.
    const walkable = (a: string, b: string) =>
      getActiveRoutes(a, b, at(13)).some(r => r.legs.every(l => l.mode === 'walk'));
    const asymmetric: string[] = [];
    for (const [a, b] of PAIRS) {
      if (walkable(a, b) !== walkable(b, a)) asymmetric.push(`${a} / ${b}`);
    }
    expect(asymmetric).toEqual([]);
  });
});

describe('mirrored routes', () => {
  it('carry guidance rather than dropping it', () => {
    // A third of all pairs are served by reversing data authored in the other
    // direction. Those used to arrive with every boarding tip stripped.
    const mirrored = getActiveRoutes('TTC', 'FW', at(11))
      .filter(r => r.id.endsWith('-rev'));
    for (const r of mirrored) {
      for (const leg of r.legs) {
        if (leg.mode === 'walk' || leg.mode === 'minnie_van') continue;
        expect(typeof leg.tip).toBe('string');
        expect(leg.tip!.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('monorail stations', () => {
  it('always offer the train between two stops on the same beam', () => {
    // This is the integration check behind the generator: whatever else the
    // planner turns up for these pairs, the monorail has to be in the list.
    // Before, eight resort-loop pairs came back with a walk or a boat and no
    // train, so walking was not just an option, it was the only one.
    const missing: string[] = [];
    for (const { stops } of RAIL_STATIONS) {
      for (const from of stops) {
        for (const to of stops) {
          if (from === to) continue;
          const routes = applyFilters(getActiveRoutes(from, to, at(13)), BASE);
          if (!routes.some(r => r.legs.some(l => l.mode.startsWith('monorail')))) {
            missing.push(`${from} to ${to}`);
          }
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('still offer the walk where walking is reasonable', () => {
    // Removing the walk would be the opposite mistake. Between the TTC and
    // the Polynesian it is genuinely the quicker way.
    const routes = applyFilters(getActiveRoutes('TTC', 'POLY', at(13)), BASE);
    expect(routes.some(r => r.legs.every(l => l.mode === 'walk'))).toBe(true);
    expect(routes.some(r => r.legs.some(l => l.mode === 'monorail_resort'))).toBe(true);
  });

  it('never synthesizes a transfer that is two walks glued together', () => {
    // A hand-authored multi-leg walk is fine, and sometimes the honest
    // description of one continuous path: Grand Floridian to the TTC really
    // does go past the Polynesian. What is nonsense is the hub composer
    // stitching two unrelated walks into a "transfer".
    const silly: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const r of getActiveRoutes(a, b, at(13))) {
        if (r.id.startsWith('synth-') && r.legs.every(l => l.mode === 'walk')) {
          silly.push(`${a} to ${b}: ${r.id}`);
        }
      }
    }
    expect(silly).toEqual([]);
  });
});

describe('hub transfers', () => {
  it('never transfers by walking to a different stop mid-trip', () => {
    // If a trip walks from one place to another and then boards something,
    // the transfer really happened at the far end of that walk, not at the
    // hub the composer picked. Left unchecked it produced "bus to the TTC,
    // walk to the Polynesian, take the Polynesian's bus to Animal Kingdom".
    const bad: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const r of getActiveRoutes(a, b, at(13))) {
        if (!r.id.startsWith('synth-')) continue;
        for (let i = 1; i < r.legs.length - 1; i++) {
          if (r.legs[i].mode === 'walk') bad.push(`${a} to ${b}: ${r.id}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('can still use a park bus as a transfer, restricted hours and all', () => {
    // bestSegment used to reject anything carrying a timeRestriction, which
    // threw away every park-to-park bus and left the Swan with no way to
    // reach Animal Kingdom except a paid car.
    const routes = applyFilters(getActiveRoutes('SW', 'AK', at(13)), BASE);
    const transit = routes.filter(r => !isPaid(r));
    expect(transit.length).toBeGreaterThan(0);
    expect(transit[0].legs.some(l => l.mode === 'bus')).toBe(true);
  });

  it('waits for Disney Springs park buses to start before offering them', () => {
    // Resorts have a Disney Springs bus all day; the parks only get one in the
    // late afternoon. Asked from the park itself, the difference is the whole
    // answer rather than one option among several.
    const legsAt = (hour: number) =>
      applyFilters(getActiveRoutes('HS', 'DS', at(hour)), BASE)
        .filter(r => !isPaid(r))
        .flatMap(r => r.legs.map(l => `${l.mode}:${l.from}>${l.to}`));

    expect(legsAt(13)).not.toContain('bus:HS>DS');
    expect(legsAt(17)).toContain('bus:HS>DS');
  });
});

describe('time restrictions, said out loud', () => {
  it('labels a route by the hours it runs', () => {
    const bus = getActiveRoutes('MK', 'HS', at(11)).find(r => r.id === 'mk-hs-bus')!;
    expect(restrictionLabel(bus)).toBe('Only after 10:00 AM');
    // A route with no restriction carries no badge, rather than a reassuring
    // one nobody needs to read.
    const walk = getActiveRoutes('MK', 'CON', at(11)).find(r => r.id === 'mk-con-walk')!;
    expect(restrictionLabel(walk)).toBeNull();
  });

  it('names the routes the clock is hiding, and when to come back for them', () => {
    // At eight in the morning the direct bus is not merely slower, it is
    // absent, and the list said nothing about it.
    const [gap] = describeTimeGaps('MK', 'HS', at(8));
    expect(gap.count).toBeGreaterThan(0);
    expect(gap.window).toBe('after 10:00 AM');
    expect(gap.at.getHours()).toBe(10);

    // Come back at that hour and there is nothing left to promise.
    expect(describeTimeGaps('MK', 'HS', gap.at)).toEqual([]);
  });

  it('offers the afternoon Disney Springs bus to someone asking at lunchtime', () => {
    const [gap] = describeTimeGaps('MK', 'DS', at(13));
    expect(gap.window).toBe('after 4:00 PM');
    expect(getActiveRoutes('MK', 'DS', gap.at).some(r => r.id === 'mk-ds-after4-bus')).toBe(true);
  });
});

describe('ride times', () => {
  it('does not inflate the Fort Wilderness bus', () => {
    // The Outpost is two miles from the park gates. The route file had this
    // at 17 minutes, which put the whole trip at 26 before you had waited for
    // anything.
    for (const [a, b] of [['MK', 'FW'], ['FW', 'MK']] as [string, string][]) {
      const bus = getActiveRoutes(a, b, at(13))
        .find(r => r.legs.length === 1 && r.legs[0].mode === 'bus')!;
      expect(bus.legs[0].rideMinutes).toBeLessThanOrEqual(10);
      expect(journeyMinutes(bus)).toBeLessThan(20);
    }
  });
});

describe('the monorail resorts', () => {
  const MONORAIL_RESORTS = ['CON', 'GF', 'POLY'];

  it('are never offered a bus to Magic Kingdom or EPCOT', () => {
    // They reach both on the beam — the resort loop to the Ticket Center,
    // then the EPCOT line — so Disney runs them no bus to either. The
    // generator invented one anyway, and out of the Grand Floridian it
    // outranked the monorail.
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const hour of [8, 11, 17]) {
        for (const r of getActiveRoutes(a, b, at(hour))) {
          for (const l of r.legs) {
            if (l.mode !== 'bus') continue;
            const touchesResort = MONORAIL_RESORTS.includes(l.from) || MONORAIL_RESORTS.includes(l.to);
            const touchesBeam = ['MK', 'EP'].includes(l.from) || ['MK', 'EP'].includes(l.to);
            if (touchesResort && touchesBeam) offenders.push(`${a}>${b}: ${r.id} rides bus ${l.from}>${l.to}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('still reach EPCOT, by rail', () => {
    for (const from of MONORAIL_RESORTS) {
      const transit = applyFilters(getActiveRoutes(from, 'EP', at(11)), BASE).filter(r => !isPaid(r));
      expect(transit.length).toBeGreaterThan(0);
      expect(transit.some(r => r.legs.some(l => l.mode === 'monorail_epcot'))).toBe(true);
    }
  });
});

describe('stitched transfers', () => {
  it('never get off a line and back onto the same line', () => {
    // "Resort Monorail to the Contemporary, Resort Monorail to the Ticket
    // Center" is one ride the composer had chopped in half. Buses are exempt:
    // their line is a service group, so two different buses at Disney Springs
    // share an id and are still a real transfer.
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const r of getActiveRoutes(a, b, at(11))) {
        for (let i = 1; i < r.legs.length; i++) {
          const prev = r.legs[i - 1], next = r.legs[i];
          if (prev.mode === 'bus' || next.mode === 'bus') continue;
          const lp = lineForLeg(prev.mode, prev.from, prev.to);
          const ln = lineForLeg(next.mode, next.from, next.to);
          if (lp && ln && lp.id === ln.id) offenders.push(`${a}>${b}: ${r.id}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
