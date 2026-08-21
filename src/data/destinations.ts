import { Destination, GeofenceZone } from '../types';

// `label` carries the resort's official name, "Disney's" prefix and all,
// because that is what the signage, the confirmation email and the reference
// app all say. The Swan, the Dolphin and the Swan Reserve are Marriott-run
// properties on Disney land, so they take no prefix.
//
// Official names are long, and a route card that reads "Walk to Disney's
// Grand Floridian Resort & Spa, Bus to Hollywood Studios" is unreadable. Step
// text, route names and diagram nodes use shortLabel() in destinationMeta.ts
// instead; the full name is for headers, search results and anywhere the
// guest is picking a place rather than reading a direction.
export const DESTINATIONS: Destination[] = [
  // Parks
  { id: 'MK',   label: 'Magic Kingdom',                                 group: 'Parks',             abbrev: 'MK',  lat: 28.4177, lng: -81.5812 },
  { id: 'EP',   label: 'EPCOT',                                         group: 'Parks',             abbrev: 'EP',  lat: 28.3747, lng: -81.5494 },
  { id: 'HS',   label: 'Hollywood Studios',                             group: 'Parks',             abbrev: 'HS',  lat: 28.3575, lng: -81.5582 },
  { id: 'AK',   label: 'Animal Kingdom',                                group: 'Parks',             abbrev: 'AK',  lat: 28.3553, lng: -81.5901 },
  // Water Parks
  { id: 'TL',   label: 'Typhoon Lagoon',                                group: 'Water Parks',       abbrev: 'TL',  lat: 28.365, lng: -81.527 },
  { id: 'BB',   label: 'Blizzard Beach',                                group: 'Water Parks',       abbrev: 'BB',  lat: 28.3565, lng: -81.5825 },
  // Transportation
  { id: 'TTC',  label: 'Transportation & Ticket Center',                group: 'Transportation',    abbrev: 'TTC', lat: 28.4101, lng: -81.5847 },
  // Entertainment
  { id: 'DS',   label: 'Disney Springs',                                group: 'Entertainment',     abbrev: 'DS',  lat: 28.3694, lng: -81.5163 },
  { id: 'BW',   label: "Disney's Boardwalk",                            group: 'Entertainment',     abbrev: 'BW',  lat: 28.37, lng: -81.557 },
  // Deluxe MK Area
  { id: 'CON',  label: "Disney's Contemporary Resort",                  group: 'Deluxe MK Area',    abbrev: 'CON', lat: 28.4152, lng: -81.5745 },
  { id: 'GF',   label: "Disney's Grand Floridian Resort & Spa",         group: 'Deluxe MK Area',    abbrev: 'GF',  lat: 28.4108, lng: -81.5866 },
  { id: 'POLY', label: "Disney's Polynesian Village Resort",            group: 'Deluxe MK Area',    abbrev: 'POL', lat: 28.4056, lng: -81.5836 },
  { id: 'WL',   label: "Disney's Wilderness Lodge",                     group: 'Deluxe MK Area',    abbrev: 'WL',  lat: 28.4106, lng: -81.5698 },
  { id: 'FW',   label: "Disney's Fort Wilderness Resort & Campground",  group: 'Deluxe MK Area',    abbrev: 'FW',  lat: 28.4128, lng: -81.5623 },
  // Deluxe EPCOT Area
  { id: 'YC',   label: "Disney's Yacht Club Resort",                    group: 'Deluxe EPCOT Area', abbrev: 'YC',  lat: 28.3706, lng: -81.5537 },
  { id: 'BC',   label: "Disney's Beach Club Resort",                    group: 'Deluxe EPCOT Area', abbrev: 'BC',  lat: 28.3721, lng: -81.5545 },
  { id: 'BWI',  label: "Disney's Boardwalk Inn",                        group: 'Deluxe EPCOT Area', abbrev: 'BWI', lat: 28.3697, lng: -81.5591 },
  { id: 'SW',   label: 'Swan Hotel',                                    group: 'Deluxe EPCOT Area', abbrev: 'SW',  lat: 28.3667, lng: -81.5581 },
  { id: 'DO',   label: 'Dolphin Hotel',                                 group: 'Deluxe EPCOT Area', abbrev: 'DO',  lat: 28.3653, lng: -81.5573 },
  { id: 'SR',   label: 'Swan Reserve',                                  group: 'Deluxe EPCOT Area', abbrev: 'SR',  lat: 28.3684, lng: -81.5601 },
  // Deluxe AK Area
  { id: 'AKL',  label: "Disney's Animal Kingdom Lodge",                 group: 'Deluxe AK Area',    abbrev: 'AKL', lat: 28.3529, lng: -81.6019 },
  // Moderate Resorts
  { id: 'CBR',  label: "Disney's Caribbean Beach Resort",               group: 'Moderate Resorts',  abbrev: 'CBR', lat: 28.3596, lng: -81.5424 },
  { id: 'COR',  label: "Disney's Coronado Springs Resort",              group: 'Moderate Resorts',  abbrev: 'COR', lat: 28.3549, lng: -81.5721 },
  { id: 'POFQ', label: "Disney's Port Orleans Resort – French Quarter", group: 'Moderate Resorts',  abbrev: 'FQ',  lat: 28.3872, lng: -81.5185 },
  { id: 'POR',  label: "Disney's Port Orleans Resort – Riverside",      group: 'Moderate Resorts',  abbrev: 'POR', lat: 28.3811, lng: -81.5195 },
  // Value Resorts
  { id: 'ASMo', label: "Disney's All-Star Movies Resort",               group: 'Value Resorts',     abbrev: 'ASM', lat: 28.3376, lng: -81.5789 },
  { id: 'ASMu', label: "Disney's All-Star Music Resort",                group: 'Value Resorts',     abbrev: 'ASU', lat: 28.34, lng: -81.576 },
  { id: 'ASS',  label: "Disney's All-Star Sports Resort",               group: 'Value Resorts',     abbrev: 'ASS', lat: 28.339, lng: -81.5711 },
  { id: 'POP',  label: "Disney's Pop Century Resort",                   group: 'Value Resorts',     abbrev: 'POP', lat: 28.352, lng: -81.5406 },
  { id: 'AOA',  label: "Disney's Art of Animation Resort",              group: 'Value Resorts',     abbrev: 'AOA', lat: 28.3492, lng: -81.539 },
  // DVC / Other
  { id: 'RIV',  label: "Disney's Riviera Resort",                       group: 'DVC / Other',       abbrev: 'RIV', lat: 28.363, lng: -81.5473 },
  { id: 'OKW',  label: "Disney's Old Key West Resort",                  group: 'DVC / Other',       abbrev: 'OKW', lat: 28.3743, lng: -81.5192 },
  { id: 'SS',   label: "Disney's Saratoga Springs Resort & Spa",        group: 'DVC / Other',       abbrev: 'SS',  lat: 28.3705, lng: -81.5194 },
];

export const DESTINATION_MAP: Record<string, Destination> = Object.fromEntries(
  DESTINATIONS.map(d => [d.id, d])
);

export const GEOFENCE_ZONES: GeofenceZone[] = [
  { id: 'MK',          label: 'Magic Kingdom',                   lat: 28.4177, lng: -81.5812, radiusMeters: 600 },
  { id: 'EP',          label: 'EPCOT',                           lat: 28.3747, lng: -81.5494, radiusMeters: 600 },
  { id: 'HS',          label: 'Hollywood Studios',               lat: 28.3575, lng: -81.5582, radiusMeters: 500 },
  { id: 'AK',          label: 'Animal Kingdom',                  lat: 28.3553, lng: -81.5901, radiusMeters: 600 },
  { id: 'TTC',         label: 'Transportation & Ticket Center',  lat: 28.4101, lng: -81.5847, radiusMeters: 300 },
  { id: 'DS',          label: 'Disney Springs',                  lat: 28.3694, lng: -81.5163, radiusMeters: 500 },
  { id: 'MK_RESORTS',  label: 'Contemporary / Grand Floridian / Polynesian area', lat: 28.4132, lng: -81.5841, radiusMeters: 700 },
  { id: 'EPCOT_RESORTS', label: 'Boardwalk / Beach Club / Yacht Club area',       lat: 28.3681, lng: -81.5533, radiusMeters: 500 },
  { id: 'CBR',         label: 'Caribbean Beach Resort',          lat: 28.3596, lng: -81.5424, radiusMeters: 400 },
  { id: 'AKL',         label: 'Animal Kingdom Lodge',            lat: 28.3529, lng: -81.6019, radiusMeters: 400 },
  { id: 'DS_RESORTS',  label: 'Port Orleans / Saratoga Springs area', lat: 28.3756, lng: -81.5068, radiusMeters: 800 },
  { id: 'AK_RESORTS',  label: 'Coronado Springs / All-Stars area',   lat: 28.3481, lng: -81.5830, radiusMeters: 700 },
  { id: 'WL_FW',       label: 'Wilderness Lodge / Fort Wilderness',  lat: 28.4081, lng: -81.5716, radiusMeters: 700 },
  { id: 'BB',          label: 'Blizzard Beach',                  lat: 28.3565, lng: -81.5825, radiusMeters: 400 },
  { id: 'TL',          label: 'Typhoon Lagoon',                  lat: 28.3650, lng: -81.5270, radiusMeters: 400 },
];

// The name to use in a direction rather than in a list
//
// The journey diagram was rendering "Transportation & Ticket Center" into a
// 76-point column, which broke the word across two lines as "Transportati /
// on & Ticket.." — the first thing on the detail screen, and it looked broken
// because it was.
//
// Every Disney-owned resort now carries its official name in the data, which
// made the problem general rather than a handful of long outliers: "Walk to
// Disney's Grand Floridian Resort & Spa, Bus to Hollywood Studios" is a route
// name nobody can read. These are the names people actually use out loud, and
// they are what route names, step text and diagram nodes are built from. The
// official name still appears wherever the guest is choosing a place: search,
// the Get Directions sheet, saved trips and screen headers.
const SHORT_LABELS: Record<string, string> = {
  TTC:  'Ticket Center',
  BW:   'Boardwalk',
  CON:  'Contemporary',
  GF:   'Grand Floridian',
  POLY: 'Polynesian',
  WL:   'Wilderness Lodge',
  FW:   'Fort Wilderness',
  YC:   'Yacht Club',
  BC:   'Beach Club',
  BWI:  'Boardwalk Inn',
  AKL:  'Animal Kingdom Lodge',
  CBR:  'Caribbean Beach',
  COR:  'Coronado Springs',
  POFQ: 'Port Orleans FQ',
  POR:  'Port Orleans Riverside',
  ASMo: 'All-Star Movies',
  ASMu: 'All-Star Music',
  ASS:  'All-Star Sports',
  POP:  'Pop Century',
  AOA:  'Art of Animation',
  RIV:  'Riviera',
  OKW:  'Old Key West',
  SS:   'Saratoga Springs',
};

/** A place name short enough to sit under a diagram node without breaking. */
export function shortLabel(id: string): string {
  return SHORT_LABELS[id] ?? DESTINATION_MAP[id]?.label ?? id;
}
