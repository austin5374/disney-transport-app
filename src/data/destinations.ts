import { Destination, GeofenceZone } from '../types';

export const DESTINATIONS: Destination[] = [
  // Parks
  { id: 'MK',   label: 'Magic Kingdom',              group: 'Parks',              abbrev: 'MK'  },
  { id: 'EP',   label: 'EPCOT',                       group: 'Parks',              abbrev: 'EP'  },
  { id: 'HS',   label: 'Hollywood Studios',           group: 'Parks',              abbrev: 'HS'  },
  { id: 'AK',   label: 'Animal Kingdom',              group: 'Parks',              abbrev: 'AK'  },
  // Water Parks
  { id: 'TL',   label: 'Typhoon Lagoon',              group: 'Water Parks',        abbrev: 'TL'  },
  { id: 'BB',   label: 'Blizzard Beach',              group: 'Water Parks',        abbrev: 'BB'  },
  // Transportation
  { id: 'TTC',  label: 'Transportation & Ticket Center', group: 'Transportation',  abbrev: 'TTC' },
  // Entertainment
  { id: 'DS',   label: 'Disney Springs',              group: 'Entertainment',      abbrev: 'DS'  },
  { id: 'BW',   label: "Disney's BoardWalk",          group: 'Entertainment',      abbrev: 'BW'  },
  // Deluxe MK Area
  { id: 'CON',  label: 'Contemporary Resort',         group: 'Deluxe MK Area',     abbrev: 'CON' },
  { id: 'GF',   label: 'Grand Floridian',             group: 'Deluxe MK Area',     abbrev: 'GF'  },
  { id: 'POLY', label: 'Polynesian Village',          group: 'Deluxe MK Area',     abbrev: 'POL' },
  { id: 'WL',   label: 'Wilderness Lodge',            group: 'Deluxe MK Area',     abbrev: 'WL'  },
  { id: 'FW',   label: 'Fort Wilderness',             group: 'Deluxe MK Area',     abbrev: 'FW'  },
  // Deluxe EPCOT Area
  { id: 'YC',   label: 'Yacht Club Resort',           group: 'Deluxe EPCOT Area',  abbrev: 'YC'  },
  { id: 'BC',   label: 'Beach Club Resort',           group: 'Deluxe EPCOT Area',  abbrev: 'BC'  },
  { id: 'BWI',  label: 'BoardWalk Inn',               group: 'Deluxe EPCOT Area',  abbrev: 'BWI' },
  { id: 'AKL',  label: 'Animal Kingdom Lodge',        group: 'Deluxe EPCOT Area',  abbrev: 'AKL' },
  { id: 'SW',   label: 'Swan Hotel',                  group: 'Deluxe EPCOT Area',  abbrev: 'SW'  },
  { id: 'DO',   label: 'Dolphin Hotel',               group: 'Deluxe EPCOT Area',  abbrev: 'DO'  },
  { id: 'SR',   label: 'Swan Reserve',                group: 'Deluxe EPCOT Area',  abbrev: 'SR'  },
  // Moderate Resorts
  { id: 'CBR',  label: 'Caribbean Beach Resort',      group: 'Moderate Resorts',   abbrev: 'CBR' },
  { id: 'COR',  label: 'Coronado Springs',            group: 'Moderate Resorts',   abbrev: 'COR' },
  { id: 'POFQ', label: 'Port Orleans French Quarter', group: 'Moderate Resorts',   abbrev: 'FQ'  },
  { id: 'POR',  label: 'Port Orleans Riverside',      group: 'Moderate Resorts',   abbrev: 'POR' },
  // Value Resorts
  { id: 'ASMo', label: 'All-Star Movies',             group: 'Value Resorts',      abbrev: 'ASM' },
  { id: 'ASMu', label: 'All-Star Music',              group: 'Value Resorts',      abbrev: 'ASU' },
  { id: 'ASS',  label: 'All-Star Sports',             group: 'Value Resorts',      abbrev: 'ASS' },
  { id: 'POP',  label: 'Pop Century Resort',          group: 'Value Resorts',      abbrev: 'POP' },
  { id: 'AOA',  label: 'Art of Animation',            group: 'Value Resorts',      abbrev: 'AOA' },
  // DVC / Other
  { id: 'RIV',  label: 'Riviera Resort',              group: 'DVC / Other',        abbrev: 'RIV' },
  { id: 'OKW',  label: 'Old Key West Resort',         group: 'DVC / Other',        abbrev: 'OKW' },
  { id: 'SS',   label: 'Saratoga Springs',            group: 'DVC / Other',        abbrev: 'SS'  },
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
