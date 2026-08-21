import { Route, Leg, DestinationGroup } from '../types';
import { DESTINATION_MAP, shortLabel } from './destinations';

// Resort buses, generated rather than written out
//
// An exhaustive run over all 1,056 ordered pairs found holes: pairs where the
// app offered nothing but a paid car, and pairs where the only answer was a
// ninety-minute stitch through two hubs. Nearly every one of them was a resort
// and somewhere Disney runs a bus to.
//
// Adding those entries to routes.ts one at a time would have closed the ones
// we found and left the next omission to be found the same way. Disney's rule
// is simple enough to encode: every resort has a bus to every park and to
// Disney Springs, except where a boat, a monorail or the Skyliner already
// serves that pair. That rule, and its exceptions, are below — the same
// instinct as rail.ts, which derives every monorail pair from the beams rather
// than listing them.

/** Where a resort bus runs to. */
const BUS_DESTINATIONS = ['MK', 'EP', 'HS', 'AK', 'DS', 'TL', 'BB'];

const WATER_PARKS = ['TL', 'BB'];

// Where Disney runs something better than a bus, and so runs no bus at all.
// Guests at the EPCOT-area resorts walk or take a Friendship Boat to EPCOT and
// Hollywood Studios; the Skyliner resorts ride the gondola to both; the
// the monorail resorts reach Magic Kingdom and EPCOT on the beam;
// and the Sassagoula resorts reach Disney Springs by boat.
const NO_BUS: Record<string, string[]> = {
  BC:   ['EP', 'HS'],
  YC:   ['EP', 'HS'],
  BWI:  ['EP', 'HS'],
  SW:   ['EP', 'HS'],
  DO:   ['EP', 'HS'],
  SR:   ['EP', 'HS'],
  CBR:  ['EP', 'HS'],
  RIV:  ['EP', 'HS'],
  POP:  ['EP', 'HS'],
  AOA:  ['EP', 'HS'],
  // The monorail resorts reach both Magic Kingdom and EPCOT on the beam —
  // the resort loop to the Ticket Center, then the EPCOT line — so Disney
  // runs them no bus to either. Without this the planner invented one, and
  // ranked it above the monorail out of the Grand Floridian.
  CON:  ['MK', 'EP'],
  GF:   ['MK', 'EP'],
  POLY: ['MK', 'EP'],
  WL:   ['MK'],
  FW:   ['MK'],
  POFQ: ['DS'],
  POR:  ['DS'],
  OKW:  ['DS'],
  SS:   ['DS'],
};

const RESORT_GROUPS: DestinationGroup[] = [
  'Deluxe MK Area',
  'Deluxe EPCOT Area',
  'Deluxe AK Area',
  'Moderate Resorts',
  'Value Resorts',
  'DVC / Other',
];

function isResort(id: string): boolean {
  const dest = DESTINATION_MAP[id];
  return !!dest && RESORT_GROUPS.includes(dest.group);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ROAD_DETOUR = 1.35;
const BUS_KMH = 28;        // internal roads, with stops and gates
const BOARDING_MINUTES = 4;

/** Time aboard a resort bus between two points on property. */
export function busRideMinutes(fromId: string, toId: string): number {
  const a = DESTINATION_MAP[fromId];
  const b = DESTINATION_MAP[toId];
  if (!a || !b) return 20;
  const km = haversineKm(a.lat, a.lng, b.lat, b.lng) * ROAD_DETOUR;
  return Math.max(10, Math.round(BOARDING_MINUTES + (km / BUS_KMH) * 60));
}

function hasBus(resort: string, destination: string): boolean {
  if (!isResort(resort)) return false;
  if (!BUS_DESTINATIONS.includes(destination)) return false;
  return !(NO_BUS[resort] ?? []).includes(destination);
}

/** A resort bus, in either direction, if Disney runs one for this pair. */
export function resortBusRoutes(from: string, to: string): Route[] {
  if (!hasBus(from, to) && !hasBus(to, from)) return [];

  const ride = busRideMinutes(from, to);
  const label = shortLabel(to);
  const waterPark = WATER_PARKS.includes(from) || WATER_PARKS.includes(to);

  const legs: Leg[] = [{
    mode: 'bus',
    from,
    to,
    rideMinutes: ride,
    accessible: true,
    tip: waterPark
      ? 'Water park buses run only while the water park is open.'
      : 'Buses leave from the resort bus stop. Look for the sign with your destination on it.',
  }];

  return [{
    id: `resortbus-${from}-${to}`,
    from,
    to,
    legs,
    totalRideMinutes: ride,
    tags: [],
    name: `Bus to ${label}`,
    notes: 'Resort buses are shared, so the route may make a stop on the way.',
  }];
}
