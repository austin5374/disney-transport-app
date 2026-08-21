import { Destination, GeofenceZone } from '../types';

export const DESTINATIONS: Destination[] = [
  // Parks
  { id: 'MK',   label: 'Magic Kingdom',              group: 'Parks',              abbrev: 'MK', lat: 28.4177, lng: -81.5812 },
  { id: 'EP',   label: 'EPCOT',                       group: 'Parks',              abbrev: 'EP', lat: 28.3747, lng: -81.5494 },
  { id: 'HS',   label: 'Hollywood Studios',           group: 'Parks',              abbrev: 'HS', lat: 28.3575, lng: -81.5582 },
  { id: 'AK',   label: 'Animal Kingdom',              group: 'Parks',              abbrev: 'AK', lat: 28.3553, lng: -81.5901 },
  // Water Parks
  { id: 'TL',   label: 'Typhoon Lagoon',              group: 'Water Parks',        abbrev: 'TL', lat: 28.365, lng: -81.527 },
  { id: 'BB',   label: 'Blizzard Beach',              group: 'Water Parks',        abbrev: 'BB', lat: 28.3565, lng: -81.5825 },
  // Transportation
  { id: 'TTC',  label: 'Transportation & Ticket Center', group: 'Transportation',  abbrev: 'TTC', lat: 28.4101, lng: -81.5847 },
  // Entertainment
  { id: 'DS',   label: 'Disney Springs',              group: 'Entertainment',      abbrev: 'DS', lat: 28.3694, lng: -81.5163 },
  { id: 'BW',   label: "Disney's BoardWalk",          group: 'Entertainment',      abbrev: 'BW', lat: 28.37, lng: -81.557 },
  // Deluxe MK Area
  { id: 'CON',  label: 'Contemporary Resort',         group: 'Deluxe MK Area',     abbrev: 'CON', lat: 28.4152, lng: -81.5745 },
  { id: 'GF',   label: 'Grand Floridian',             group: 'Deluxe MK Area',     abbrev: 'GF', lat: 28.4108, lng: -81.5866 },
  { id: 'POLY', label: 'Polynesian Village',          group: 'Deluxe MK Area',     abbrev: 'POL', lat: 28.4056, lng: -81.5836 },
  { id: 'WL',   label: 'Wilderness Lodge',            group: 'Deluxe MK Area',     abbrev: 'WL', lat: 28.4106, lng: -81.5698 },
  { id: 'FW',   label: 'Fort Wilderness',             group: 'Deluxe MK Area',     abbrev: 'FW', lat: 28.4128, lng: -81.5623 },
  // Deluxe EPCOT Area
  { id: 'YC',   label: 'Yacht Club Resort',           group: 'Deluxe EPCOT Area',  abbrev: 'YC', lat: 28.3706, lng: -81.5537 },
  { id: 'BC',   label: 'Beach Club Resort',           group: 'Deluxe EPCOT Area',  abbrev: 'BC', lat: 28.3721, lng: -81.5545 },
  { id: 'BWI',  label: 'BoardWalk Inn',               group: 'Deluxe EPCOT Area',  abbrev: 'BWI', lat: 28.3697, lng: -81.5591 },
  { id: 'SW',   label: 'Swan Hotel',                  group: 'Deluxe EPCOT Area',  abbrev: 'SW', lat: 28.3667, lng: -81.5581 },
  { id: 'DO',   label: 'Dolphin Hotel',               group: 'Deluxe EPCOT Area',  abbrev: 'DO', lat: 28.3653, lng: -81.5573 },
  { id: 'SR',   label: 'Swan Reserve',                group: 'Deluxe EPCOT Area',  abbrev: 'SR', lat: 28.3684, lng: -81.5601 },
  // Deluxe AK Area
  { id: 'AKL',  label: 'Animal Kingdom Lodge',        group: 'Deluxe AK Area',     abbrev: 'AKL', lat: 28.3529, lng: -81.6019 },
  // Moderate Resorts
  { id: 'CBR',  label: 'Caribbean Beach Resort',      group: 'Moderate Resorts',   abbrev: 'CBR', lat: 28.3596, lng: -81.5424 },
  { id: 'COR',  label: 'Coronado Springs',            group: 'Moderate Resorts',   abbrev: 'COR', lat: 28.3549, lng: -81.5721 },
  { id: 'POFQ', label: 'Port Orleans French Quarter', group: 'Moderate Resorts',   abbrev: 'FQ', lat: 28.3872, lng: -81.5185 },
  { id: 'POR',  label: 'Port Orleans Riverside',      group: 'Moderate Resorts',   abbrev: 'POR', lat: 28.3811, lng: -81.5195 },
  // Value Resorts
  { id: 'ASMo', label: 'All-Star Movies',             group: 'Value Resorts',      abbrev: 'ASM', lat: 28.3376, lng: -81.5789 },
  { id: 'ASMu', label: 'All-Star Music',              group: 'Value Resorts',      abbrev: 'ASU', lat: 28.34, lng: -81.576 },
  { id: 'ASS',  label: 'All-Star Sports',             group: 'Value Resorts',      abbrev: 'ASS', lat: 28.339, lng: -81.5711 },
  { id: 'POP',  label: 'Pop Century Resort',          group: 'Value Resorts',      abbrev: 'POP', lat: 28.352, lng: -81.5406 },
  { id: 'AOA',  label: 'Art of Animation',            group: 'Value Resorts',      abbrev: 'AOA', lat: 28.3492, lng: -81.539 },
  // DVC / Other
  { id: 'RIV',  label: 'Riviera Resort',              group: 'DVC / Other',        abbrev: 'RIV', lat: 28.363, lng: -81.5473 },
  { id: 'OKW',  label: 'Old Key West Resort',         group: 'DVC / Other',        abbrev: 'OKW', lat: 28.3743, lng: -81.5192 },
  { id: 'SS',   label: 'Saratoga Springs',            group: 'DVC / Other',        abbrev: 'SS', lat: 28.3705, lng: -81.5194 },
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
  { id: 'EPCOT_RESORTS', label: 'BoardWalk / Beach Club / Yacht Club area',       lat: 28.3681, lng: -81.5533, radiusMeters: 500 },
  { id: 'CBR',         label: 'Caribbean Beach Resort',          lat: 28.3596, lng: -81.5424, radiusMeters: 400 },
  { id: 'AKL',         label: 'Animal Kingdom Lodge',            lat: 28.3529, lng: -81.6019, radiusMeters: 400 },
  { id: 'DS_RESORTS',  label: 'Port Orleans / Saratoga Springs area', lat: 28.3756, lng: -81.5068, radiusMeters: 800 },
  { id: 'AK_RESORTS',  label: 'Coronado Springs / All-Stars area',   lat: 28.3481, lng: -81.5830, radiusMeters: 700 },
  { id: 'WL_FW',       label: 'Wilderness Lodge / Fort Wilderness',  lat: 28.4081, lng: -81.5716, radiusMeters: 700 },
  { id: 'BB',          label: 'Blizzard Beach',                  lat: 28.3565, lng: -81.5825, radiusMeters: 400 },
  { id: 'TL',          label: 'Typhoon Lagoon',                  lat: 28.3650, lng: -81.5270, radiusMeters: 400 },
];
