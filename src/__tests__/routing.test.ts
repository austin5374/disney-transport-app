import {
  getActiveRoutes, applyFilters, journeyMinutes, waitMinutesFor,
  transferCount, driveMinutes, describeExclusions, expectedWait,
  describeTimeGaps, restrictionLabel, nextServiceStart, closedForNow,
} from '../utils/routing';
import { computeStatusAt } from '../utils/liveStatus';
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
const legSig = (r: Route) => r.legs.map(l => `${l.mode}:${l.from}>${l.to}`).join('|');

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
      // Three things outrank the clock, and all three are deliberate: a paid
      // car, a last-resort stitch, and a line that has not started running
      // yet. Time ordering holds within the group that is actually moving.
      const running = transit.filter(r => !r.opensAt);
      for (let i = 1; i < running.length; i++) {
        expect(journeyMinutes(running[i - 1])).toBeLessThanOrEqual(journeyMinutes(running[i]));
      }
    }
  });

  it('ranks a line that has not opened yet below every line that has', () => {
    // The Express beam's return leg is quick once it is running, so on time
    // alone it would sit at the top of a list of trips you cannot take.
    const transit = applyFilters(getActiveRoutes('MK', 'TTC', at(9)), BASE).filter(r => !isPaid(r));
    const pending = transit.filter(r => r.opensAt);
    expect(pending.length).toBeGreaterThan(0);
    expect(journeyMinutes(pending[0])).toBeLessThan(journeyMinutes(transit[0]));
    expect(transit.indexOf(pending[0])).toBe(transit.length - pending.length);
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

    // Once park-to-park service starts the direct bus appears — alongside the
    // trips that run all day, not instead of them. Showing the restricted bus
    // on its own is what left a guest reading "Only after 10:00 AM" with no
    // idea what to do at nine.
    expect(ids(11)).toContain('mk-hs-bus');
    expect(getActiveRoutes('MK', 'HS', at(11)).filter(r => !isPaid(r) && r.id.startsWith('synth-')).length)
      .toBeGreaterThan(0);
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
  it('offers the footpath between the All-Star resorts, and keeps the bus off the top', () => {
    // The only options here were two eighty-minute bus rides through a theme
    // park, the first of them presented as the quickest way — between two
    // resorts that share a sidewalk.
    //
    // Those rides are no longer eighty minutes. Once the flat-30 bus legs
    // were replaced with real distances the stitch through Animal Kingdom
    // came down to 45, which is exactly last_resort's margin over the
    // fifteen-minute walk and so falls a minute short of being demoted. The
    // tag was the mechanism, not the point: what this pair must never do is
    // put a bus round a theme park above the sidewalk, or offer one at a time
    // that reads as competitive with walking.
    for (const [a, b] of [['ASMo', 'ASS'], ['ASS', 'ASMo']] as [string, string][]) {
      const transit = applyFilters(getActiveRoutes(a, b, at(11)), BASE).filter(r => !isPaid(r));
      expect(transit[0].legs.every(l => l.mode === 'walk')).toBe(true);
      expect(transit[0].tags).toContain('walk_only');
      const walk = journeyMinutes(transit[0]);
      const buses = transit.filter(r => r.legs.some(l => l.mode === 'bus'));
      expect(buses.length).toBeGreaterThan(0);
      for (const r of buses) expect(journeyMinutes(r)).toBeGreaterThan(walk * 2.5);
      expect(buses.some(r => r.tags.includes('last_resort'))).toBe(true);
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

describe('a restricted route never stands alone', () => {
  it('lists the all-day alternatives beside the after-10 bus', () => {
    // The list used to hold exactly one option at 11 AM — the direct bus,
    // badged "Only after 10:00 AM" — and nothing that worked at nine. The
    // badge raised a question the list then refused to answer.
    const transit = applyFilters(getActiveRoutes('MK', 'HS', at(11)), BASE).filter(r => !isPaid(r));
    expect(transit.length).toBeGreaterThan(1);

    const restricted = transit.filter(r => r.timeRestriction);
    const anytime = transit.filter(r => !r.timeRestriction);
    expect(restricted.length).toBeGreaterThan(0);
    expect(anytime.length).toBeGreaterThan(0);

    // Only the restricted one is labelled, so the difference is legible.
    for (const r of restricted) expect(restrictionLabel(r)).toBeTruthy();
    for (const r of anytime) expect(restrictionLabel(r)).toBeNull();

    // And the alternatives really do run at the hour the badge excludes.
    const early = getActiveRoutes('MK', 'HS', at(9)).filter(r => !isPaid(r)).map(legSig);
    for (const r of anytime) expect(early).toContain(legSig(r));
  });

  it('never leaves a pair showing only time-restricted options', () => {
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const hour of [11, 17, 21]) {
        const transit = applyFilters(getActiveRoutes(a, b, at(hour)), BASE).filter(r => !isPaid(r));
        if (transit.length === 0) continue;
        if (transit.every(r => r.timeRestriction)) offenders.push(`${a}>${b}@${hour}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('planning past the end of the service day', () => {
  // Caribbean Beach to Hollywood Studios is one Skyliner hop and nothing
  // else: no bus, because the gondola serves the pair. After the Skyliner
  // shuts, the list is empty and correct, and it was a dead end. A guest
  // reading it at 11 PM is planning tomorrow, and the only way on was to
  // guess an hour out of the time picker.
  const lateNight = at(23);
  const board = (d: Date) => computeStatusAt(d.getTime());

  it('finds the hour a pair starts working again', () => {
    const resumption = nextServiceStart('CBR', 'HS', lateNight);
    expect(resumption).toBeTruthy();
    // Tomorrow, not a time earlier today that has already gone.
    expect(resumption!.at.getTime()).toBeGreaterThan(lateNight.getTime());
    // ...and it is a moment the trip genuinely works, not merely a moment
    // inside the answer.
    const working = applyFilters(
      getActiveRoutes('CBR', 'HS', resumption!.at, board(resumption!.at)), BASE,
      board(resumption!.at),
    ).filter(r => !isPaid(r));
    expect(working.length).toBeGreaterThan(0);
  });

  it('names the system the guest is waiting on, not the line', () => {
    // "Skyliner: Hollywood Studios Line starts at 8:00 AM" is not a sentence
    // anybody says. Two monorail beams are shut between Magic Kingdom and
    // EPCOT overnight, and a guest calls that "the monorail".
    expect(nextServiceStart('CBR', 'HS', lateNight)!.waitingOn).toBe('Skyliner');
    expect(nextServiceStart('MK', 'EP', lateNight)!.waitingOn).toBe('Monorail');
  });

  it('does not send anyone to a walk and call it service resuming', () => {
    // Boardwalk Inn to EPCOT is a six-minute footpath that works at any hour.
    // If a walk counted, every pair would "resume" at the next timetable mark
    // and the button would move the clock for nothing.
    const resumption = nextServiceStart('BWI', 'EP', lateNight);
    expect(resumption).toBeTruthy();
    const working = getActiveRoutes('BWI', 'EP', resumption!.at, board(resumption!.at))
      .filter(r => !isPaid(r) && !r.legs.every(l => l.mode === 'walk'));
    expect(working.length).toBeGreaterThan(0);
  });
});

describe('trips the clock is holding back', () => {
  const lateNight = at(23);
  const board = computeStatusAt(lateNight.getTime());

  it('surfaces the routes applyFilters drops for being shut', () => {
    // Told "no transit options" and nothing else, a guest cannot tell an
    // overnight gap from a pair Disney does not connect at all. One of those
    // is worth waiting for.
    const all = getActiveRoutes('CBR', 'HS', lateNight, board);
    expect(applyFilters(all, BASE, board).filter(r => !isPaid(r))).toHaveLength(0);

    const held = closedForNow(all, BASE, board);
    expect(held.length).toBeGreaterThan(0);
    expect(held.some(r => r.legs.some(l => l.mode === 'skyliner'))).toBe(true);
    // Never a paid car: the bottom of the list is still transit.
    expect(held.some(isPaid)).toBe(false);
  });

  it('keeps obeying the filters the user set', () => {
    // A step-free filter that quietly stops applying at the bottom of the
    // list is worse than no filter at all.
    const all = getActiveRoutes('BWI', 'EP', lateNight, board);
    const water = closedForNow(all, BASE, board).filter(r => r.tags.includes('water'));
    expect(water.length).toBeGreaterThan(0);
    expect(closedForNow(all, { ...BASE, noWater: true }, board)).toEqual([]);
  });
});

describe('replacement buses', () => {
  // The status board has advertised these all along; the planner ignored
  // them. With the Resort Monorail down, one screen named a bus calling at
  // the Polynesian and the Grand Floridian while the other said there was no
  // way between them.
  const down = (id: string, etaMinutes = 9) => ({
    [id]: {
      lineId: id, status: 'down', crowd: 'moderate',
      headwayMinutes: [5, 9] as [number, number], etaMinutes, updatedAt: 0,
    },
  }) as never;

  it('routes onto the bus that replaces a downed beam', () => {
    const board = down('mono-resort');
    const routes = getActiveRoutes('POLY', 'GF', at(13), board);
    const bridge = routes.find(r => r.id.startsWith('temp-bus-resort-loop'));
    expect(bridge).toBeTruthy();
    expect(bridge!.legs).toHaveLength(1);
    expect(bridge!.legs[0].mode).toBe('bus');
    expect(bridge!.notes).toMatch(/Resort Monorail is down/);

    // ...and it survives filtering, so it is a trip you can actually pick.
    const kept = applyFilters(routes, BASE, board).filter(r => !isPaid(r));
    expect(kept.some(r => r.id.startsWith('temp-bus-resort-loop'))).toBe(true);
  });

  it('overtakes the beam it replaces once the outage is long enough', () => {
    // A down line is not removed — the cost model charges it the outage and
    // lets it compete, which is right: a nine-minute stoppage is still worth
    // waiting out. A thirty-minute one is not, and that is when the bus wins.
    const brief = applyFilters(getActiveRoutes('POLY', 'GF', at(13), down('mono-resort', 9)),
      BASE, down('mono-resort', 9)).filter(r => !isPaid(r));
    const long = applyFilters(getActiveRoutes('POLY', 'GF', at(13), down('mono-resort', 45)),
      BASE, down('mono-resort', 45)).filter(r => !isPaid(r));

    const rank = (list: Route[], pred: (r: Route) => boolean) => list.findIndex(pred);
    const isBridge = (r: Route) => r.id.startsWith('temp-bus-resort-loop');
    const isBeam = (r: Route) => r.legs.some(l => l.mode === 'monorail_resort');

    expect(rank(brief, isBeam)).toBeLessThan(rank(brief, isBridge));
    expect(rank(long, isBridge)).toBeLessThan(rank(long, isBeam));
  });

  it('covers Magic Kingdom, which the hand-written stop list had missed', () => {
    const board = down('mono-resort');
    for (const [a, b] of [['MK', 'GF'], ['CON', 'MK'], ['MK', 'POLY']] as [string, string][]) {
      expect(getActiveRoutes(a, b, at(13), board).some(r => r.id.startsWith('temp-bus-resort-loop')))
        .toBe(true);
    }
  });

  it('offers nothing extra while the beam is running', () => {
    for (const [a, b] of PAIRS) {
      for (const r of getActiveRoutes(a, b, at(13))) {
        expect(r.id.startsWith('temp-bus-')).toBe(false);
      }
    }
  });

  it('only bridges pairs the downed beam actually served', () => {
    const board = down('mono-epcot');
    // The EPCOT beam runs TTC to EPCOT and nowhere else.
    expect(getActiveRoutes('TTC', 'EP', at(13), board).some(r => r.id.startsWith('temp-bus-epcot')))
      .toBe(true);
    expect(getActiveRoutes('POLY', 'GF', at(13), board).some(r => r.id.startsWith('temp-bus-')))
      .toBe(false);
  });
});

describe('trips that avoid walking', () => {
  const walks = (r: Route) => r.legs.some(l => l.mode === 'walk');

  it('offers the monorail end to end from the Polynesian to EPCOT', () => {
    // "Walk to the Ticket Center, then take the monorail" counted as full
    // coverage, so the router never looked for the way round — and this pair,
    // which the monorail covers end to end, offered a six-minute walk or a
    // paid car and nothing else.
    const transit = applyFilters(getActiveRoutes('POLY', 'EP', at(13)), BASE).filter(r => !isPaid(r));
    const stepFree = transit.filter(r => !walks(r));
    expect(stepFree.length).toBeGreaterThan(0);
    for (const r of stepFree) {
      expect(r.legs.every(l => l.mode.startsWith('monorail'))).toBe(true);
    }
    // The walk is quicker and stays on top; the point is that it is not alone.
    expect(walks(transit[0])).toBe(true);
  });

  it('keeps the walk-free option even when it is far slower than the cut-off', () => {
    // Every pruning rule in the router sorts on time, and the trip that
    // avoids walking is usually the slow one. EPCOT back to the Polynesian
    // is more than twenty minutes past the margin that would otherwise drop
    // it, which is exactly why somebody needs it.
    const transit = applyFilters(getActiveRoutes('EP', 'POLY', at(13)), BASE).filter(r => !isPaid(r));
    const stepFree = transit.filter(r => !walks(r));
    expect(stepFree.length).toBeGreaterThan(0);
    expect(journeyMinutes(stepFree[0])).toBeGreaterThan(journeyMinutes(transit[0]) + 20);
  });

  it('leaves no pair walking-only that the network could carry', () => {
    // The exceptions are buildings that share a plot: the BoardWalk and its
    // Inn, the Swan and the Swan Reserve. Three minutes apart, with nothing
    // running between them because nothing needs to.
    const ADJACENT = new Set(['BW>BWI', 'BWI>BW', 'SW>SR', 'SR>SW']);
    const offenders: string[] = [];
    for (const [a, b] of PAIRS) {
      for (const hour of [9, 13, 17]) {
        const transit = applyFilters(getActiveRoutes(a, b, at(hour)), BASE).filter(r => !isPaid(r));
        if (transit.length === 0) continue;
        if (transit.some(r => !walks(r))) continue;
        if (ADJACENT.has(`${a}>${b}`)) continue;
        offenders.push(`${a}>${b}@${hour}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
