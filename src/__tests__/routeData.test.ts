import { ALL_ROUTES } from '../data/routes';
import { DESTINATIONS, DESTINATION_MAP } from '../data/destinations';
import { TRANSIT_LINES, lineForLeg } from '../data/lines';

// The route graph is 400+ hand-authored entries. Every defect this file
// guards against was actually present in the data at some point: totals that
// disagreed with their own legs, legs that did not join up, and a field
// carried on every leg that nothing ever read.

const ID_SET = new Set(DESTINATIONS.map(d => d.id));

describe('destinations', () => {
  it('have unique ids', () => {
    const ids = DESTINATIONS.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all carry coordinates inside the Walt Disney World bounding box', () => {
    for (const d of DESTINATIONS) {
      expect(typeof d.lat).toBe('number');
      expect(typeof d.lng).toBe('number');
      expect(d.lat).toBeGreaterThan(28.30);
      expect(d.lat).toBeLessThan(28.45);
      expect(d.lng).toBeGreaterThan(-81.63);
      expect(d.lng).toBeLessThan(-81.49);
    }
  });

  it('are all reachable from DESTINATION_MAP', () => {
    for (const d of DESTINATIONS) expect(DESTINATION_MAP[d.id]).toBe(d);
  });
});

describe('route graph', () => {
  it('has unique route ids', () => {
    const ids = ALL_ROUTES.map(r => r.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('only references known destination ids', () => {
    const unknown = new Set<string>();
    for (const r of ALL_ROUTES) {
      if (!ID_SET.has(r.from)) unknown.add(r.from);
      if (!ID_SET.has(r.to)) unknown.add(r.to);
      for (const l of r.legs) {
        if (!ID_SET.has(l.from)) unknown.add(l.from);
        if (!ID_SET.has(l.to)) unknown.add(l.to);
      }
    }
    expect([...unknown]).toEqual([]);
  });

  it('has at least one leg per route', () => {
    for (const r of ALL_ROUTES) expect(r.legs.length).toBeGreaterThan(0);
  });

  it('has continuous leg chains that start and end where the route says', () => {
    const broken: string[] = [];
    for (const r of ALL_ROUTES) {
      if (r.legs[0].from !== r.from) broken.push(`${r.id}: starts at ${r.legs[0].from}, not ${r.from}`);
      if (r.legs[r.legs.length - 1].to !== r.to) broken.push(`${r.id}: ends at ${r.legs[r.legs.length - 1].to}, not ${r.to}`);
      for (let i = 1; i < r.legs.length; i++) {
        if (r.legs[i - 1].to !== r.legs[i].from) {
          broken.push(`${r.id}: leg ${i - 1} ends at ${r.legs[i - 1].to} but leg ${i} starts at ${r.legs[i].from}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('reconciles totalRideMinutes with the sum of its legs', () => {
    // Five routes used to fail this: their headline number silently folded in
    // a transfer walk that the step list never displayed, so the total did not
    // add up from the steps shown underneath it.
    const mismatched = ALL_ROUTES
      .map(r => ({
        id: r.id,
        declared: r.totalRideMinutes,
        summed: r.legs.reduce((s, l) => s + l.rideMinutes, 0),
      }))
      .filter(x => x.declared !== x.summed);
    expect(mismatched).toEqual([]);
  });

  it('has positive ride times on every leg', () => {
    for (const r of ALL_ROUTES) {
      for (const l of r.legs) expect(l.rideMinutes).toBeGreaterThan(0);
    }
  });

  it('never goes from a place to itself', () => {
    for (const r of ALL_ROUTES) {
      expect(r.from).not.toBe(r.to);
      for (const l of r.legs) expect(l.from).not.toBe(l.to);
    }
  });

  it('tags every route with a watercraft leg as a water route', () => {
    const boat = /boat|ferry|water_taxi|sassagoula|friendship/;
    for (const r of ALL_ROUTES) {
      const hasBoat = r.legs.some(l => boat.test(l.mode));
      expect(r.tags.includes('water')).toBe(hasBoat);
    }
  });

  it('keeps every bus ride at or under 30 minutes', () => {
    // Nothing on property is a longer bus ride than this. The data used to
    // carry 105 bus legs above 30 minutes, topping out at 47.
    const long = ALL_ROUTES.flatMap(r =>
      r.legs
        .filter(l => l.mode === 'bus' && l.rideMinutes > 30)
        .map(l => `${r.id}: ${l.from} to ${l.to} = ${l.rideMinutes} min`)
    );
    expect(long).toEqual([]);
  });

  it('never routes a bus to or from the Transportation and Ticket Center', () => {
    // There is no standing Disney bus station at the TTC. Buses serve it only
    // while a monorail beam is down, which is modeled as a temporary bridge
    // in liveStatus rather than as a route in the graph.
    const ttcBuses = ALL_ROUTES.flatMap(r =>
      r.legs
        .filter(l => l.mode === 'bus' && (l.from === 'TTC' || l.to === 'TTC'))
        .map(l => `${r.id}: ${l.from} to ${l.to}`)
    );
    expect(ttcBuses).toEqual([]);
  });

  it('has a totalRideRange that brackets totalRideMinutes when present', () => {
    for (const r of ALL_ROUTES) {
      if (!r.totalRideRange) continue;
      const [lo, hi] = r.totalRideRange;
      expect(lo).toBeLessThanOrEqual(hi);
      expect(r.totalRideMinutes).toBeGreaterThanOrEqual(lo);
    }
  });
});

describe('transit lines', () => {
  it('have unique ids and sane headways', () => {
    const ids = TRANSIT_LINES.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of TRANSIT_LINES) {
      const [lo, hi] = l.headwayMinutes;
      expect(lo).toBeLessThanOrEqual(hi);
      expect(lo).toBeGreaterThanOrEqual(0);
      expect(hi).toBeLessThanOrEqual(60);
      expect(l.serviceHours.length).toBeGreaterThan(0);
      expect(l.stations.length).toBeGreaterThan(1);
    }
  });

  it('resolves a line for every non-walk, non-rideshare leg in the graph', () => {
    const unresolved = new Set<string>();
    for (const r of ALL_ROUTES) {
      for (const l of r.legs) {
        if (l.mode === 'walk' || l.mode === 'minnie_van') continue;
        if (!lineForLeg(l.mode, l.from, l.to)) unresolved.add(`${l.mode} ${l.from}->${l.to}`);
      }
    }
    expect([...unresolved]).toEqual([]);
  });
});
