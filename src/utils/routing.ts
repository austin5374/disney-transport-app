import { Route, ActiveFilters, TransportMode, Leg } from '../types';
import { ALL_ROUTES } from '../data/routes';
import { DESTINATION_MAP } from '../data/destinations';

// ─── Time rules engine ───────────────────────────────────────────────────────

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
  if (r.timeRestriction === 'before_4pm'  && totalMinutes >= 960) return false;
  if (r.timeRestriction === 'after_3pm_only' && totalMinutes < 900) return false;
  if (r.timeRestriction === 'after_10am' && totalMinutes < 600) return false;
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
function mirrorRoute(r: Route): Route {
  const legs: Leg[] = [...r.legs].reverse().map((l, i) => ({
    mode: l.mode,
    from: l.to,
    to: l.from,
    rideMinutes: l.rideMinutes,
    simRange: l.simRange,
    accessible: l.accessible,
    ...(i > 0 ? { walkMinutes: 3 } : {}),
  }));
  return {
    id: `${r.id}-rev`,
    from: r.to,
    to: r.from,
    legs,
    totalRideMinutes: r.totalRideMinutes,
    totalRideRange: r.totalRideRange,
    tags: r.tags,
    timeRestriction: r.timeRestriction,
    name: nameForLegs(legs),
  };
}

function directRoutes(from: string, to: string, timeOverride?: Date): Route[] {
  const explicit = ALL_ROUTES.filter(r => r.from === from && r.to === to && timeValid(r, timeOverride));
  if (explicit.length > 0) return explicit;
  return ALL_ROUTES
    .filter(r => r.from === to && r.to === from && timeValid(r, timeOverride))
    .map(mirrorRoute);
}

// Compose a two-segment journey through a major transfer hub, mirroring how
// guests actually connect between two resorts (bus to a park or Disney
// Springs, then transfer).
const TRANSFER_HUBS = ['DS', 'MK', 'EP', 'HS', 'AK', 'CBR', 'TTC'];

function bestSegment(from: string, to: string, timeOverride?: Date): Route | null {
  const candidates = directRoutes(from, to, timeOverride)
    .filter(r => r.legs.every(l => l.mode !== 'minnie_van'))
    .filter(r => !r.timeRestriction)
    .filter(r => r.legs.length <= 2);
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a.totalRideMinutes <= b.totalRideMinutes ? a : b));
}

function synthesizeViaHub(from: string, to: string, timeOverride?: Date): Route[] {
  const options: Route[] = [];
  for (const hub of TRANSFER_HUBS) {
    if (hub === from || hub === to) continue;
    const a = bestSegment(from, hub, timeOverride);
    const b = bestSegment(hub, to, timeOverride);
    if (!a || !b) continue;
    if (a.legs.length + b.legs.length > 3) continue;
    const legs: Leg[] = [
      ...a.legs,
      { ...b.legs[0], walkMinutes: 5 },
      ...b.legs.slice(1),
    ];
    const totalRideMinutes = legs.reduce((sum, l) => sum + l.rideMinutes, 0);
    options.push({
      id: `synth-${from}-${hub}-${to}`,
      from, to, legs, totalRideMinutes,
      tags: ['transfer'],
      name: nameForLegs(legs),
      notes: `Transfer at ${destLabel(hub)}.`,
    });
  }
  options.sort((x, y) => x.totalRideMinutes - y.totalRideMinutes);
  // Keep alternates only if they're competitive with the best option
  return options.slice(0, 2).filter((r, i) => i === 0 || r.totalRideMinutes <= options[0].totalRideMinutes + 20);
}

function minnieVanFallback(from: string, to: string): Route {
  return {
    id: `minnie-${from}-${to}`,
    from, to,
    legs: [{ mode: 'minnie_van', from, to, rideMinutes: 18, simRange: [0, 0], accessible: true }],
    totalRideMinutes: 18,
    tags: [],
    name: 'Minnie Van (Lyft)',
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
      legs: [{ mode: 'walk', from: origFrom, to: origTo, rideMinutes: 3, simRange: [0, 0], accessible: true }],
      totalRideMinutes: 3,
      tags: ['walk_only'],
      name: `Walk to ${destLabel(origTo)} (~3 min)`,
    }];
  }

  let routes = directRoutes(from, to, timeOverride);
  const hasRealRoute = routes.some(r => r.legs.every(l => l.mode !== 'minnie_van'));

  if (!hasRealRoute) {
    routes = [...routes, ...synthesizeViaHub(from, to, timeOverride)];
    if (!routes.some(r => r.legs.some(l => l.mode === 'minnie_van'))) {
      routes = [...routes, minnieVanFallback(from, to)];
    }
  }

  return routes;
}

// ─── Filter + sort logic ─────────────────────────────────────────────────────

export function applyFilters(routes: Route[], filters: ActiveFilters): Route[] {
  let result = [...routes];

  if (filters.noWater) {
    result = result.filter(r => !r.tags.includes('water'));
  }

  if (filters.accessible) {
    result = result.filter(r => r.legs.every(l => l.accessible));
  }

  if (filters.noTransfer) {
    result = result.filter(r => r.legs.filter(l => l.mode !== 'walk').length === 1);
  }

  if (filters.scenic) {
    result = result.sort((a, b) => {
      const scenicScore = (r: Route) =>
        r.tags.includes('water') || r.tags.includes('scenic') ||
        r.legs.some(l => l.mode === 'skyliner' || l.mode === 'friendship_boat')
          ? -1 : 1;
      return scenicScore(a) - scenicScore(b);
    });
  } else {
    result = result.sort((a, b) => a.totalRideMinutes - b.totalRideMinutes);
  }

  return result;
}

// ─── Live arrival simulation ─────────────────────────────────────────────────

export function simulateArrival(mode: TransportMode): number {
  const ranges: Record<TransportMode, [number, number]> = {
    bus:               [1, 20],
    ferry_ttc_mk:      [1, 5],
    water_taxi_gold:   [1, 12],
    water_taxi_red:    [1, 12],
    water_taxi_green:  [1, 12],
    water_taxi_blue:   [1, 12],
    friendship_boat:   [1, 12],
    sassagoula_boat:   [1, 12],
    skyliner:          [0, 0],
    monorail_resort:   [1, 5],
    monorail_epcot:    [1, 10],
    monorail_express:  [1, 4],
    walk:              [0, 0],
    minnie_van:        [0, 0],
  };
  const [min, max] = ranges[mode];
  if (min === 0 && max === 0) return 0;
  return Math.round(Math.random() * (max - min) + min);
}

export function hasArrivalSim(mode: TransportMode): boolean {
  return mode !== 'walk' && mode !== 'minnie_van';
}

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

// ─── Time banner logic ───────────────────────────────────────────────────────

export function getTimeBannerMessage(timeOverride?: Date): string | null {
  const now = timeOverride ?? new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (totalMinutes < 600) {
    return `⏰ ${timeStr}: before 10am, park-to-park buses aren't running. Routes adjusted.`;
  }
  if (totalMinutes < 960) {
    return `⏰ Disney Springs bus routes limited before 4pm.`;
  }
  return null;
}

// ─── Geofence detection ──────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

import { GEOFENCE_ZONES } from '../data/destinations';

export function detectZone(lat: number, lng: number): string | null {
  let closest: { id: string; dist: number } | null = null;
  for (const zone of GEOFENCE_ZONES) {
    const dist = haversineDistance(lat, lng, zone.lat, zone.lng);
    if (dist <= zone.radiusMeters) {
      if (!closest || dist < closest.dist) {
        closest = { id: zone.id, dist };
      }
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
