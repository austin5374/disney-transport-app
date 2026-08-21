import { TransportMode } from '../types';

// Live-status transit lines
// Modeled on the real WDW network: monorail lines, Skyliner lines (hubbed at
// Caribbean Beach), watercraft routes (flag launches, ferry, Friendship
// boats, Sassagoula), and park-level bus service groups.

export type LineGroup = 'Monorail' | 'Skyliner' | 'Boats' | 'Buses';

// When a line actually runs
//
// `serviceHours` used to be a display string and nothing else: no code read
// it. So at 11pm the board offered a Skyliner countdown for a line that shuts
// at park close, and buses quoted departures at 3am. Anyone who knows the
// network checks that against the clock on their own phone, which makes it
// the most visible realism bug in the app.
//
// The window below is structured, so the live engine can close a line down.
// Times are minutes from midnight; a close past midnight is expressed as a
// value above 1440.
export interface ServiceWindow {
  /** Minutes relative to park open. Negative starts service early. */
  fromParkOpen?: number;
  /** Minutes relative to park close. Positive runs service late. */
  toParkClose?: number;
  /** A fixed clock window, for lines that ignore park hours. */
  absolute?: [number, number];
}

/** A typical operating day on property, in minutes from midnight. Park hours
 *  move with the calendar; a simulation only needs them to be plausible and
 *  identical for everyone looking at it. */
export const PARK_DAY = { open: 9 * 60, close: 22 * 60 } as const;

export function serviceWindowMinutes(window: ServiceWindow): [number, number] {
  if (window.absolute) return window.absolute;
  return [
    PARK_DAY.open + (window.fromParkOpen ?? 0),
    PARK_DAY.close + (window.toParkClose ?? 0),
  ];
}

/** Is this line running at `date`? */
export function isInService(line: TransitLine, date: Date): boolean {
  const [open, close] = serviceWindowMinutes(line.window);
  const minutes = date.getHours() * 60 + date.getMinutes();
  // A close past midnight wraps: 23:30 to 01:00 also covers 00:30.
  if (close > 24 * 60) return minutes >= open || minutes < close - 24 * 60;
  return minutes >= open && minutes < close;
}

/** When service next starts, as a display string. */
export function serviceStartLabel(line: TransitLine): string {
  const [open] = serviceWindowMinutes(line.window);
  const h = Math.floor(open / 60) % 24;
  const m = open % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export interface TransitLine {
  id: string;
  group: LineGroup;
  mode: TransportMode;
  name: string;          // e.g. "Monorail: Express Line"
  shortName: string;     // e.g. "Express"
  stations: string[];    // display names in order
  headwayMinutes: [number, number]; // typical min-max between departures
  serviceHours: string;  // display only
  window: ServiceWindow; // the same hours, in a form the engine can read
  color: string;         // line color for map + cards

  // The stops as destination ids, in the order the vehicle calls at them, so
  // every ordered pair on the line can be derived instead of hand-written.
  // `stations` above is display copy; this is the machine-readable twin.
  //
  // One stop can serve more than one destination — the Friendship Boat's
  // "Yacht & Beach Club" dock is both — hence the nested array.
  //
  // Declaring the stops and then writing the pairs out separately is how Port
  // Orleans Riverside to Old Key West ended up with no boat, even though both
  // sit on the same Sassagoula line. See lineRoutes.ts.
  stops?: string[][];
  /** Minutes between consecutive stops. Length is stops.length - 1. */
  hopMinutes?: number[];
}

export const TRANSIT_LINES: TransitLine[] = [
  // Monorail
  {
    id: 'mono-express',
    group: 'Monorail', mode: 'monorail_express',
    name: 'Monorail: Express Line',
    shortName: 'Express',
    stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
    headwayMinutes: [4, 7],
    serviceHours: '30 min before park open to 1 hr after close',
    window: { fromParkOpen: -30, toParkClose: 60 },
    color: '#E8554D',
  },
  {
    id: 'mono-resort',
    group: 'Monorail', mode: 'monorail_resort',
    name: 'Monorail: Resort Line',
    shortName: 'Resort Loop',
    stations: ['Transportation & Ticket Center', 'Polynesian Village', 'Grand Floridian', 'Magic Kingdom', 'Contemporary'],
    headwayMinutes: [5, 9],
    serviceHours: '30 min before park open to 1 hr after close',
    window: { fromParkOpen: -30, toParkClose: 60 },
    color: '#F2A93B',
  },
  {
    id: 'mono-epcot',
    group: 'Monorail', mode: 'monorail_epcot',
    name: 'Monorail: EPCOT Line',
    shortName: 'EPCOT',
    stations: ['Transportation & Ticket Center', 'EPCOT'],
    headwayMinutes: [6, 10],
    serviceHours: '30 min before park open to 1 hr after close',
    window: { fromParkOpen: -30, toParkClose: 60 },
    color: '#4C9F70',
  },

  // Skyliner (hub: Caribbean Beach)
  {
    id: 'sky-epcot',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner: EPCOT Line',
    shortName: 'EPCOT Line',
    stations: ['Caribbean Beach', 'Riviera Resort', 'EPCOT (International Gateway)'],
    headwayMinutes: [0, 1], // continuous loading
    serviceHours: '30 min before earliest park open to park close',
    window: { fromParkOpen: -30, toParkClose: 0 },
    color: '#1E96A8',
    stops: [['CBR'], ['RIV'], ['EP']],
    hopMinutes: [4, 5],
  },
  {
    id: 'sky-hs',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner: Hollywood Studios Line',
    shortName: 'Studios Line',
    stations: ['Caribbean Beach', 'Hollywood Studios'],
    headwayMinutes: [0, 1],
    serviceHours: '1 hr before park open to park close',
    window: { fromParkOpen: -60, toParkClose: 0 },
    color: '#D97B29',
    stops: [['CBR'], ['HS']],
    hopMinutes: [6],
  },
  {
    id: 'sky-pop',
    group: 'Skyliner', mode: 'skyliner',
    name: 'Skyliner: Pop Century / Art of Animation Line',
    shortName: 'Pop / AoA Line',
    stations: ['Caribbean Beach', 'Pop Century & Art of Animation'],
    headwayMinutes: [0, 1],
    serviceHours: '1 hr before earliest park open to park close',
    window: { fromParkOpen: -60, toParkClose: 0 },
    color: '#5A9AE6',
    stops: [['CBR'], ['POP', 'AOA']],
    hopMinutes: [5],
  },

  // Boats
  {
    id: 'boat-ferry',
    group: 'Boats', mode: 'ferry_ttc_mk',
    name: 'Magic Kingdom Ferryboat',
    shortName: 'MK Ferry',
    stations: ['Transportation & Ticket Center', 'Magic Kingdom'],
    headwayMinutes: [8, 12],
    serviceHours: 'Park open to 1 hr after close',
    window: { fromParkOpen: 0, toParkClose: 60 },
    color: '#378ADD',
    stops: [['TTC'], ['MK']],
    hopMinutes: [8],
  },
  {
    id: 'boat-gold',
    group: 'Boats', mode: 'water_taxi_gold',
    name: 'Resort Launch: Gold Flag',
    shortName: 'Gold Flag',
    stations: ['Magic Kingdom', 'Grand Floridian', 'Polynesian Village'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open to 90 min after close',
    window: { fromParkOpen: -30, toParkClose: 90 },
    color: '#D4A017',
    stops: [['MK'], ['GF'], ['POLY']],
    hopMinutes: [8, 6],
  },
  {
    id: 'boat-red',
    group: 'Boats', mode: 'water_taxi_red',
    name: 'Resort Launch: Red Flag',
    shortName: 'Red Flag',
    stations: ['Magic Kingdom', 'Wilderness Lodge'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open to 90 min after close',
    window: { fromParkOpen: -30, toParkClose: 90 },
    color: '#C94F42',
    stops: [['MK'], ['WL']],
    hopMinutes: [12],
  },
  {
    id: 'boat-green',
    group: 'Boats', mode: 'water_taxi_green',
    name: 'Resort Launch: Green Flag',
    shortName: 'Green Flag',
    stations: ['Magic Kingdom', 'Fort Wilderness'],
    headwayMinutes: [15, 25],
    serviceHours: '30 min before park open to 90 min after close',
    window: { fromParkOpen: -30, toParkClose: 90 },
    color: '#4C9F70',
    stops: [['MK'], ['FW']],
    hopMinutes: [15],
  },
  {
    id: 'boat-blue',
    group: 'Boats', mode: 'water_taxi_blue',
    name: 'Resort Launch: Blue Flag',
    shortName: 'Blue Flag',
    stations: ['Wilderness Lodge', 'Fort Wilderness', 'Contemporary'],
    headwayMinutes: [20, 30],
    serviceHours: '3:00 PM to 10:45 PM',
    window: { absolute: [15 * 60, 22 * 60 + 45] },
    color: '#4A7FD4',
    stops: [['WL'], ['FW'], ['CON']],
    hopMinutes: [10, 12],
  },
  {
    id: 'boat-friendship',
    group: 'Boats', mode: 'friendship_boat',
    name: 'Friendship Boats: Crescent Lake',
    shortName: 'Friendship',
    stations: ['EPCOT (International Gateway)', 'Boardwalk', 'Yacht & Beach Club', 'Swan & Dolphin', 'Hollywood Studios'],
    headwayMinutes: [15, 20],
    serviceHours: 'Park open to 1 hr after close',
    window: { fromParkOpen: 0, toParkClose: 60 },
    color: '#2E9E8F',
    stops: [['EP'], ['BWI', 'BW'], ['YC', 'BC'], ['SW', 'DO', 'SR'], ['HS']],
    hopMinutes: [5, 4, 4, 7],
  },
  {
    id: 'boat-sassagoula',
    group: 'Boats', mode: 'sassagoula_boat',
    name: 'Sassagoula River Cruise',
    shortName: 'Sassagoula',
    stations: ['Port Orleans French Quarter', 'Port Orleans Riverside', 'Old Key West', 'Saratoga Springs', 'Disney Springs'],
    headwayMinutes: [15, 20],
    serviceHours: '10:30 AM to 11:30 PM',
    window: { absolute: [10 * 60 + 30, 23 * 60 + 30] },
    color: '#8C5A3C',
    stops: [['POFQ'], ['POR'], ['OKW'], ['SS'], ['DS']],
    hopMinutes: [6, 8, 6, 5],
  },

  // Bus service groups
  {
    id: 'bus-mk',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Magic Kingdom',
    shortName: 'MK Buses',
    stations: ['All resorts', 'Magic Kingdom'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open to 1 hr after close',
    window: { fromParkOpen: -45, toParkClose: 60 },
    color: '#639922',
  },
  {
    id: 'bus-ep',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: EPCOT',
    shortName: 'EPCOT Buses',
    stations: ['All resorts', 'EPCOT'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open to 1 hr after close',
    window: { fromParkOpen: -45, toParkClose: 60 },
    color: '#639922',
  },
  {
    id: 'bus-hs',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Hollywood Studios',
    shortName: 'Studios Buses',
    stations: ['All resorts', 'Hollywood Studios'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open to 1 hr after close',
    window: { fromParkOpen: -45, toParkClose: 60 },
    color: '#639922',
  },
  {
    id: 'bus-ak',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Animal Kingdom',
    shortName: 'AK Buses',
    stations: ['All resorts', 'Animal Kingdom'],
    headwayMinutes: [15, 20],
    serviceHours: '45 min before park open to 1 hr after close',
    window: { fromParkOpen: -45, toParkClose: 60 },
    color: '#639922',
  },
  {
    id: 'bus-ds',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Disney Springs',
    shortName: 'Springs Buses',
    stations: ['All resorts', 'Disney Springs'],
    headwayMinutes: [20, 20],
    serviceHours: 'Resorts: all day · From parks: after 4 PM',
    window: { fromParkOpen: -45, toParkClose: 90 },
    color: '#639922',
  },
  {
    id: 'bus-wp',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Water Parks',
    shortName: 'Water Park Buses',
    stations: ['All resorts', 'Typhoon Lagoon & Blizzard Beach'],
    headwayMinutes: [20, 30],
    serviceHours: 'Water park open to close',
    window: { absolute: [10 * 60, 18 * 60] },
    color: '#639922',
  },
  {
    id: 'bus-resort',
    group: 'Buses', mode: 'bus',
    name: 'Resort Buses: Resort Connections',
    shortName: 'Resort Buses',
    stations: ['Fort Wilderness', 'Wilderness Lodge', 'Boardwalk Inn', 'Caribbean Beach'],
    headwayMinutes: [20, 30],
    serviceHours: 'Limited service, longest waits on property',
    window: { fromParkOpen: -30, toParkClose: 60 },
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
      // A bus leg's status follows the park-side end of the trip. Legs with
      // no park end are the sparse resort-to-resort connections, which have
      // their own (much longer) headway rather than no line at all.
      return LINE_MAP[parkBus[to] ?? parkBus[from] ?? 'bus-resort'];
    }
    default: return null;
  }
}
