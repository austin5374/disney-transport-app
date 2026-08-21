import { TransportMode, Destination } from '../types';
import { ALL_ROUTES } from '../data/routes';
import { DESTINATIONS, DESTINATION_MAP } from '../data/destinations';

// What a list row says underneath a place name
//
// The reference app's list rows are always two lines: a bold navy title over a
// gray line of context. The old build put a colored two-letter abbreviation
// chip on the right instead, which is a transit-diagram affordance the
// reference uses nowhere, and which added a third color system on top of the
// line colors and the status colors.
//
// The sub-line here is derived from the route graph rather than typed out, so
// it cannot drift when a route is added: it says how you would actually leave
// this place.

/** Monorail stations are generated from the beams in rail.ts, so they never
 *  appear as legs in the hand-authored route file. */
const MONORAIL_STATIONS = new Set(['TTC', 'POLY', 'GF', 'MK', 'CON', 'EP']);

type ServiceKind = 'Monorail' | 'Skyliner' | 'Boat' | 'Bus' | 'Walk';

function kindFor(mode: TransportMode): ServiceKind | null {
  switch (mode) {
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':  return 'Monorail';
    case 'skyliner':        return 'Skyliner';
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue': return 'Boat';
    case 'bus':             return 'Bus';
    case 'walk':            return 'Walk';
    default:                return null;  // a paid car is not "service here"
  }
}

// Listed in the order a guest would rank them, not alphabetically.
const KIND_ORDER: ServiceKind[] = ['Monorail', 'Skyliner', 'Boat', 'Bus', 'Walk'];

const SERVICE: Record<string, Set<ServiceKind>> = {};

function note(id: string, kind: ServiceKind | null) {
  if (!kind) return;
  (SERVICE[id] ??= new Set()).add(kind);
}

for (const route of ALL_ROUTES) {
  for (const leg of route.legs) {
    const kind = kindFor(leg.mode);
    note(leg.from, kind);
    note(leg.to, kind);
  }
}
for (const id of MONORAIL_STATIONS) note(id, 'Monorail');

/** How you get to and from this place, e.g. "Monorail · Boat · Bus". */
export function serviceSummary(id: string): string {
  const kinds = SERVICE[id];
  if (!kinds || kinds.size === 0) return 'Paid ride only';
  const ordered = KIND_ORDER.filter(k => kinds.has(k));
  // A place served by a train and a boat does not also need to advertise that
  // you could walk; the walk is only worth naming when it is the whole story.
  const withoutWalk = ordered.filter(k => k !== 'Walk');
  return (withoutWalk.length > 0 ? withoutWalk : ordered).slice(0, 3).join(' · ');
}

const GROUP_LABEL: Record<string, string> = {
  'Parks':             'Theme Park',
  'Water Parks':       'Water Park',
  'Transportation':    'Transportation Hub',
  'Entertainment':     'Dining, Shopping & Entertainment',
  'Deluxe MK Area':    'Deluxe Resort · Magic Kingdom Area',
  'Deluxe EPCOT Area': 'Deluxe Resort · EPCOT Area',
  'Deluxe AK Area':    'Deluxe Resort · Animal Kingdom Area',
  'Moderate Resorts':  'Moderate Resort',
  'Value Resorts':     'Value Resort',
  'DVC / Other':       'Disney Vacation Club Resort',
};

/** The gray second line under a place name in any list row. */
export function destinationSubtitle(dest: Destination): string {
  return `${GROUP_LABEL[dest.group] ?? dest.group} · ${serviceSummary(dest.id)}`;
}

/** Case-insensitive match across name, id and abbreviation. */
export function matchesQuery(dest: Destination, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    dest.label.toLowerCase().includes(q) ||
    dest.id.toLowerCase().includes(q) ||
    dest.abbrev.toLowerCase().includes(q)
  );
}

export function searchDestinations(query: string): Destination[] {
  const q = query.trim();
  if (!q) return [];
  return DESTINATIONS.filter(d => matchesQuery(d, q));
}

// Names that do not fit under a 92-point diagram node
//
// The journey diagram was rendering "Transportation & Ticket Center" into a
// 76-point column, which broke the word across two lines as "Transportati /
// on & Ticket.." — the first thing on the detail screen, and it looked broken
// because it was. These are the names people actually use out loud anyway.
const SHORT_LABELS: Record<string, string> = {
  TTC:  'Ticket Center',
  POFQ: 'Port Orleans FQ',
  POR:  'Port Orleans Riverside',
  ASMo: 'All-Star Movies',
  ASMu: 'All-Star Music',
  ASS:  'All-Star Sports',
  BWI:  'BoardWalk Inn',
  CBR:  'Caribbean Beach',
  CON:  'Contemporary',
  POLY: 'Polynesian',
  GF:   'Grand Floridian',
  AKL:  'Animal Kingdom Lodge',
  OKW:  'Old Key West',
  SS:   'Saratoga Springs',
  AOA:  'Art of Animation',
  POP:  'Pop Century',
};

/** A place name short enough to sit under a diagram node without breaking. */
export function shortLabel(id: string): string {
  return SHORT_LABELS[id] ?? DESTINATION_MAP[id]?.label ?? id;
}
