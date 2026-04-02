import { Route, ActiveFilters, TransportMode } from '../types';
import { ALL_ROUTES } from '../data/routes';

// ─── Time rules engine ───────────────────────────────────────────────────────

export function getActiveRoutes(from: string, to: string, timeOverride?: Date): Route[] {
  const now = timeOverride ?? new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const before10am = totalMinutes < 600;  // 10:00 AM
  const before4pm  = totalMinutes < 960;  // 4:00 PM
  const before3pm  = totalMinutes < 900;  // 3:00 PM (Blue Flag water taxi)

  return ALL_ROUTES
    .filter(r => r.from === from && r.to === to)
    .filter(r => {
      if (r.timeRestriction === 'before_10am' && !before10am) return false;
      if (r.timeRestriction === 'before_4pm'  && !before4pm)  return false;
      if (r.timeRestriction === 'after_3pm_only' && before3pm) return false;
      return true;
    });
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
    return `⏰ ${timeStr} — before 10am, park-to-park buses aren't running. Routes adjusted.`;
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
