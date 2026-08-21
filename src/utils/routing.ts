import { Route, ActiveFilters, TransportMode, Leg } from '../types';
import { ALL_ROUTES } from '../data/routes';
import { DESTINATIONS, DESTINATION_MAP, GEOFENCE_ZONES } from '../data/destinations';
import { lineForLeg } from '../data/lines';
import { LineStatus, DELAY_HEADWAY_FACTOR, CROWD_WAIT_FACTOR } from './liveStatus';
import { railRoutes } from '../data/rail';
import { resortBusRoutes } from '../data/resortBus';
import { lineRoutes } from '../data/lineRoutes';

// Geometry

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Journey cost model
// A trip costs wait + ride + walk. Ranking on ride time alone made every paid
// car ride look faster than transit, because a car has no headway and the old
// model charged transit nothing for standing at the stop.
//
// The optional `live` board is what stops the two halves of the app
// contradicting each other. Without it, the top-ranked card could be badged
// as the quickest option directly above red text saying its only line was
// down for twelve minutes. A disruption is a cost, so it belongs in the cost
// model, not just in the decoration.

/** A live snapshot, keyed by line id. See liveStatus.ts. */
export type LiveBoard = Record<string, LineStatus>;

/** Expected wait for a rider who shows up at a random moment: half the mean
 *  headway, then whatever the live board says is happening to that line.
 *  Continuous-loading systems (the Skyliner) have no headway to halve. */
export function expectedWait(
  mode: TransportMode, from: string, to: string, live?: LiveBoard,
): number {
  if (mode === 'walk' || mode === 'minnie_van') return 0;
  const line = lineForLeg(mode, from, to);
  if (!line) return 5;

  const status = live?.[line.id];
  const [lo, hi] = status?.headwayMinutes ?? line.headwayMinutes;
  if (hi <= 1) return 0;

  let wait = (lo + hi) / 4;
  if (status) {
    if (status.status === 'delayed') wait *= DELAY_HEADWAY_FACTOR;
    wait *= CROWD_WAIT_FACTOR[status.crowd];
    // A line that is down costs you the whole outage before it costs you a
    // headway.
    if (status.status === 'down') wait += status.etaMinutes ?? 15;
  }
  return Math.round(wait);
}

export function waitMinutesFor(route: Route, live?: LiveBoard): number {
  return route.legs.reduce((sum, l) => sum + expectedWait(l.mode, l.from, l.to, live), 0);
}

/** Total door-to-door minutes: waiting, riding, and walking. */
export function journeyMinutes(route: Route, live?: LiveBoard): number {
  const ride = route.legs.reduce((s, l) => s + l.rideMinutes, 0);
  const walk = route.legs.reduce((s, l) => s + (l.walkMinutes ?? 0), 0);
  return ride + walk + waitMinutesFor(route, live);
}

/** A route nobody can take right now, because a line it rides is shut. */
export function isRouteClosed(route: Route, live?: LiveBoard): boolean {
  if (!live) return false;
  return route.legs.some(leg => {
    if (leg.mode === 'walk' || leg.mode === 'minnie_van') return false;
    const line = lineForLeg(leg.mode, leg.from, leg.to);
    return !!line && live[line.id]?.status === 'closed';
  });
}

export function transferCount(route: Route): number {
  return Math.max(0, route.legs.filter(l => l.mode !== 'walk').length - 1);
}

// Time rules engine

// Destinations that share transport with an adjacent location and have no
// route entries of their own. BoardWalk (the district) is served by BoardWalk
// Inn's stops; Swan Reserve shares the Swan/Dolphin bus loop and boat dock.
const DEST_ALIAS: Record<string, string> = {
  BW: 'BWI',
  SR: 'SW',
};

function timeValid(r: Route, timeOverride?: Date): boolean {
  const now = timeOverride ?? new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  if (r.timeRestriction === 'before_10am' && totalMinutes >= 600) return false;
  if (r.timeRestriction === 'after_3pm_only' && totalMinutes < 900) return false;
  if (r.timeRestriction === 'after_10am' && totalMinutes < 600) return false;
  if (r.timeRestriction === 'after_4pm_only' && totalMinutes < 960) return false;
  return true;
}

function destLabel(id: string): string {
  return DESTINATION_MAP[id]?.label ?? id;
}

function nameForLegs(legs: Leg[]): string {
  return legs
    .map(l => l.mode === 'walk'
      ? `Walk to ${destLabel(l.to)}`
      : `${modeLabel(l.mode)} to ${destLabel(l.to)}`)
    .join(', ');
}

// Reverse an existing route so a pair defined one way also works the other way.
//
// Transfer walks are carried across to the same physical station rather than
// replaced with a flat guess: in the original, legs[i].walkMinutes is the walk
// at the transfer *before* leg i, so in the reversal that same transfer sits
// before mirrored leg (n - i).
//
// `timeRestriction` is preserved deliberately. Dropping it would invent
// service in a direction and hour where the network does not run.
function mirrorRoute(r: Route): Route {
  const n = r.legs.length;
  const legs: Leg[] = [...r.legs].reverse().map((l, i) => {
    const walk = i > 0 ? r.legs[n - i]?.walkMinutes : undefined;
    return {
      mode: l.mode,
      from: l.to,
      to: l.from,
      rideMinutes: l.rideMinutes,
      accessible: l.accessible,
      // The original tip described boarding at the other end of this leg, so
      // it cannot be reused verbatim. A generic, true instruction beats
      // silently dropping guidance on a third of all pairs.
      tip: l.mode === 'walk' || l.mode === 'minnie_van'
        ? undefined
        : `Board at the ${modeLabel(l.mode)} stop at ${destLabel(l.to)}.`,
      ...(walk ? { walkMinutes: walk } : {}),
    };
  });
  return {
    id: `${r.id}-rev`,
    from: r.to,
    to: r.from,
    legs,
    totalRideMinutes: r.totalRideMinutes,
    totalRideRange: r.totalRideRange,
    tags: r.tags,
    timeRestriction: r.timeRestriction,
    notes: r.notes,
    name: nameForLegs(legs),
  };
}

const isPaidRoute = (r: Route) => r.legs.some(l => l.mode === 'minnie_van');
const isWalkOnly  = (r: Route) => r.legs.every(l => l.mode === 'walk');

/** Identifies a route by the trip it describes, so a generated option and a
 *  hand-authored one covering the same legs cannot both be offered. */
function legSignature(r: Route): string {
  return r.legs.map(l => `${l.mode}:${l.from}>${l.to}`).join('|');
}

function directRoutes(from: string, to: string, timeOverride?: Date): Route[] {
  const explicit = ALL_ROUTES.filter(r => r.from === from && r.to === to && timeValid(r, timeOverride));

  // Monorail trips come from the beam definitions rather than the route file,
  // so every ordered pair of stations on a beam is covered by construction.
  const seen = new Set(explicit.map(legSignature));
  const rail = railRoutes(from, to).filter(r => !seen.has(legSignature(r)));
  // Resort buses are generated the same way. Disney's rule — a bus from every
  // resort to every park and Disney Springs, except where a boat, a monorail
  // or the Skyliner already serves the pair — closes a whole class of gap that
  // hand-written entries kept leaving open.
  const resortBus = resortBusRoutes(from, to).filter(r => !seen.has(legSignature(r)));
  // Boat and Skyliner pairs come from the lines' own stop lists, for the same
  // reason the monorail pairs do. See lineRoutes.ts.
  const byLine = lineRoutes(from, to).filter(r => !seen.has(legSignature(r)));

  const combined = [...explicit, ...rail, ...resortBus, ...byLine];

  // A walk is a legitimate option but never a complete answer on its own. If
  // that is all this direction has, the reverse direction's real routes are
  // worth mirroring. Treating a walk-only entry as full coverage is what hid
  // the monorail on Grand Floridian to Polynesian and seven other pairs.
  const hasVehicleRoute = combined.some(r => !isPaidRoute(r) && !isWalkOnly(r));
  if (hasVehicleRoute) return combined;

  const mirrored = ALL_ROUTES
    .filter(r => r.from === to && r.to === from && timeValid(r, timeOverride))
    .filter(r => !isPaidRoute(r) && !isWalkOnly(r))
    .map(mirrorRoute)
    .filter(r => !seen.has(legSignature(r)));

  return [...combined, ...mirrored];
}

// Compose a two-segment journey through a major transfer hub, mirroring how
// guests actually connect between two resorts (bus to a park or Disney
// Springs, then transfer).
const TRANSFER_HUBS = ['DS', 'MK', 'EP', 'HS', 'AK', 'CBR', 'TTC'];

// How far you actually walk between vehicles at each hub. This was a flat 5
// minutes everywhere, which is wrong in both directions: the Skyliner and the
// bus loop at Caribbean Beach are a minute apart, and Disney Springs puts the
// bus bays a genuine walk from the boat dock.
const HUB_TRANSFER_WALK: Record<string, number> = {
  DS:  6,   // bus bays are a walk from the Sassagoula dock
  MK:  7,   // bus stops sit below the park, the monorail above it
  EP:  5,
  HS:  4,
  AK:  4,
  CBR: 2,   // the Skyliner station and the bus loop share a plaza
  TTC: 4,   // ferry dock to monorail ramp
};

const HUB_TRANSFER_NOTE: Record<string, string> = {
  DS:  'Transfer at Disney Springs. The bus bays are about a 6 minute walk from the boat dock.',
  MK:  'Transfer at Magic Kingdom. The bus stops are below the park; the monorail and ferry are above it.',
  EP:  'Transfer at EPCOT, between the main entrance and the bus stops.',
  HS:  'Transfer at Hollywood Studios, between the bus stops and the Skyliner station.',
  AK:  'Transfer at Animal Kingdom, in the bus loop outside the entrance.',
  CBR: 'Transfer at Caribbean Beach. The Skyliner station and the bus loop share a plaza.',
  TTC: 'Transfer at the Transportation & Ticket Center, between the ferry dock and the monorail ramp.',
};

function bestSegment(from: string, to: string, timeOverride?: Date): Route | null {
  const candidates = directRoutes(from, to, timeOverride)
    .filter(r => !isPaidRoute(r))
    // No timeRestriction filter here: directRoutes has already dropped
    // anything not running at the requested time, and excluding restricted
    // routes outright threw away every park-to-park bus, which is the most
    // useful connection a transfer hub has.
    .filter(r => r.legs.length <= 2);
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (journeyMinutes(a) <= journeyMinutes(b) ? a : b));
}

function synthesizeViaHub(from: string, to: string, timeOverride?: Date): Route[] {
  const options: Route[] = [];
  for (const hub of TRANSFER_HUBS) {
    if (hub === from || hub === to) continue;
    const a = bestSegment(from, hub, timeOverride);
    const b = bestSegment(hub, to, timeOverride);
    if (!a || !b) continue;
    if (a.legs.length + b.legs.length > 3) continue;

    // Stitching two walks together through a hub is just a longer walk, not a
    // transfer, and it produced trips like "walk 12 min, then walk 5 min".
    if (a.legs.every(l => l.mode === 'walk') && b.legs.every(l => l.mode === 'walk')) continue;

    // If a segment walks in or out of the hub on the joining end, the hub is
    // not where the transfer happens, the far end of that walk is. Allowing it
    // produced "bus to the Polynesian, walk to the TTC, bus to the Swan" and
    // "bus to the TTC, walk to the Polynesian, take the Polynesian's bus".
    // A segment that is nothing but a walk is fine on either side, since that
    // is the real approach to plenty of places.
    const walksIntoHub = a.legs.length > 1 && a.legs[a.legs.length - 1].mode === 'walk';
    const walksOutOfHub = b.legs.length > 1 && b.legs[0].mode === 'walk';
    if (walksIntoHub || walksOutOfHub) continue;
    const legs: Leg[] = [
      ...a.legs,
      { ...b.legs[0], walkMinutes: HUB_TRANSFER_WALK[hub] ?? 5 },
      ...b.legs.slice(1),
    ];
    options.push({
      id: `synth-${from}-${hub}-${to}`,
      from, to, legs,
      totalRideMinutes: legs.reduce((sum, l) => sum + l.rideMinutes, 0),
      tags: ['transfer'],
      name: nameForLegs(legs),
      notes: `${HUB_TRANSFER_NOTE[hub] ?? `Transfer at ${destLabel(hub)}.`} The wait for the second vehicle is included in the journey total.`,
    });
  }
  options.sort((x, y) => journeyMinutes(x) - journeyMinutes(y));
  // Keep alternates only if they're competitive with the best option
  const best = options[0];
  return options.slice(0, 2).filter((r, i) => i === 0 || journeyMinutes(r) <= journeyMinutes(best) + 20);
}

// Paid rides
// A Minnie Van used to be a flat 18 minutes between any two points on
// property, which made it the single fastest option on 60% of all pairs and
// handed a paid car the "Fastest" badge on the app's own results screen.

const PICKUP_MINUTES = 5;      // request, match, and load
const ROAD_DETOUR = 1.35;      // straight-line to road distance
const PROPERTY_KMH = 40;       // internal roads, with lights and gates

export function driveMinutes(fromId: string, toId: string): number {
  const a = DESTINATION_MAP[fromId];
  const b = DESTINATION_MAP[toId];
  if (!a || !b) return 18;
  const km = haversineDistance(a.lat, a.lng, b.lat, b.lng) / 1000;
  return Math.max(6, Math.round(PICKUP_MINUTES + (km * ROAD_DETOUR) / PROPERTY_KMH * 60));
}

/** Roughly what Lyft charges for a Minnie Van on property: a base fare plus a
 *  per-mile rate. Shown because the reference app never lists a paid option
 *  without listing what it costs, and "not included with your stay" is not a
 *  price. */
function minnieVanPrice(fromId: string, toId: string): number {
  const a = DESTINATION_MAP[fromId];
  const b = DESTINATION_MAP[toId];
  if (!a || !b) return 20;
  const miles = (haversineDistance(a.lat, a.lng, b.lat, b.lng) / 1609) * ROAD_DETOUR;
  return Math.max(15, Math.round(15 + miles * 3));
}

function minnieVanFallback(from: string, to: string): Route {
  const minutes = driveMinutes(from, to);
  const price = minnieVanPrice(from, to);
  return {
    id: `minnie-${from}-${to}`,
    from, to,
    legs: [{ mode: 'minnie_van', from, to, rideMinutes: minutes, accessible: true }],
    totalRideMinutes: minutes,
    tags: [],
    name: 'Minnie Van',
    priceUsd: price,
    notes: `A paid car service booked through the Lyft app, from about $${price}. Not included with your stay.`,
  };
}

export function getActiveRoutes(from: string, to: string, timeOverride?: Date): Route[] {
  const origFrom = from, origTo = to;
  from = DEST_ALIAS[from] ?? from;
  to = DEST_ALIAS[to] ?? to;

  // Aliased neighbors (e.g. BoardWalk ↔ BoardWalk Inn) are a short walk apart
  if (from === to) {
    if (origFrom === origTo) return [];
    return [{
      id: `walk-${origFrom}-${origTo}`,
      from: origFrom, to: origTo,
      legs: [{ mode: 'walk', from: origFrom, to: origTo, rideMinutes: 3, accessible: true }],
      totalRideMinutes: 3,
      tags: ['walk_only'],
      name: `Walk to ${destLabel(origTo)}`,
    }];
  }

  let routes = directRoutes(from, to, timeOverride);
  const hasRealRoute = routes.some(r => r.legs.every(l => l.mode !== 'minnie_van'));

  if (!hasRealRoute) {
    // A stitched trip has to stay in the realm of something a person would
    // actually do. Unbounded, the synthesizer confidently proposed a
    // 107-minute bus odyssey from Blizzard Beach to Art of Animation, two
    // places fifteen minutes apart by road. Saying "there is no practical
    // Disney transport here" is a better answer than that.
    //
    // The allowance is generous on purpose. Connecting through a hub costs two
    // waits and a walk before it costs a single minute of travel, so an hour
    // to cross between two neighbouring value resorts really is the answer on
    // a network with twenty-minute headways. This is a backstop against the
    // absurd, not a performance target: tightened to anything like the drive
    // time it starts deleting trips people genuinely make.
    const ceiling = Math.max(100, Math.round(driveMinutes(from, to) * 2 + 50));
    routes = [
      ...routes,
      ...synthesizeViaHub(from, to, timeOverride).filter(r => journeyMinutes(r) <= ceiling),
    ];
  }

  routes = routes.filter(r => !isPaidRoute(r));

  // A paid ride is always offered as a separate option rather than as a
  // competitor for the top transit slot — except where it would be absurd.
  // Every pair used to get one, so BoardWalk to BoardWalk Inn, which the
  // router correctly answers as a three-minute walk, also offered a car.
  const bestTransit = routes.filter(r => !isWalkOnly(r) || journeyMinutes(r) > 10);
  const shortWalkOnly = routes.length > 0 && bestTransit.length === 0;
  if (!shortWalkOnly) routes.push(minnieVanFallback(from, to));

  return routes;
}

// Filter + sort

const isWater = (r: Route) => r.tags.includes('water');
const isStepFree = (r: Route) => r.legs.every(l => l.accessible);

function scenicScore(r: Route): number {
  return r.tags.includes('water') || r.tags.includes('scenic') ||
    r.legs.some(l => l.mode === 'skyliner' || l.mode === 'friendship_boat')
    ? 0 : 1;
}

export function applyFilters(routes: Route[], filters: ActiveFilters, live?: LiveBoard): Route[] {
  let result = routes.filter(r => {
    if (filters.noWater && isWater(r)) return false;
    if (filters.accessible && !isStepFree(r)) return false;
    // Offering a trip on a line that has shut for the night is worse than
    // offering nothing: the empty state can at least explain itself.
    if (isRouteClosed(r, live)) return false;
    return true;
  });

  const byJourney = (a: Route, b: Route) => journeyMinutes(a, live) - journeyMinutes(b, live);

  switch (filters.sort) {
    case 'transfers':
      result = result.sort((a, b) => transferCount(a) - transferCount(b) || byJourney(a, b));
      break;
    case 'scenic':
      result = result.sort((a, b) => scenicScore(a) - scenicScore(b) || byJourney(a, b));
      break;
    default:
      result = result.sort(byJourney);
  }

  // A paid car never outranks transit, whatever the sort.
  return result.sort((a, b) => Number(isPaidRoute(a)) - Number(isPaidRoute(b)));
}

/** Human-readable reasons the visible list is shorter than the full one, so an
 *  empty results screen can name the filter responsible instead of blaming the
 *  transportation network for the user's own settings. */
export function describeExclusions(
  all: Route[], filters: ActiveFilters, live?: LiveBoard,
): string[] {
  const transit = all.filter(r => !isPaidRoute(r));
  const reasons: string[] = [];
  const closed = transit.filter(r => isRouteClosed(r, live)).length;
  if (closed > 0) {
    reasons.push(
      `${closed} route${closed === 1 ? '' : 's'} ${closed === 1 ? 'uses a line' : 'use lines'} that are not running at this hour.`
    );
  }
  if (filters.noWater) {
    const n = transit.filter(isWater).length;
    if (n > 0) reasons.push(`"No Boats" is hiding ${n} route${n === 1 ? '' : 's'}.`);
  }
  if (filters.accessible) {
    const n = transit.filter(r => !isStepFree(r)).length;
    if (n > 0) reasons.push(`"Step-Free" is hiding ${n} route${n === 1 ? '' : 's'}.`);
  }
  return reasons;
}

// Labels

export function modeLabel(mode: TransportMode): string {
  const labels: Record<TransportMode, string> = {
    skyliner:          'Skyliner',
    bus:               'Bus',
    monorail_express:  'Express Monorail',
    monorail_resort:   'Resort Monorail',
    monorail_epcot:    'EPCOT Monorail',
    ferry_ttc_mk:      'Ferry Boat',
    water_taxi_gold:   'Gold Launch',
    water_taxi_red:    'Red Launch',
    water_taxi_green:  'Green Launch',
    water_taxi_blue:   'Blue Launch',
    friendship_boat:   'Friendship Boat',
    sassagoula_boat:   'Sassagoula Boat',
    walk:              'Walk',
    minnie_van:        'Minnie Van',
  };
  return labels[mode];
}

// Time banner

export function getTimeBannerMessage(timeOverride?: Date): string | null {
  const now = timeOverride ?? new Date();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (totalMinutes < 600) {
    return `Before 10:00 AM, park-to-park buses are not running. Routes shown for ${timeStr}.`;
  }
  return null;
}

// Geofence detection
//
// This was fifteen hand-tuned circles with a lookup table beside them, and
// that table mapped the whole Magic Kingdom resort area to the Contemporary:
// stand at the Polynesian and the app told you where you were not. Every
// destination already carries its own coordinates, so the nearest one within
// a reasonable radius is both more accurate and less to keep in step.

const DETECT_RADIUS_METERS = 1200;

/** The destination you are standing at, or null if you are not on property. */
export function detectDestination(lat: number, lng: number): string | null {
  let closest: { id: string; dist: number } | null = null;
  for (const dest of DESTINATIONS) {
    const dist = haversineDistance(lat, lng, dest.lat, dest.lng);
    if (dist <= DETECT_RADIUS_METERS && (!closest || dist < closest.dist)) {
      closest = { id: dest.id, dist };
    }
  }
  return closest ? closest.id : null;
}

/** @deprecated Kept for the zone list's own tests. Use detectDestination. */
export function detectZone(lat: number, lng: number): string | null {
  let closest: { id: string; dist: number } | null = null;
  for (const zone of GEOFENCE_ZONES) {
    const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radiusMeters && (!closest || dist < closest.dist)) {
      closest = { id: zone.id, dist };
    }
  }
  return closest ? closest.id : null;
}

// Maps geofence zone IDs to destination IDs where they differ
export const ZONE_TO_DESTINATION: Record<string, string> = {
  MK:           'MK',
  EP:           'EP',
  HS:           'HS',
  AK:           'AK',
  TTC:          'TTC',
  DS:           'DS',
  MK_RESORTS:   'CON',   // closest monorail resort hub
  EPCOT_RESORTS:'BWI',   // closest EPCOT area resort
  CBR:          'CBR',
  AKL:          'AKL',
  DS_RESORTS:   'SS',
  AK_RESORTS:   'COR',
  WL_FW:        'WL',
  BB:           'BB',
  TL:           'TL',
};
