import { TransportMode } from '../types';

// ─── Live-status transit lines ──────────────────────────────────────────────
// Modeled on the real WDW network: monorail lines, Skyliner lines (hubbed at
// Caribbean Beach), watercraft routes (flag launches, ferry, Friendship
// boats, Sassagoula), and park-level bus service groups.

export type LineGroup = 'Monorail' | 'Skyliner' | 'Boats' | 'Buses';

export interface TransitLine {
  id: string;
  group: LineGroup;
  mode: TransportMode;
  name: string;          // e.g. "Monorail — Express Line"
  shortName: string;     // e.g. "Express"
  stations: string[];    // display names in order
  headwayMinutes: [number, number]; // typical min–max between departures
  serviceHours: string;  // display only
  weatherSensitive?: boolean; // gondolas + boats pause for lightning/wind
  color: string;         // line color for map + cards
}

export const TRANSIT_LINES: TransitLine[] = [
  // ── Monorail ──────────────────────────────────────────────────────────────
  {
    id: 'mono-express',
    group: 'Monorail', mode: 'monorail_express',
    name: 'Monorail — Express Line',
    shortName: 'Express',
    stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
    headwayMinutes: [4, 7],
    serviceHours: '30 min before park open – 1 hr after close',
    color: '#E8554D',
  },
  {
    id: 'mono-resort',
    group: 'Monorail', mode: 'monorail_resort',
    name: 'Monorail — Resort Line',
    shortName: 'Resort Loop',
    stations: ['Transportation & Ticket Center', 'Polynesian Village', 'Grand Floridian', 'Magic Kingdom', 'Contemporary'],
    headwayMinutes: [5, 9],
    serviceHours: '30 min before park open – 1 hr after close',
    color: '#F2A93B',
  },
  {
    id: 'mono-epcot',
    group: 'Monorail', mode: 'monorail_epcot',
    name: 'Monorail — EPCOT Line',
    shortName: 'EPCOT',
    stations: ['Transportation & Ticket Center', 'EPCOT'],
    headwayMinutes: [6, 10],
    serviceHours: '30 min before park open – 1 hr after close',
    color: '#4C9F70',
  },

  // ── Skyliner (hub: Caribbean Beach) ──────────────────────────────────────
  {
    id: 'sky-epcot',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner — EPCOT Line',
    shortName: 'EPCOT Line',
    stations: ['Caribbean Beach', 'Riviera Resort', 'EPCOT (International Gateway)'],
    headwayMinutes: [0, 1], // continuous loading
    serviceHours: '30 min before earliest park open – park close',
    weatherSensitive: true,
    color: '#7F77DD',
  },
  {
    id: 'sky-hs',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner — Hollywood Studios Line',
    shortName: 'Studios Line',
    stations: ['Caribbean Beach', 'Hollywood Studios'],
    headwayMinutes: [0, 1],
    serviceHours: '1 hr before park open – park close',
    weatherSensitive: true,
    color: '#B268C2',
  },
  {
    id: 'sky-pop',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner — Pop Century / Art of Animation Line',
    shortName: 'Pop / AoA Line',
    stations: ['Caribbean Beach', 'Pop Century & Art of Animation'],
    headwayMinutes: [0, 1],
    serviceHours: '1 hr before earliest park open – park close',
    weatherSensitive: true,
    color: '#5A9AE6',
  },

  // ── Boats ─────────────────────────────────────────────────────────────────
  {
    id: 'boat-ferry',
    group: 'Boats', mode: 'ferry_ttc_mk',
    name: 'Magic Kingdom Ferryboat',
    shortName: 'MK Ferry',
    stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
    headwayMinutes: [8, 12],
    serviceHours: 'Park open – 1 hr after close',
    weatherSensitive: true,
    color: '#378ADD',
  },
  {
    id: 'boat-gold',
    group: 'Boats', mode: 'water_taxi_gold',
    name: 'Resort Launch — Gold Flag',
    shortName: 'Gold Flag',
    stations: ['Magic Kingdom', 'Grand Floridian', 'Polynesian Village'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open – 90 min after close',
    weatherSensitive: true,
    color: '#D4A017',
  },
  {
    id: 'boat-red',
    group: 'Boats', mode: 'water_taxi_red',
    name: 'Resort Launch — Red Flag',
    shortName: 'Red Flag',
    stations: ['Magic Kingdom', 'Wilderness Lodge'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open – 90 min after close',
    weatherSensitive: true,
    color: '#C94F42',
  },
  {
    id: 'boat-green',
    group: 'Boats', mode: 'water_taxi_green',
    name: 'Resort Launch — Green Flag',
    shortName: 'Green Flag',
    stations: ['Magic Kingdom', 'Fort Wilderness'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open – 90 min after close',
    weatherSensitive: true,
    color: '#4C9F70',
  },
  {
    id: 'boat-blue',
    group: 'Boats', mode: 'water_taxi_blue',
    name: 'Resort Launch — Blue Flag',
    shortName: 'Blue Flag',
    stations: ['Wilderness Lodge', 'Fort Wilderness', 'Contemporary'],
    headwayMinutes: [20, 30],
    serviceHours: '3:00 PM – 10:45 PM',
    weatherSensitive: true,
    color: '#4A7FD4',
  },
  {
    id: 'boat-friendship',
    group: 'Boats', mode: 'friendship_boat',
    name: 'Friendship Boats — Crescent Lake',
    shortName: 'Friendship',
    stations: ['EPCOT (International Gateway)', 'BoardWalk', 'Yacht & Beach Club', 'Swan & Dolphin', 'Hollywood Studios'],
    headwayMinutes: [15, 20],
    serviceHours: 'Park open – 1 hr after close',
    weatherSensitive: true,
    color: '#2E9E8F',
  },
  {
    id: 'boat-sassagoula',
    group: 'Boats', mode: 'sassagoula_boat',
    name: 'Sassagoula River Cruise',
    shortName: 'Sassagoula',
    stations: ['Port Orleans French Quarter', 'Port Orleans Riverside', 'Old Key West', 'Saratoga Springs', 'Disney Springs'],
    headwayMinutes: [15, 20],
    serviceHours: '10:30 AM – 11:30 PM',
    weatherSensitive: true,
    color: '#8A6FBF',
  },

  // ── Bus service groups ────────────────────────────────────────────────────
  {
    id: 'bus-mk',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — Magic Kingdom',
    shortName: 'MK Buses',
    stations: ['All resorts', 'Magic Kingdom'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open – 1 hr after close',
    color: '#639922',
  },
  {
    id: 'bus-ep',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — EPCOT',
    shortName: 'EPCOT Buses',
    stations: ['All resorts', 'EPCOT'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open – 1 hr after close',
    color: '#639922',
  },
  {
    id: 'bus-hs',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — Hollywood Studios',
    shortName: 'Studios Buses',
    stations: ['All resorts', 'Hollywood Studios'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open – 1 hr after close',
    color: '#639922',
  },
  {
    id: 'bus-ak',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — Animal Kingdom',
    shortName: 'AK Buses',
    stations: ['All resorts', 'Animal Kingdom'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open – 1 hr after close',
    color: '#639922',
  },
  {
    id: 'bus-ds',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — Disney Springs',
    shortName: 'Springs Buses',
    stations: ['All resorts', 'Disney Springs'],
    headwayMinutes: [20, 20],
    serviceHours: 'Resorts: all day · From parks: after 4 PM',
    color: '#639922',
  },
  {
    id: 'bus-wp',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses — Water Parks',
    shortName: 'Water Park Buses',
    stations: ['All resorts', 'Typhoon Lagoon & Blizzard Beach'],
    headwayMinutes: [20, 30],
    serviceHours: 'Water park open – close',
    color: '#639922',
  },
];

export const LINE_MAP: Record<string, TransitLine> = Object.fromEntries(
  TRANSIT_LINES.map(l => [l.id, l])
);

// Maps a route leg to the transit line whose live status governs it, so the
// planner can surface disruptions on the exact line a leg rides.
export function lineForLeg(mode: TransportMode, from: string, to: string): TransitLine | null {
  switch (mode) {
    case 'monorail_express': return LINE_MAP['mono-express'];
    case 'monorail_resort':  return LINE_MAP['mono-resort'];
    case 'monorail_epcot':   return LINE_MAP['mono-epcot'];
    case 'ferry_ttc_mk':     return LINE_MAP['boat-ferry'];
    case 'water_taxi_gold':  return LINE_MAP['boat-gold'];
    case 'water_taxi_red':   return LINE_MAP['boat-red'];
    case 'water_taxi_green': return LINE_MAP['boat-green'];
    case 'water_taxi_blue':  return LINE_MAP['boat-blue'];
    case 'friendship_boat':  return LINE_MAP['boat-friendship'];
    case 'sassagoula_boat':  return LINE_MAP['boat-sassagoula'];
    case 'skyliner': {
      const ends = new Set([from, to]);
      if (ends.has('EP') || ends.has('RIV')) return LINE_MAP['sky-epcot'];
      if (ends.has('HS')) return LINE_MAP['sky-hs'];
      return LINE_MAP['sky-pop'];
    }
    case 'bus': {
      const parkBus: Record<string, string> = {
        MK: 'bus-mk', EP: 'bus-ep', HS: 'bus-hs', AK: 'bus-ak',
        DS: 'bus-ds', TL: 'bus-wp', BB: 'bus-wp',
      };
      // A bus leg's status follows the park-side end of the trip
      return LINE_MAP[parkBus[to] ?? parkBus[from]] ?? null;
    }
    default: return null;
  }
}
