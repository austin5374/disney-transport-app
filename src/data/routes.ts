import { Route } from '../types';

export const ALL_ROUTES: Route[] = [

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: MAGIC KINGDOM (MK)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'mk-ttc-express',
    from: 'MK', to: 'TTC', name: 'Express Monorail to TTC',
    legs: [{ mode: 'monorail_express', from: 'MK', to: 'TTC', rideMinutes: 8, simRange: [1,4], accessible: true, tip: 'Board at the Magic Kingdom monorail station inside the park, upper level.' }],
    totalRideMinutes: 8, tags: [], notes: 'Fastest option to TTC.',
  },
  {
    id: 'mk-ttc-ferry',
    from: 'MK', to: 'TTC', name: 'Ferry Boat to TTC',
    legs: [{ mode: 'ferry_ttc_mk', from: 'MK', to: 'TTC', rideMinutes: 12, simRange: [1,5], accessible: true, tip: 'Scenic Seven Seas Lagoon crossing. Boards at the main MK boat dock.' }],
    totalRideMinutes: 12, tags: ['water', 'scenic'],
  },

  {
    id: 'mk-ep-monorail',
    from: 'MK', to: 'EP', name: 'Express Monorail to TTC, EPCOT Monorail to EPCOT',
    legs: [
      { mode: 'monorail_express', from: 'MK', to: 'TTC', rideMinutes: 8, simRange: [1,4], accessible: true, tip: 'Exit at TTC and follow signs to EPCOT Monorail. It\'s a short walk across the platform.' },
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, walkMinutes: 2, tip: 'EPCOT Monorail drops you at the main entrance to EPCOT.' },
    ],
    totalRideMinutes: 22, tags: ['transfer'],
  },
  {
    id: 'mk-ep-minnie',
    from: 'MK', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'EP', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'mk-hs-bus',
    from: 'MK', to: 'HS', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true, tip: 'Bus stop is outside the park gates, Transportation Hub area.' }],
    totalRideMinutes: 25, totalRideRange: [25,40], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'mk-hs-before10',
    from: 'MK', to: 'HS', name: 'Walk to Grand Floridian, Bus to Hollywood Studios (before 10am)',
    legs: [
      { mode: 'walk', from: 'MK', to: 'GF', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Exit MK, walk the scenic path along the lagoon to Grand Floridian. Takes 12 minutes.' },
      { mode: 'bus', from: 'GF', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 0, tip: 'Park-to-park buses do not run before 10am. Grand Floridian resort buses run all day.' },
    ],
    totalRideMinutes: 37, totalRideRange: [37,52], tags: ['before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'mk-hs-minnie',
    from: 'MK', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'HS', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'mk-ak-bus',
    from: 'MK', to: 'AK', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,40], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'mk-ak-before10',
    from: 'MK', to: 'AK', name: 'Walk to Polynesian, Bus to Animal Kingdom (before 10am)',
    legs: [
      { mode: 'walk', from: 'MK', to: 'POLY', rideMinutes: 25, simRange: [0,0], accessible: true, tip: 'Walk via the GF path to Polynesian. It\'s a long 25-minute walk. Consider Minnie Van instead.' },
      { mode: 'bus', from: 'POLY', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 55, totalRideRange: [55,75], tags: ['before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'mk-ak-minnie',
    from: 'MK', to: 'AK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'AK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'mk-ds-via-gf',
    from: 'MK', to: 'DS', name: 'Walk to Grand Floridian, Bus to Disney Springs',
    legs: [
      { mode: 'walk', from: 'MK', to: 'GF', rideMinutes: 12, simRange: [0,0], accessible: true },
      { mode: 'bus', from: 'GF', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0, tip: 'Runs all day, not tied to a specific time.' },
    ],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: ['transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'mk-ds-minnie',
    from: 'MK', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'DS', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'mk-tl-bus',
    from: 'MK', to: 'TL', name: 'Walk to Grand Floridian, Bus to Disney Springs, Bus to Typhoon Lagoon',
    legs: [
      { mode: 'walk', from: 'MK', to: 'GF', rideMinutes: 12, simRange: [0,0], accessible: true },
      { mode: 'bus', from: 'GF', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5, tip: 'Typhoon Lagoon bus departs from Disney Springs bus loop.' },
    ],
    totalRideMinutes: 52, totalRideRange: [52,80], tags: ['transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'mk-tl-minnie',
    from: 'MK', to: 'TL', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'TL', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'mk-bb-minnie',
    from: 'MK', to: 'BB', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'MK', to: 'BB', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'mk-con-walk',
    from: 'MK', to: 'CON', name: 'Walk to Contemporary Resort (~8 min)',
    legs: [{ mode: 'walk', from: 'MK', to: 'CON', rideMinutes: 8, simRange: [0,0], accessible: true, tip: 'Direct sidewalk from MK exits to Contemporary. Always faster than waiting for the monorail.' }],
    totalRideMinutes: 8, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'mk-con-monorail',
    from: 'MK', to: 'CON', name: 'Resort Monorail to Contemporary',
    legs: [{ mode: 'monorail_resort', from: 'MK', to: 'CON', rideMinutes: 3, simRange: [1,5], accessible: true, tip: 'Walking is almost always faster. Skip the wait and just walk the 7–10 min path.' }],
    totalRideMinutes: 3, tags: [],
  },

  {
    id: 'mk-gf-walk',
    from: 'MK', to: 'GF', name: 'Walk to Grand Floridian (~14 min)',
    legs: [{ mode: 'walk', from: 'MK', to: 'GF', rideMinutes: 14, simRange: [0,0], accessible: true, tip: 'Scenic path along Seven Seas Lagoon. Usually faster than any transit option.' }],
    totalRideMinutes: 14, tags: ['walk_only'],
  },
  {
    id: 'mk-gf-watertaxi',
    from: 'MK', to: 'GF', name: 'Gold Flag Water Taxi to Grand Floridian',
    legs: [{ mode: 'water_taxi_gold', from: 'MK', to: 'GF', rideMinutes: 8, simRange: [1,12], accessible: false, tip: 'Boats depart from the MK boat dock. Gold Flag stops at GF then Poly.' }],
    totalRideMinutes: 8, tags: ['water', 'scenic'],
  },

  {
    id: 'mk-poly-walk',
    from: 'MK', to: 'POLY', name: 'Walk to Polynesian Village (~22 min)',
    legs: [{ mode: 'walk', from: 'MK', to: 'POLY', rideMinutes: 22, simRange: [0,0], accessible: true, tip: 'Walk via GF then the path to Poly. Longer walk but no wait.' }],
    totalRideMinutes: 22, tags: ['walk_only'],
  },
  {
    id: 'mk-poly-watertaxi',
    from: 'MK', to: 'POLY', name: 'Gold Flag Water Taxi to Polynesian',
    legs: [{ mode: 'water_taxi_gold', from: 'MK', to: 'POLY', rideMinutes: 15, simRange: [1,12], accessible: false, tip: 'Gold Flag stops at GF first, then continues to Polynesian. About 8 min per stop.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic'],
  },

  {
    id: 'mk-wl-watertaxi',
    from: 'MK', to: 'WL', name: 'Red Flag Water Taxi to Wilderness Lodge',
    legs: [{ mode: 'water_taxi_red', from: 'MK', to: 'WL', rideMinutes: 8, simRange: [1,12], accessible: true, tip: 'Drops off right at the WL boat dock. Scenic, relaxing option.' }],
    totalRideMinutes: 8, tags: ['water', 'scenic'],
  },
  {
    id: 'mk-wl-bus',
    from: 'MK', to: 'WL', name: 'Bus from Magic Kingdom to Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'MK', to: 'WL', rideMinutes: 7, simRange: [1,20], accessible: true, tip: 'Bus drops directly at WL, not TTC. A fast and reliable non-water option.' }],
    totalRideMinutes: 7, totalRideRange: [7,27], tags: ['no_water_alt'],
  },

  {
    id: 'mk-fw-watertaxi',
    from: 'MK', to: 'FW', name: 'Green Flag Water Taxi to Fort Wilderness',
    legs: [{ mode: 'water_taxi_green', from: 'MK', to: 'FW', rideMinutes: 13, simRange: [1,12], accessible: true, tip: 'Takes you to FW marina. From there, take the internal FW bus to your campsite.' }],
    totalRideMinutes: 13, tags: ['water', 'scenic'],
  },
  {
    id: 'mk-fw-bus',
    from: 'MK', to: 'FW', name: 'Bus from Magic Kingdom to Fort Wilderness',
    legs: [{ mode: 'bus', from: 'MK', to: 'FW', rideMinutes: 17, simRange: [1,20], accessible: true, tip: 'Bus to FW Outpost Depot. Take internal FW bus from there to your site. Not TTC.' }],
    totalRideMinutes: 17, totalRideRange: [17,37], tags: ['no_water_alt'],
  },

  {
    id: 'mk-yc-bus',
    from: 'MK', to: 'YC', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'YC', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'mk-bc-bus',
    from: 'MK', to: 'BC', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'BC', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'mk-bwi-bus',
    from: 'MK', to: 'BWI', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'BWI', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'mk-sw-bus',
    from: 'MK', to: 'SW', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'SW', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'mk-do-bus',
    from: 'MK', to: 'DO', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'DO', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'mk-cbr-bus',
    from: 'MK', to: 'CBR', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'CBR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-akl-bus',
    from: 'MK', to: 'AKL', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'AKL', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-cor-bus',
    from: 'MK', to: 'COR', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'COR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-pofq-bus',
    from: 'MK', to: 'POFQ', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'POFQ', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-por-bus',
    from: 'MK', to: 'POR', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'POR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-asmo-bus',
    from: 'MK', to: 'ASMo', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'ASMo', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-asmu-bus',
    from: 'MK', to: 'ASMu', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'ASMu', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-ass-bus',
    from: 'MK', to: 'ASS', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'ASS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-pop-bus',
    from: 'MK', to: 'POP', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'POP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-aoa-bus',
    from: 'MK', to: 'AOA', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'AOA', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-riv-bus',
    from: 'MK', to: 'RIV', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'RIV', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-okw-bus',
    from: 'MK', to: 'OKW', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'OKW', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'mk-ss-bus',
    from: 'MK', to: 'SS', name: 'Bus from Magic Kingdom',
    legs: [{ mode: 'bus', from: 'MK', to: 'SS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: TTC
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'ttc-mk-express',
    from: 'TTC', to: 'MK', name: 'Express Monorail to Magic Kingdom',
    legs: [{ mode: 'monorail_express', from: 'TTC', to: 'MK', rideMinutes: 8, simRange: [1,4], accessible: true, tip: 'Fastest option. Express Monorail boards at TTC upper level.' }],
    totalRideMinutes: 8, tags: [],
  },
  {
    id: 'ttc-mk-ferry',
    from: 'TTC', to: 'MK', name: 'Ferry Boat to Magic Kingdom',
    legs: [{ mode: 'ferry_ttc_mk', from: 'TTC', to: 'MK', rideMinutes: 12, simRange: [1,5], accessible: true, tip: 'Scenic Seven Seas Lagoon ferry. Boards at TTC lower level boat dock.' }],
    totalRideMinutes: 12, tags: ['water', 'scenic'],
  },

  {
    id: 'ttc-ep-monorail',
    from: 'TTC', to: 'EP', name: 'EPCOT Monorail to EPCOT',
    legs: [{ mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, tip: 'Direct non-stop monorail from TTC to EPCOT main entrance.' }],
    totalRideMinutes: 12, tags: [],
  },

  {
    id: 'ttc-poly-walk',
    from: 'TTC', to: 'POLY', name: 'Walk to Polynesian Village (~6 min)',
    legs: [{ mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'Always walk this one. Polynesian is the closest thing to TTC. No monorail needed.' }],
    totalRideMinutes: 6, tags: ['walk_only', 'no_water_alt'],
  },

  {
    id: 'ttc-gf-monorail',
    from: 'TTC', to: 'GF', name: 'Resort Monorail to Grand Floridian',
    legs: [{ mode: 'monorail_resort', from: 'TTC', to: 'GF', rideMinutes: 6, simRange: [1,5], accessible: true, tip: 'Two stops in the correct loop direction: TTC→POLY→GF.' }],
    totalRideMinutes: 6, tags: [],
  },

  {
    id: 'ttc-con-monorail',
    from: 'TTC', to: 'CON', name: 'Resort Monorail to Contemporary',
    legs: [{ mode: 'monorail_resort', from: 'TTC', to: 'CON', rideMinutes: 14, simRange: [1,5], accessible: true, tip: 'Full 4-stop loop: TTC→POLY→GF→MK→CON. Consider Minnie Van if in a hurry.' }],
    totalRideMinutes: 14, tags: [],
  },
  {
    id: 'ttc-con-minnie',
    from: 'TTC', to: 'CON', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TTC', to: 'CON', rideMinutes: 10, simRange: [0,0], accessible: true }],
    totalRideMinutes: 10, tags: [],
  },

  {
    id: 'ttc-hs-via-poly',
    from: 'TTC', to: 'HS', name: 'Walk to Polynesian, Bus to Hollywood Studios',
    legs: [
      { mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'No direct bus from TTC. Walk to Poly (5–8 min) to catch resort buses.' },
      { mode: 'bus', from: 'POLY', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 36, totalRideRange: [36,56], tags: ['transfer'],
  },
  {
    id: 'ttc-ak-via-poly',
    from: 'TTC', to: 'AK', name: 'Walk to Polynesian, Bus to Animal Kingdom',
    legs: [
      { mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'No direct bus from TTC to parks. Walk to Poly first.' },
      { mode: 'bus', from: 'POLY', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 36, totalRideRange: [36,56], tags: ['transfer'],
  },
  {
    id: 'ttc-ds-via-poly',
    from: 'TTC', to: 'DS', name: 'Walk to Polynesian, Bus to Disney Springs',
    legs: [
      { mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true },
      { mode: 'bus', from: 'POLY', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 36, totalRideRange: [36,56], tags: ['transfer'],
  },
  {
    id: 'ttc-ds-minnie',
    from: 'TTC', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TTC', to: 'DS', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ttc-yc-monorail-walk',
    from: 'TTC', to: 'YC', name: 'EPCOT Monorail to EPCOT, walk to Yacht Club',
    legs: [
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, tip: 'Requires EPCOT park access or International Gateway entrance.' },
      { mode: 'walk', from: 'EP', to: 'YC', rideMinutes: 9, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Exit EPCOT via International Gateway (between UK and France). Yacht Club is a 9-min walk.' },
    ],
    totalRideMinutes: 21, tags: ['transfer'],
  },
  {
    id: 'ttc-bwi-monorail-walk',
    from: 'TTC', to: 'BWI', name: 'EPCOT Monorail to EPCOT, walk to BoardWalk Inn',
    legs: [
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'walk', from: 'EP', to: 'BWI', rideMinutes: 6, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Exit via International Gateway. BoardWalk Inn is directly adjacent.' },
    ],
    totalRideMinutes: 18, tags: ['transfer'],
  },
  {
    id: 'ttc-sw-monorail-walk',
    from: 'TTC', to: 'SW', name: 'EPCOT Monorail to EPCOT, walk to Swan',
    legs: [
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'walk', from: 'EP', to: 'SW', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Exit via International Gateway, walk along Crescent Lake path to Swan.' },
    ],
    totalRideMinutes: 24, tags: ['transfer'],
  },
  {
    id: 'ttc-wl-via-mk',
    from: 'TTC', to: 'WL', name: 'Express Monorail to MK, Bus to Wilderness Lodge',
    legs: [
      { mode: 'monorail_express', from: 'TTC', to: 'MK', rideMinutes: 8, simRange: [1,4], accessible: true },
      { mode: 'bus', from: 'MK', to: 'WL', rideMinutes: 7, simRange: [1,20], accessible: true, walkMinutes: 3, tip: 'Exit MK, go to Transportation Hub, take WL bus. Drops at WL gates directly.' },
    ],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: ['transfer'],
  },
  {
    id: 'ttc-fw-via-mk',
    from: 'TTC', to: 'FW', name: 'Express Monorail to MK, Bus to Fort Wilderness',
    legs: [
      { mode: 'monorail_express', from: 'TTC', to: 'MK', rideMinutes: 8, simRange: [1,4], accessible: true },
      { mode: 'bus', from: 'MK', to: 'FW', rideMinutes: 17, simRange: [1,20], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['transfer'],
  },
  {
    id: 'ttc-cbr-via-poly',
    from: 'TTC', to: 'CBR', name: 'Walk to Polynesian, Bus to Caribbean Beach',
    legs: [
      { mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true },
      { mode: 'bus', from: 'POLY', to: 'CBR', rideMinutes: 35, simRange: [1,20], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 41, totalRideRange: [41,61], tags: ['transfer'],
  },
  {
    id: 'ttc-minnie',
    from: 'TTC', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TTC', to: 'HS', rideMinutes: 25, simRange: [0,0], accessible: true }],
    totalRideMinutes: 25, tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: EPCOT (EP)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'ep-ttc-monorail',
    from: 'EP', to: 'TTC', name: 'EPCOT Monorail to TTC',
    legs: [{ mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true }],
    totalRideMinutes: 12, tags: [],
  },

  {
    id: 'ep-mk-monorail',
    from: 'EP', to: 'MK', name: 'EPCOT Monorail to TTC, Express Monorail to Magic Kingdom',
    legs: [
      { mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true, tip: 'Transfer at TTC, a short walk between monorail platforms.' },
      { mode: 'monorail_express', from: 'TTC', to: 'MK', rideMinutes: 8, simRange: [1,4], accessible: true, walkMinutes: 2 },
    ],
    totalRideMinutes: 22, tags: ['transfer'],
  },
  {
    id: 'ep-mk-monorail-ferry',
    from: 'EP', to: 'MK', name: 'EPCOT Monorail to TTC, Ferry to Magic Kingdom',
    legs: [
      { mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'ferry_ttc_mk', from: 'TTC', to: 'MK', rideMinutes: 12, simRange: [1,5], accessible: true, walkMinutes: 3, tip: 'Scenic ferry option. Boards at TTC boat dock.' },
    ],
    totalRideMinutes: 27, tags: ['water', 'transfer', 'scenic'],
  },
  {
    id: 'ep-mk-minnie',
    from: 'EP', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'MK', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ep-hs-skyliner',
    from: 'EP', to: 'HS', name: 'Skyliner to Caribbean Beach, transfer to Hollywood Studios',
    legs: [
      { mode: 'skyliner', from: 'EP', to: 'CBR', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Board at EPCOT International Gateway (between UK and France pavilions).' },
      { mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3, tip: 'Short walk between Skyliner lines at Caribbean Beach hub.' },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },
  {
    id: 'ep-hs-friendship',
    from: 'EP', to: 'HS', name: 'Friendship Boat: full Crescent Lake route',
    legs: [{ mode: 'friendship_boat', from: 'EP', to: 'HS', rideMinutes: 35, simRange: [1,12], accessible: true, tip: 'Longest but most scenic option. Stops at BWI, YC/BC, Swan/Dolphin before HS.' }],
    totalRideMinutes: 35, tags: ['water', 'scenic'],
  },
  {
    id: 'ep-hs-bus',
    from: 'EP', to: 'HS', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true, tip: 'Skyliner via Caribbean Beach is usually faster. This is the backup Disney transit option.' }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'ep-hs-minnie',
    from: 'EP', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'HS', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: [],
  },

  {
    id: 'ep-ak-bus',
    from: 'EP', to: 'AK', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'ep-ak-before10',
    from: 'EP', to: 'AK', name: 'Friendship Boat to BoardWalk Inn, Bus to Animal Kingdom (before 10am)',
    legs: [
      { mode: 'friendship_boat', from: 'EP', to: 'BWI', rideMinutes: 10, simRange: [1,12], accessible: true, tip: 'Board at EPCOT International Gateway boat dock.' },
      { mode: 'bus', from: 'BWI', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5, tip: 'Park-to-park buses don\'t run before 10am. BoardWalk Inn resort bus runs all day.' },
    ],
    totalRideMinutes: 40, totalRideRange: [40,62], tags: ['water', 'before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'ep-ak-minnie',
    from: 'EP', to: 'AK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'AK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ep-ds-before4',
    from: 'EP', to: 'DS', name: 'Friendship Boat to BoardWalk Inn, Bus to Disney Springs',
    legs: [
      { mode: 'friendship_boat', from: 'EP', to: 'BWI', rideMinutes: 10, simRange: [1,12], accessible: true },
      { mode: 'bus', from: 'BWI', to: 'DS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 35, totalRideRange: [35,57], tags: ['water', 'transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'ep-ds-minnie',
    from: 'EP', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'DS', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ep-tl-bus',
    from: 'EP', to: 'TL', name: 'Friendship Boat to BoardWalk Inn, Bus to Disney Springs, Bus to Typhoon Lagoon',
    legs: [
      { mode: 'friendship_boat', from: 'EP', to: 'BWI', rideMinutes: 10, simRange: [1,12], accessible: true },
      { mode: 'bus', from: 'BWI', to: 'DS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 45, totalRideRange: [45,70], tags: ['water', 'transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'ep-tl-minnie',
    from: 'EP', to: 'TL', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'TL', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ep-bb-bus',
    from: 'EP', to: 'BB', name: 'Bus to Animal Kingdom, then Bus to Blizzard Beach',
    legs: [
      { mode: 'bus', from: 'EP', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 45, totalRideRange: [45,70], tags: ['transfer'],
  },
  {
    id: 'ep-bb-minnie',
    from: 'EP', to: 'BB', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'BB', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ep-bwi-walk',
    from: 'EP', to: 'BWI', name: 'Walk via International Gateway (~6 min)',
    legs: [{ mode: 'walk', from: 'EP', to: 'BWI', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'Exit EPCOT via International Gateway (between UK and France). BoardWalk Inn is immediately adjacent.' }],
    totalRideMinutes: 6, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'ep-bwi-boat',
    from: 'EP', to: 'BWI', name: 'Friendship Boat to BoardWalk Inn',
    legs: [{ mode: 'friendship_boat', from: 'EP', to: 'BWI', rideMinutes: 10, simRange: [1,12], accessible: true, tip: 'Walking is faster, the boat makes several stops.' }],
    totalRideMinutes: 10, tags: ['water', 'scenic'],
  },

  {
    id: 'ep-yc-walk',
    from: 'EP', to: 'YC', name: 'Walk via International Gateway (~9 min)',
    legs: [{ mode: 'walk', from: 'EP', to: 'YC', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Exit via International Gateway, walk along Crescent Lake. Fastest option.' }],
    totalRideMinutes: 9, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'ep-yc-boat',
    from: 'EP', to: 'YC', name: 'Friendship Boat to Yacht Club',
    legs: [{ mode: 'friendship_boat', from: 'EP', to: 'YC', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Stops at BWI first, then YC/BC. Walking is faster.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'ep-bc-walk',
    from: 'EP', to: 'BC', name: 'Walk via International Gateway (~9 min)',
    legs: [{ mode: 'walk', from: 'EP', to: 'BC', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Exit via International Gateway. Beach Club is right there.' }],
    totalRideMinutes: 9, tags: ['walk_only', 'no_water_alt'],
  },

  {
    id: 'ep-sw-walk',
    from: 'EP', to: 'SW', name: 'Walk via International Gateway (~12 min)',
    legs: [{ mode: 'walk', from: 'EP', to: 'SW', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Exit via International Gateway, walk along Crescent Lake path.' }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'ep-do-walk',
    from: 'EP', to: 'DO', name: 'Walk via International Gateway (~12 min)',
    legs: [{ mode: 'walk', from: 'EP', to: 'DO', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },

  {
    id: 'ep-cbr-skyliner',
    from: 'EP', to: 'CBR', name: 'Skyliner to Caribbean Beach Resort',
    legs: [{ mode: 'skyliner', from: 'EP', to: 'CBR', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Board at International Gateway station. Direct to CBR (passes Riviera but no stop needed).' }],
    totalRideMinutes: 12, tags: ['scenic'],
  },

  {
    id: 'ep-riv-skyliner',
    from: 'EP', to: 'RIV', name: 'Skyliner to Riviera Resort',
    legs: [{ mode: 'skyliner', from: 'EP', to: 'RIV', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Board at International Gateway. Riviera is the first Skyliner stop from EPCOT.' }],
    totalRideMinutes: 9, tags: ['scenic'],
  },

  {
    id: 'ep-pop-skyliner',
    from: 'EP', to: 'POP', name: 'Skyliner to Caribbean Beach, transfer to Pop Century',
    legs: [
      { mode: 'skyliner', from: 'EP', to: 'CBR', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Board at International Gateway station.' },
      { mode: 'skyliner', from: 'CBR', to: 'POP', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3, tip: 'Short transfer at Caribbean Beach hub.' },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },
  {
    id: 'ep-aoa-skyliner',
    from: 'EP', to: 'AOA', name: 'Skyliner to Caribbean Beach, transfer to Art of Animation',
    legs: [
      { mode: 'skyliner', from: 'EP', to: 'CBR', rideMinutes: 12, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'AOA', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },

  {
    id: 'ep-poly-walk',
    from: 'EP', to: 'POLY', name: 'EPCOT Monorail to TTC, walk to Polynesian',
    legs: [
      { mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'walk', from: 'TTC', to: 'POLY', rideMinutes: 6, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Do NOT take Resort Monorail. Poly is right next to TTC. Just walk 5–8 min.' },
    ],
    totalRideMinutes: 18, tags: ['transfer'],
  },
  {
    id: 'ep-gf-monorail',
    from: 'EP', to: 'GF', name: 'EPCOT Monorail to TTC, Resort Monorail to Grand Floridian',
    legs: [
      { mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'monorail_resort', from: 'TTC', to: 'GF', rideMinutes: 6, simRange: [1,5], accessible: true, walkMinutes: 2, tip: 'Resort Monorail: TTC→POLY→GF. Two stops in correct loop direction.' },
    ],
    totalRideMinutes: 20, tags: ['transfer'],
  },
  {
    id: 'ep-con-monorail',
    from: 'EP', to: 'CON', name: 'EPCOT Monorail to TTC, Resort Monorail to Contemporary',
    legs: [
      { mode: 'monorail_epcot', from: 'EP', to: 'TTC', rideMinutes: 12, simRange: [1,10], accessible: true },
      { mode: 'monorail_resort', from: 'TTC', to: 'CON', rideMinutes: 14, simRange: [1,5], accessible: true, walkMinutes: 2, tip: 'Four stops in correct direction: TTC→POLY→GF→MK→CON.' },
    ],
    totalRideMinutes: 28, tags: ['transfer'],
  },
  {
    id: 'ep-con-minnie',
    from: 'EP', to: 'CON', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'EP', to: 'CON', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },
  {
    id: 'ep-wl-bus',
    from: 'EP', to: 'WL', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'WL', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'ep-fw-bus',
    from: 'EP', to: 'FW', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'FW', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'ep-akl-bus',
    from: 'EP', to: 'AKL', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'AKL', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-cor-bus',
    from: 'EP', to: 'COR', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'COR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-pofq-bus',
    from: 'EP', to: 'POFQ', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'POFQ', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-por-bus',
    from: 'EP', to: 'POR', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'POR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-asso-bus',
    from: 'EP', to: 'ASMo', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'ASMo', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-pop-bus',
    from: 'EP', to: 'POP', name: 'Bus from EPCOT (alternative)',
    legs: [{ mode: 'bus', from: 'EP', to: 'POP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-okw-bus',
    from: 'EP', to: 'OKW', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'OKW', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ep-ss-bus',
    from: 'EP', to: 'SS', name: 'Bus from EPCOT',
    legs: [{ mode: 'bus', from: 'EP', to: 'SS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: HOLLYWOOD STUDIOS (HS)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'hs-ep-skyliner',
    from: 'HS', to: 'EP', name: 'Skyliner to Caribbean Beach, transfer to EPCOT',
    legs: [
      { mode: 'skyliner', from: 'HS', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true, tip: 'Board at Hollywood Studios Skyliner station near the park entrance.' },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 3, tip: 'Transfer at Caribbean Beach hub. Follow signs to the EPCOT line. Drops at International Gateway.' },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },
  {
    id: 'hs-ep-friendship',
    from: 'HS', to: 'EP', name: 'Friendship Boat: full Crescent Lake route',
    legs: [{ mode: 'friendship_boat', from: 'HS', to: 'EP', rideMinutes: 35, simRange: [1,12], accessible: true, tip: 'Stops at SW/DO, YC/BC, BWI before EPCOT International Gateway. Scenic but slow.' }],
    totalRideMinutes: 35, tags: ['water', 'scenic'],
  },
  {
    id: 'hs-ep-bus',
    from: 'HS', to: 'EP', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'EP', rideMinutes: 25, simRange: [1,20], accessible: true, tip: 'Skyliner via Caribbean Beach is usually faster. This is the backup Disney transit option.' }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'hs-ep-minnie',
    from: 'HS', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: [],
  },

  {
    id: 'hs-mk-bus',
    from: 'HS', to: 'MK', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'MK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'hs-mk-before10',
    from: 'HS', to: 'MK', name: 'Friendship Boat to BoardWalk Inn, Bus to Magic Kingdom (before 10am)',
    legs: [
      { mode: 'friendship_boat', from: 'HS', to: 'BWI', rideMinutes: 15, simRange: [1,12], accessible: true, tip: 'Board Friendship Boat at Hollywood Studios dock. Stops at SW/DO first, then BWI.' },
      { mode: 'bus', from: 'BWI', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 45, totalRideRange: [45,67], tags: ['water', 'before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'hs-mk-minnie',
    from: 'HS', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'MK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'hs-ak-bus',
    from: 'HS', to: 'AK', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'hs-ak-before10',
    from: 'HS', to: 'AK', name: 'Friendship Boat to BoardWalk Inn, Bus to Animal Kingdom (before 10am)',
    legs: [
      { mode: 'friendship_boat', from: 'HS', to: 'BWI', rideMinutes: 15, simRange: [1,12], accessible: true },
      { mode: 'bus', from: 'BWI', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 45, totalRideRange: [45,67], tags: ['water', 'before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'hs-ak-minnie',
    from: 'HS', to: 'AK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'AK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'hs-ds-before4',
    from: 'HS', to: 'DS', name: 'Friendship Boat to BoardWalk Inn, Bus to Disney Springs',
    legs: [
      { mode: 'friendship_boat', from: 'HS', to: 'BWI', rideMinutes: 15, simRange: [1,12], accessible: true },
      { mode: 'bus', from: 'BWI', to: 'DS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,62], tags: ['water', 'transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'hs-ds-minnie',
    from: 'HS', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'DS', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'hs-tl-bus',
    from: 'HS', to: 'TL', name: 'Friendship Boat to BoardWalk Inn, Bus to Disney Springs, Bus to Typhoon Lagoon',
    legs: [
      { mode: 'friendship_boat', from: 'HS', to: 'BWI', rideMinutes: 15, simRange: [1,12], accessible: true },
      { mode: 'bus', from: 'BWI', to: 'DS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 50, totalRideRange: [50,75], tags: ['water', 'transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'hs-tl-minnie',
    from: 'HS', to: 'TL', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'TL', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'hs-bb-bus',
    from: 'HS', to: 'BB', name: 'Bus to Animal Kingdom, transfer to Blizzard Beach',
    legs: [
      { mode: 'bus', from: 'HS', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
  },
  {
    id: 'hs-bb-minnie',
    from: 'HS', to: 'BB', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'HS', to: 'BB', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'hs-bwi-walk',
    from: 'HS', to: 'BWI', name: 'Walk via BoardWalk path (~18 min)',
    legs: [{ mode: 'walk', from: 'HS', to: 'BWI', rideMinutes: 18, simRange: [0,0], accessible: true, tip: 'Direct path along the BoardWalk. Pass Swan/Dolphin area heading toward BWI.' }],
    totalRideMinutes: 18, tags: ['walk_only'],
  },
  {
    id: 'hs-bwi-boat',
    from: 'HS', to: 'BWI', name: 'Friendship Boat to BoardWalk Inn',
    legs: [{ mode: 'friendship_boat', from: 'HS', to: 'BWI', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Stops at SW/DO before BWI.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },

  {
    id: 'hs-yc-walk',
    from: 'HS', to: 'YC', name: 'Walk via BoardWalk path (~22 min)',
    legs: [{ mode: 'walk', from: 'HS', to: 'YC', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: ['walk_only'],
  },
  {
    id: 'hs-yc-boat',
    from: 'HS', to: 'YC', name: 'Friendship Boat to Yacht Club',
    legs: [{ mode: 'friendship_boat', from: 'HS', to: 'YC', rideMinutes: 17, simRange: [1,12], accessible: true, tip: 'First stop after SW/DO from Hollywood Studios direction.' }],
    totalRideMinutes: 17, tags: ['water', 'scenic'],
  },

  {
    id: 'hs-sw-walk',
    from: 'HS', to: 'SW', name: 'Walk to Swan (~11 min)',
    legs: [{ mode: 'walk', from: 'HS', to: 'SW', rideMinutes: 11, simRange: [0,0], accessible: true, tip: 'Most direct walk from HS entrance. Cross the bridge toward Swan.' }],
    totalRideMinutes: 11, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'hs-sw-boat',
    from: 'HS', to: 'SW', name: 'Friendship Boat to Swan',
    legs: [{ mode: 'friendship_boat', from: 'HS', to: 'SW', rideMinutes: 10, simRange: [1,12], accessible: true, tip: 'First Friendship Boat stop from HS.' }],
    totalRideMinutes: 10, tags: ['water', 'scenic'],
  },
  {
    id: 'hs-do-walk',
    from: 'HS', to: 'DO', name: 'Walk to Dolphin (~11 min)',
    legs: [{ mode: 'walk', from: 'HS', to: 'DO', rideMinutes: 11, simRange: [0,0], accessible: true }],
    totalRideMinutes: 11, tags: ['walk_only', 'no_water_alt'],
  },

  {
    id: 'hs-cbr-skyliner',
    from: 'HS', to: 'CBR', name: 'Skyliner to Caribbean Beach Resort',
    legs: [{ mode: 'skyliner', from: 'HS', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true, tip: 'Direct Skyliner from HS station. Fastest option to CBR.' }],
    totalRideMinutes: 5, tags: ['scenic'],
  },
  {
    id: 'hs-riv-skyliner',
    from: 'HS', to: 'RIV', name: 'Skyliner to Caribbean Beach, transfer to Riviera',
    legs: [
      { mode: 'skyliner', from: 'HS', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'RIV', rideMinutes: 4, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 9, tags: ['transfer', 'scenic'],
  },
  {
    id: 'hs-pop-skyliner',
    from: 'HS', to: 'POP', name: 'Skyliner to Caribbean Beach, transfer to Pop Century',
    legs: [
      { mode: 'skyliner', from: 'HS', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'POP', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 10, tags: ['transfer', 'scenic'],
  },
  {
    id: 'hs-aoa-skyliner',
    from: 'HS', to: 'AOA', name: 'Skyliner to Caribbean Beach, transfer to Art of Animation',
    legs: [
      { mode: 'skyliner', from: 'HS', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'AOA', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 10, tags: ['transfer', 'scenic'],
  },
  {
    id: 'hs-con-bus',
    from: 'HS', to: 'CON', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'CON', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'hs-gf-bus',
    from: 'HS', to: 'GF', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'GF', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'hs-poly-bus',
    from: 'HS', to: 'POLY', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'POLY', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'hs-wl-bus',
    from: 'HS', to: 'WL', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'WL', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'hs-fw-bus',
    from: 'HS', to: 'FW', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'FW', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'hs-akl-bus',
    from: 'HS', to: 'AKL', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'AKL', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-cor-bus',
    from: 'HS', to: 'COR', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'COR', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-pofq-bus',
    from: 'HS', to: 'POFQ', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'POFQ', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-por-bus',
    from: 'HS', to: 'POR', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'POR', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-asmo-bus',
    from: 'HS', to: 'ASMo', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'ASMo', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-asmu-bus',
    from: 'HS', to: 'ASMu', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'ASMu', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-ass-bus',
    from: 'HS', to: 'ASS', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'ASS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-okw-bus',
    from: 'HS', to: 'OKW', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'OKW', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-ss-bus',
    from: 'HS', to: 'SS', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'SS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'hs-bc-bus',
    from: 'HS', to: 'BC', name: 'Bus from Hollywood Studios',
    legs: [{ mode: 'bus', from: 'HS', to: 'BC', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: ANIMAL KINGDOM (AK)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'ak-mk-bus',
    from: 'AK', to: 'MK', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'MK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'ak-mk-before10',
    from: 'AK', to: 'MK', name: 'Bus to Animal Kingdom Lodge, Bus to Magic Kingdom (before 10am)',
    legs: [
      { mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true, tip: 'Shortest hop from AK before park-to-park buses start at 10am.' },
      { mode: 'bus', from: 'AKL', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'ak-mk-minnie',
    from: 'AK', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'AK', to: 'MK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ak-ep-bus',
    from: 'AK', to: 'EP', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'ak-ep-before10',
    from: 'AK', to: 'EP', name: 'Bus to Animal Kingdom Lodge, Bus to EPCOT (before 10am)',
    legs: [
      { mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AKL', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'ak-ep-minnie',
    from: 'AK', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'AK', to: 'EP', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ak-hs-bus',
    from: 'AK', to: 'HS', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['time_restricted'],
    timeRestriction: 'after_10am',
    notes: 'Park-to-park buses run from 10am until about 1 hour after the later park\'s closing time (varies daily).',
  },
  {
    id: 'ak-hs-before10',
    from: 'AK', to: 'HS', name: 'Bus to Animal Kingdom Lodge, Bus to Hollywood Studios (before 10am)',
    legs: [
      { mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AKL', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['before_10am_only', 'transfer', 'time_restricted'],
    timeRestriction: 'before_10am',
  },
  {
    id: 'ak-hs-minnie',
    from: 'AK', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'AK', to: 'HS', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ak-ds-before4',
    from: 'AK', to: 'DS', name: 'Bus to Animal Kingdom Lodge, Bus to Disney Springs',
    legs: [
      { mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AKL', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'ak-ds-minnie',
    from: 'AK', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'AK', to: 'DS', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ak-bb-bus',
    from: 'AK', to: 'BB', name: 'Bus from Animal Kingdom direct to Blizzard Beach',
    legs: [{ mode: 'bus', from: 'AK', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, tip: 'Very close, direct bus. Most convenient water park access from AK.' }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },

  {
    id: 'ak-tl-bus',
    from: 'AK', to: 'TL', name: 'Bus to Animal Kingdom Lodge, Bus to Disney Springs, Bus to Typhoon Lagoon',
    legs: [
      { mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AKL', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 50, totalRideRange: [50,80], tags: ['transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'ak-tl-minnie',
    from: 'AK', to: 'TL', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'AK', to: 'TL', rideMinutes: 25, simRange: [0,0], accessible: true }],
    totalRideMinutes: 25, tags: [],
  },

  {
    id: 'ak-akl-bus',
    from: 'AK', to: 'AKL', name: 'Bus from Animal Kingdom to AK Lodge',
    legs: [{ mode: 'bus', from: 'AK', to: 'AKL', rideMinutes: 10, simRange: [1,20], accessible: true, tip: 'Short hop. Bus shared with Kidani Village.' }],
    totalRideMinutes: 10, totalRideRange: [10,30], tags: [],
  },

  {
    id: 'ak-cor-bus',
    from: 'AK', to: 'COR', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'COR', rideMinutes: 22, simRange: [1,20], accessible: true }],
    totalRideMinutes: 22, totalRideRange: [22,42], tags: [],
  },
  {
    id: 'ak-asmo-bus',
    from: 'AK', to: 'ASMo', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'ASMo', rideMinutes: 22, simRange: [1,20], accessible: true }],
    totalRideMinutes: 22, totalRideRange: [22,42], tags: [],
  },
  {
    id: 'ak-cbr-bus',
    from: 'AK', to: 'CBR', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'CBR', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'ak-pop-bus',
    from: 'AK', to: 'POP', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'POP', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'ak-yc-bus',
    from: 'AK', to: 'YC', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'YC', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'ak-con-bus',
    from: 'AK', to: 'CON', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'CON', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'ak-pofq-bus',
    from: 'AK', to: 'POFQ', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'POFQ', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },
  {
    id: 'ak-okw-bus',
    from: 'AK', to: 'OKW', name: 'Bus from Animal Kingdom',
    legs: [{ mode: 'bus', from: 'AK', to: 'OKW', rideMinutes: 37, simRange: [1,20], accessible: true }],
    totalRideMinutes: 37, totalRideRange: [37,57], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: DISNEY SPRINGS (DS)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'ds-mk-minnie',
    from: 'DS', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'MK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ds-ep-skyliner',
    from: 'DS', to: 'EP', name: 'Bus to Caribbean Beach, Skyliner to EPCOT',
    legs: [
      { mode: 'bus', from: 'DS', to: 'CBR', rideMinutes: 20, simRange: [1,20], accessible: true, tip: 'No direct bus to EPCOT from DS. CBR Skyliner is the smartest connection.' },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 5, tip: 'Skyliner drops at EPCOT International Gateway.' },
    ],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: ['transfer', 'scenic'],
  },
  {
    id: 'ds-ep-minnie',
    from: 'DS', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'EP', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ds-hs-skyliner',
    from: 'DS', to: 'HS', name: 'Bus to Caribbean Beach, Skyliner to Hollywood Studios',
    legs: [
      { mode: 'bus', from: 'DS', to: 'CBR', rideMinutes: 20, simRange: [1,20], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 5, tip: 'Skyliner drops at HS entrance. Very efficient connection.' },
    ],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: ['transfer', 'scenic'],
  },
  {
    id: 'ds-hs-minnie',
    from: 'DS', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'HS', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ds-ak-via-cor',
    from: 'DS', to: 'AK', name: 'Bus to Coronado Springs, Bus to Animal Kingdom',
    legs: [
      { mode: 'bus', from: 'DS', to: 'COR', rideMinutes: 20, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'COR', to: 'AK', rideMinutes: 20, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
  },
  {
    id: 'ds-ak-minnie',
    from: 'DS', to: 'AK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'AK', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },

  {
    id: 'ds-tl-bus',
    from: 'DS', to: 'TL', name: 'Bus from Disney Springs to Typhoon Lagoon',
    legs: [{ mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, tip: 'Most direct water park connection from Disney Springs.' }],
    totalRideMinutes: 10, totalRideRange: [10,30], tags: [],
  },

  {
    id: 'ds-bb-via-akl',
    from: 'DS', to: 'BB', name: 'Bus to AKL area, Bus to Blizzard Beach',
    legs: [
      { mode: 'bus', from: 'DS', to: 'AKL', rideMinutes: 25, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AKL', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
  },
  {
    id: 'ds-bb-minnie',
    from: 'DS', to: 'BB', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'BB', rideMinutes: 15, simRange: [0,0], accessible: true }],
    totalRideMinutes: 15, tags: [],
  },

  {
    id: 'ds-pofq-sassagoula',
    from: 'DS', to: 'POFQ', name: 'Sassagoula River Cruise to Port Orleans French Quarter',
    legs: [{ mode: 'sassagoula_boat', from: 'DS', to: 'POFQ', rideMinutes: 15, simRange: [1,12], accessible: true, tip: 'Purple flag boat. Scenic river cruise, slower than bus but relaxing.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic'],
  },
  {
    id: 'ds-pofq-bus',
    from: 'DS', to: 'POFQ', name: 'Bus from Disney Springs to Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'DS', to: 'POFQ', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },

  {
    id: 'ds-por-sassagoula',
    from: 'DS', to: 'POR', name: 'Sassagoula River Cruise to Port Orleans Riverside',
    legs: [{ mode: 'sassagoula_boat', from: 'DS', to: 'POR', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Yellow flag boat. Stops at POFQ first, then Riverside. Scenic option.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'ds-por-bus',
    from: 'DS', to: 'POR', name: 'Bus from Disney Springs to Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'DS', to: 'POR', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },

  {
    id: 'ds-okw-sassagoula',
    from: 'DS', to: 'OKW', name: 'Sassagoula River Cruise to Old Key West',
    legs: [{ mode: 'sassagoula_boat', from: 'DS', to: 'OKW', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Green flag boat. Scenic route through the Sassagoula waterway.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'ds-okw-bus',
    from: 'DS', to: 'OKW', name: 'Bus from Disney Springs to Old Key West',
    legs: [{ mode: 'bus', from: 'DS', to: 'OKW', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },

  {
    id: 'ds-ss-sassagoula',
    from: 'DS', to: 'SS', name: 'Sassagoula River Cruise to Saratoga Springs',
    legs: [{ mode: 'sassagoula_boat', from: 'DS', to: 'SS', rideMinutes: 15, simRange: [1,12], accessible: true, tip: 'Blue flag, shortest Sassagoula run. SS is right next to DS.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic'],
  },
  {
    id: 'ds-ss-walk',
    from: 'DS', to: 'SS', name: 'Walk to Saratoga Springs (~17 min)',
    legs: [{ mode: 'walk', from: 'DS', to: 'SS', rideMinutes: 17, simRange: [0,0], accessible: true, tip: 'Saratoga Springs is adjacent to Disney Springs. Easy walk.' }],
    totalRideMinutes: 17, tags: ['walk_only'],
  },
  {
    id: 'ds-ss-bus',
    from: 'DS', to: 'SS', name: 'Bus from Disney Springs to Saratoga Springs',
    legs: [{ mode: 'bus', from: 'DS', to: 'SS', rideMinutes: 15, simRange: [1,20], accessible: true }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },

  {
    id: 'ds-cbr-bus',
    from: 'DS', to: 'CBR', name: 'Bus from Disney Springs',
    legs: [{ mode: 'bus', from: 'DS', to: 'CBR', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'ds-con-bus',
    from: 'DS', to: 'CON', name: 'Bus from Disney Springs',
    legs: [{ mode: 'bus', from: 'DS', to: 'CON', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'ds-akl-bus',
    from: 'DS', to: 'AKL', name: 'Bus from Disney Springs',
    legs: [{ mode: 'bus', from: 'DS', to: 'AKL', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'ds-ttc-minnie',
    from: 'DS', to: 'TTC', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'DS', to: 'TTC', rideMinutes: 20, simRange: [0,0], accessible: true, tip: 'No good Disney transit route from DS to TTC. Rideshare is best.' }],
    totalRideMinutes: 20, tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: TYPHOON LAGOON (TL)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'tl-ds-bus',
    from: 'TL', to: 'DS', name: 'Bus from Typhoon Lagoon to Disney Springs',
    legs: [{ mode: 'bus', from: 'TL', to: 'DS', rideMinutes: 10, simRange: [1,20], accessible: true, tip: 'Quick hop. All TL connections go through Disney Springs.' }],
    totalRideMinutes: 10, totalRideRange: [10,30], tags: [],
  },
  {
    id: 'tl-mk-via-ds',
    from: 'TL', to: 'MK', name: 'Bus to Disney Springs, Bus to Grand Floridian, Walk to Magic Kingdom',
    legs: [
      { mode: 'bus', from: 'TL', to: 'DS', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'DS', to: 'GF', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 0 },
      { mode: 'walk', from: 'GF', to: 'MK', rideMinutes: 12, simRange: [0,0], accessible: true },
    ],
    totalRideMinutes: 52, totalRideRange: [52,80], tags: ['transfer'],
    notes: 'Disney Springs bus access is limited to resort guests, or guests with a park or dining reservation there.',
  },
  {
    id: 'tl-mk-minnie',
    from: 'TL', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TL', to: 'MK', rideMinutes: 25, simRange: [0,0], accessible: true, tip: 'Strongly recommended. Disney transit to MK from TL is very slow (multiple transfers).' }],
    totalRideMinutes: 25, tags: [],
  },
  {
    id: 'tl-ep-via-ds-cbr',
    from: 'TL', to: 'EP', name: 'Bus to Disney Springs, Bus to Caribbean Beach, Skyliner to EPCOT',
    legs: [
      { mode: 'bus', from: 'TL', to: 'DS', rideMinutes: 10, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'DS', to: 'CBR', rideMinutes: 20, simRange: [1,20], accessible: true, walkMinutes: 5 },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 42, totalRideRange: [42,72], tags: ['transfer', 'scenic'],
  },
  {
    id: 'tl-ep-minnie',
    from: 'TL', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TL', to: 'EP', rideMinutes: 20, simRange: [0,0], accessible: true }],
    totalRideMinutes: 20, tags: [],
  },
  {
    id: 'tl-bb-minnie',
    from: 'TL', to: 'BB', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'TL', to: 'BB', rideMinutes: 20, simRange: [0,0], accessible: true, tip: 'No direct Disney bus between water parks. Minnie Van is the only practical option.' }],
    totalRideMinutes: 20, tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: BLIZZARD BEACH (BB)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'bb-ak-bus',
    from: 'BB', to: 'AK', name: 'Bus from Blizzard Beach to Animal Kingdom',
    legs: [{ mode: 'bus', from: 'BB', to: 'AK', rideMinutes: 15, simRange: [1,20], accessible: true, tip: 'Direct bus. AK is very close to Blizzard Beach.' }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },
  {
    id: 'bb-mk-via-ak',
    from: 'BB', to: 'MK', name: 'Bus to Animal Kingdom, Bus to Magic Kingdom',
    legs: [
      { mode: 'bus', from: 'BB', to: 'AK', rideMinutes: 15, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'MK', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
  },
  {
    id: 'bb-mk-minnie',
    from: 'BB', to: 'MK', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'BB', to: 'MK', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: [],
  },
  {
    id: 'bb-ep-via-ak',
    from: 'BB', to: 'EP', name: 'Bus to Animal Kingdom, Bus to EPCOT',
    legs: [
      { mode: 'bus', from: 'BB', to: 'AK', rideMinutes: 15, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 45, totalRideRange: [45,70], tags: ['transfer'],
  },
  {
    id: 'bb-ep-minnie',
    from: 'BB', to: 'EP', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'BB', to: 'EP', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: [],
  },
  {
    id: 'bb-hs-via-ak',
    from: 'BB', to: 'HS', name: 'Bus to Animal Kingdom, Bus to Hollywood Studios',
    legs: [
      { mode: 'bus', from: 'BB', to: 'AK', rideMinutes: 15, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 40, totalRideRange: [40,65], tags: ['transfer'],
  },
  {
    id: 'bb-hs-minnie',
    from: 'BB', to: 'HS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'BB', to: 'HS', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: [],
  },
  {
    id: 'bb-ds-minnie',
    from: 'BB', to: 'DS', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'BB', to: 'DS', rideMinutes: 15, simRange: [0,0], accessible: true, tip: 'No clean Disney transit route from BB to DS. Rideshare recommended.' }],
    totalRideMinutes: 15, tags: [],
  },
  {
    id: 'bb-tl-minnie',
    from: 'BB', to: 'TL', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'BB', to: 'TL', rideMinutes: 20, simRange: [0,0], accessible: true, tip: 'No direct Disney bus between water parks.' }],
    totalRideMinutes: 20, tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: BOARDWALK INN (BWI)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'bwi-ep-walk',
    from: 'BWI', to: 'EP', name: 'Walk via International Gateway (~6 min)',
    legs: [{ mode: 'walk', from: 'BWI', to: 'EP', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'Fastest option. BoardWalk Inn is right next to EPCOT\'s International Gateway entrance.' }],
    totalRideMinutes: 6, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'bwi-ep-boat',
    from: 'BWI', to: 'EP', name: 'Friendship Boat to EPCOT',
    legs: [{ mode: 'friendship_boat', from: 'BWI', to: 'EP', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Stops at YC/BC, SW/DO before reaching EPCOT IG. Walking is faster.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'bwi-hs-walk',
    from: 'BWI', to: 'HS', name: 'Walk via BoardWalk path (~18 min)',
    legs: [{ mode: 'walk', from: 'BWI', to: 'HS', rideMinutes: 18, simRange: [0,0], accessible: true, tip: 'Walk along BoardWalk past Swan/Dolphin area toward HS.' }],
    totalRideMinutes: 18, tags: ['walk_only'],
  },
  {
    id: 'bwi-hs-boat',
    from: 'BWI', to: 'HS', name: 'Friendship Boat to Hollywood Studios',
    legs: [{ mode: 'friendship_boat', from: 'BWI', to: 'HS', rideMinutes: 27, simRange: [1,12], accessible: true, tip: 'Goes BWI→SW/DO→HS. Walk is usually faster.' }],
    totalRideMinutes: 27, tags: ['water', 'scenic'],
  },
  {
    id: 'bwi-mk-bus',
    from: 'BWI', to: 'MK', name: 'Bus from BoardWalk Inn',
    legs: [{ mode: 'bus', from: 'BWI', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'bwi-ak-bus',
    from: 'BWI', to: 'AK', name: 'Bus from BoardWalk Inn',
    legs: [{ mode: 'bus', from: 'BWI', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'bwi-ds-bus',
    from: 'BWI', to: 'DS', name: 'Bus from BoardWalk Inn',
    legs: [{ mode: 'bus', from: 'BWI', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'bwi-yc-walk',
    from: 'BWI', to: 'YC', name: 'Walk to Yacht Club (~7 min)',
    legs: [{ mode: 'walk', from: 'BWI', to: 'YC', rideMinutes: 7, simRange: [0,0], accessible: true }],
    totalRideMinutes: 7, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'bwi-sw-walk',
    from: 'BWI', to: 'SW', name: 'Walk to Swan (~12 min)',
    legs: [{ mode: 'walk', from: 'BWI', to: 'SW', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'bwi-cbr-bus',
    from: 'BWI', to: 'CBR', name: 'Bus from BoardWalk Inn',
    legs: [{ mode: 'bus', from: 'BWI', to: 'CBR', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'bwi-con-bus',
    from: 'BWI', to: 'CON', name: 'Bus from BoardWalk Inn',
    legs: [{ mode: 'bus', from: 'BWI', to: 'CON', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: YACHT CLUB / BEACH CLUB (YC / BC): use YC as the canonical from
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'yc-ep-walk',
    from: 'YC', to: 'EP', name: 'Walk via International Gateway (~9 min)',
    legs: [{ mode: 'walk', from: 'YC', to: 'EP', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Walk to International Gateway entrance between UK and France. Fastest option.' }],
    totalRideMinutes: 9, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'yc-ep-boat',
    from: 'YC', to: 'EP', name: 'Friendship Boat to EPCOT',
    legs: [{ mode: 'friendship_boat', from: 'YC', to: 'EP', rideMinutes: 25, simRange: [1,12], accessible: true, tip: 'Stops at BWI before EP. Walking is faster.' }],
    totalRideMinutes: 25, tags: ['water', 'scenic'],
  },
  {
    id: 'bc-ep-walk',
    from: 'BC', to: 'EP', name: 'Walk via International Gateway (~9 min)',
    legs: [{ mode: 'walk', from: 'BC', to: 'EP', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Beach Club is right at the International Gateway entrance.' }],
    totalRideMinutes: 9, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'yc-hs-walk',
    from: 'YC', to: 'HS', name: 'Walk via BoardWalk path (~22 min)',
    legs: [{ mode: 'walk', from: 'YC', to: 'HS', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: ['walk_only'],
  },
  {
    id: 'yc-hs-boat',
    from: 'YC', to: 'HS', name: 'Friendship Boat to Hollywood Studios',
    legs: [{ mode: 'friendship_boat', from: 'YC', to: 'HS', rideMinutes: 22, simRange: [1,12], accessible: true, tip: 'Stops at SW/DO, then HS. Similar time to walking.' }],
    totalRideMinutes: 22, tags: ['water', 'scenic'],
  },
  {
    id: 'yc-hs-bus',
    from: 'YC', to: 'HS', name: 'Bus from Yacht Club',
    legs: [{ mode: 'bus', from: 'YC', to: 'HS', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'yc-mk-bus',
    from: 'YC', to: 'MK', name: 'Bus from Yacht Club',
    legs: [{ mode: 'bus', from: 'YC', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'yc-ak-bus',
    from: 'YC', to: 'AK', name: 'Bus from Yacht Club',
    legs: [{ mode: 'bus', from: 'YC', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'yc-ds-bus',
    from: 'YC', to: 'DS', name: 'Bus from Yacht Club',
    legs: [{ mode: 'bus', from: 'YC', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'yc-bwi-walk',
    from: 'YC', to: 'BWI', name: 'Walk to BoardWalk Inn (~7 min)',
    legs: [{ mode: 'walk', from: 'YC', to: 'BWI', rideMinutes: 7, simRange: [0,0], accessible: true }],
    totalRideMinutes: 7, tags: ['walk_only'],
  },
  {
    id: 'yc-sw-walk',
    from: 'YC', to: 'SW', name: 'Walk to Swan (~7 min)',
    legs: [{ mode: 'walk', from: 'YC', to: 'SW', rideMinutes: 7, simRange: [0,0], accessible: true }],
    totalRideMinutes: 7, tags: ['walk_only'],
  },
  {
    id: 'yc-cbr-bus',
    from: 'YC', to: 'CBR', name: 'Bus from Yacht Club',
    legs: [{ mode: 'bus', from: 'YC', to: 'CBR', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'bc-mk-bus',
    from: 'BC', to: 'MK', name: 'Bus from Beach Club',
    legs: [{ mode: 'bus', from: 'BC', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'bc-ak-bus',
    from: 'BC', to: 'AK', name: 'Bus from Beach Club',
    legs: [{ mode: 'bus', from: 'BC', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: SWAN / DOLPHIN / SWAN RESERVE (SW / DO / SR)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'sw-ep-walk',
    from: 'SW', to: 'EP', name: 'Walk via Crescent Lake to International Gateway (~12 min)',
    legs: [{ mode: 'walk', from: 'SW', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Walk around Crescent Lake toward EPCOT International Gateway. Fastest option.' }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'sw-ep-boat',
    from: 'SW', to: 'EP', name: 'Friendship Boat to EPCOT',
    legs: [{ mode: 'friendship_boat', from: 'SW', to: 'EP', rideMinutes: 27, simRange: [1,12], accessible: true, tip: 'Stops at BWI, YC/BC before EPCOT IG. Walking is faster.' }],
    totalRideMinutes: 27, tags: ['water', 'scenic'],
  },
  {
    id: 'do-ep-walk',
    from: 'DO', to: 'EP', name: 'Walk via Crescent Lake (~12 min)',
    legs: [{ mode: 'walk', from: 'DO', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'sr-ep-walk',
    from: 'SR', to: 'EP', name: 'Walk via Crescent Lake (~12 min)',
    legs: [{ mode: 'walk', from: 'SR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'sw-hs-walk',
    from: 'SW', to: 'HS', name: 'Walk to Hollywood Studios (~11 min)',
    legs: [{ mode: 'walk', from: 'SW', to: 'HS', rideMinutes: 11, simRange: [0,0], accessible: true, tip: 'Most direct walk from Swan. Cross the bridge, HS entrance is close.' }],
    totalRideMinutes: 11, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'sw-hs-boat',
    from: 'SW', to: 'HS', name: 'Friendship Boat to Hollywood Studios',
    legs: [{ mode: 'friendship_boat', from: 'SW', to: 'HS', rideMinutes: 12, simRange: [1,12], accessible: true, tip: 'First Friendship Boat stop heading toward HS.' }],
    totalRideMinutes: 12, tags: ['water', 'scenic'],
  },
  {
    id: 'do-hs-walk',
    from: 'DO', to: 'HS', name: 'Walk to Hollywood Studios (~11 min)',
    legs: [{ mode: 'walk', from: 'DO', to: 'HS', rideMinutes: 11, simRange: [0,0], accessible: true }],
    totalRideMinutes: 11, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'sw-mk-bus',
    from: 'SW', to: 'MK', name: 'Bus from Swan',
    legs: [{ mode: 'bus', from: 'SW', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'do-mk-bus',
    from: 'DO', to: 'MK', name: 'Bus from Dolphin',
    legs: [{ mode: 'bus', from: 'DO', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'sw-ak-bus',
    from: 'SW', to: 'AK', name: 'Bus from Swan',
    legs: [{ mode: 'bus', from: 'SW', to: 'AK', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'sw-ds-bus',
    from: 'SW', to: 'DS', name: 'Bus from Swan',
    legs: [{ mode: 'bus', from: 'SW', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'sw-bwi-walk',
    from: 'SW', to: 'BWI', name: 'Walk to BoardWalk Inn (~12 min)',
    legs: [{ mode: 'walk', from: 'SW', to: 'BWI', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only'],
  },
  {
    id: 'sw-yc-walk',
    from: 'SW', to: 'YC', name: 'Walk to Yacht Club (~7 min)',
    legs: [{ mode: 'walk', from: 'SW', to: 'YC', rideMinutes: 7, simRange: [0,0], accessible: true }],
    totalRideMinutes: 7, tags: ['walk_only'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: CARIBBEAN BEACH RESORT (CBR): Skyliner Hub
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'cbr-ep-skyliner',
    from: 'CBR', to: 'EP', name: 'Skyliner to EPCOT',
    legs: [{ mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Direct Skyliner from CBR hub. Arrives at EPCOT International Gateway.' }],
    totalRideMinutes: 12, tags: ['scenic'],
  },
  {
    id: 'cbr-hs-skyliner',
    from: 'CBR', to: 'HS', name: 'Skyliner to Hollywood Studios',
    legs: [{ mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, tip: 'Direct and fastest. Skyliner arrives at HS entrance.' }],
    totalRideMinutes: 5, tags: ['scenic'],
  },
  {
    id: 'cbr-riv-skyliner',
    from: 'CBR', to: 'RIV', name: 'Skyliner to Riviera Resort',
    legs: [{ mode: 'skyliner', from: 'CBR', to: 'RIV', rideMinutes: 4, simRange: [0,0], accessible: true }],
    totalRideMinutes: 4, tags: ['scenic'],
  },
  {
    id: 'cbr-pop-skyliner',
    from: 'CBR', to: 'POP', name: 'Skyliner to Pop Century Resort',
    legs: [{ mode: 'skyliner', from: 'CBR', to: 'POP', rideMinutes: 4, simRange: [0,0], accessible: true }],
    totalRideMinutes: 4, tags: ['scenic'],
  },
  {
    id: 'cbr-aoa-skyliner',
    from: 'CBR', to: 'AOA', name: 'Skyliner to Art of Animation Resort',
    legs: [{ mode: 'skyliner', from: 'CBR', to: 'AOA', rideMinutes: 5, simRange: [0,0], accessible: true }],
    totalRideMinutes: 5, tags: ['scenic'],
  },
  {
    id: 'cbr-mk-bus',
    from: 'CBR', to: 'MK', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'cbr-ak-bus',
    from: 'CBR', to: 'AK', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'cbr-ds-bus',
    from: 'CBR', to: 'DS', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'DS', rideMinutes: 25, simRange: [1,20], accessible: true }],
    totalRideMinutes: 25, totalRideRange: [25,45], tags: [],
  },
  {
    id: 'cbr-yc-skyliner-walk',
    from: 'CBR', to: 'YC', name: 'Skyliner to EPCOT, walk to Yacht Club',
    legs: [
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true },
      { mode: 'walk', from: 'EP', to: 'YC', rideMinutes: 9, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Exit EPCOT via International Gateway; walk along Crescent Lake.' },
    ],
    totalRideMinutes: 21, tags: ['transfer', 'scenic'],
  },
  {
    id: 'cbr-bwi-skyliner-walk',
    from: 'CBR', to: 'BWI', name: 'Skyliner to EPCOT, walk to BoardWalk Inn',
    legs: [
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true },
      { mode: 'walk', from: 'EP', to: 'BWI', rideMinutes: 6, simRange: [0,0], accessible: true, walkMinutes: 0, tip: 'Exit via International Gateway. BWI is immediately adjacent.' },
    ],
    totalRideMinutes: 18, tags: ['transfer', 'scenic'],
  },
  {
    id: 'cbr-con-bus',
    from: 'CBR', to: 'CON', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'CON', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },
  {
    id: 'cbr-akl-bus',
    from: 'CBR', to: 'AKL', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'AKL', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },
  {
    id: 'cbr-pofq-bus',
    from: 'CBR', to: 'POFQ', name: 'Bus from Caribbean Beach Resort',
    legs: [{ mode: 'bus', from: 'CBR', to: 'POFQ', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: RIVIERA RESORT (RIV)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'riv-ep-skyliner',
    from: 'RIV', to: 'EP', name: 'Skyliner to EPCOT',
    legs: [{ mode: 'skyliner', from: 'RIV', to: 'EP', rideMinutes: 9, simRange: [0,0], accessible: true, tip: 'Direct and fast. Arrives at EPCOT International Gateway.' }],
    totalRideMinutes: 9, tags: ['scenic'],
  },
  {
    id: 'riv-hs-skyliner',
    from: 'RIV', to: 'HS', name: 'Skyliner to Caribbean Beach, transfer to Hollywood Studios',
    legs: [
      { mode: 'skyliner', from: 'RIV', to: 'CBR', rideMinutes: 4, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 9, tags: ['transfer', 'scenic'],
  },
  {
    id: 'riv-cbr-skyliner',
    from: 'RIV', to: 'CBR', name: 'Skyliner to Caribbean Beach Resort',
    legs: [{ mode: 'skyliner', from: 'RIV', to: 'CBR', rideMinutes: 4, simRange: [0,0], accessible: true }],
    totalRideMinutes: 4, tags: ['scenic'],
  },
  {
    id: 'riv-pop-skyliner',
    from: 'RIV', to: 'POP', name: 'Skyliner to Caribbean Beach, transfer to Pop Century',
    legs: [
      { mode: 'skyliner', from: 'RIV', to: 'CBR', rideMinutes: 4, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'POP', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 9, tags: ['transfer', 'scenic'],
  },
  {
    id: 'riv-mk-bus',
    from: 'RIV', to: 'MK', name: 'Bus from Riviera Resort',
    legs: [{ mode: 'bus', from: 'RIV', to: 'MK', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'riv-ak-bus',
    from: 'RIV', to: 'AK', name: 'Bus from Riviera Resort',
    legs: [{ mode: 'bus', from: 'RIV', to: 'AK', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'riv-ds-bus',
    from: 'RIV', to: 'DS', name: 'Bus from Riviera Resort',
    legs: [{ mode: 'bus', from: 'RIV', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'riv-yc-skyliner-walk',
    from: 'RIV', to: 'YC', name: 'Skyliner to EPCOT, walk to Yacht Club',
    legs: [
      { mode: 'skyliner', from: 'RIV', to: 'EP', rideMinutes: 9, simRange: [0,0], accessible: true },
      { mode: 'walk', from: 'EP', to: 'YC', rideMinutes: 9, simRange: [0,0], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 18, tags: ['transfer', 'scenic'],
  },
  {
    id: 'riv-bwi-skyliner-walk',
    from: 'RIV', to: 'BWI', name: 'Skyliner to EPCOT, walk to BoardWalk Inn',
    legs: [
      { mode: 'skyliner', from: 'RIV', to: 'EP', rideMinutes: 9, simRange: [0,0], accessible: true },
      { mode: 'walk', from: 'EP', to: 'BWI', rideMinutes: 6, simRange: [0,0], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 15, tags: ['transfer', 'scenic'],
  },
  {
    id: 'riv-con-bus',
    from: 'RIV', to: 'CON', name: 'Bus from Riviera Resort',
    legs: [{ mode: 'bus', from: 'RIV', to: 'CON', rideMinutes: 45, simRange: [1,20], accessible: true }],
    totalRideMinutes: 45, totalRideRange: [45,65], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: POP CENTURY / ART OF ANIMATION (POP / AOA)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'pop-ep-skyliner',
    from: 'POP', to: 'EP', name: 'Skyliner to Caribbean Beach, transfer to EPCOT',
    legs: [
      { mode: 'skyliner', from: 'POP', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 3, tip: 'Transfer at CBR hub. Arrives at EPCOT International Gateway.' },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },
  {
    id: 'aoa-ep-skyliner',
    from: 'AOA', to: 'EP', name: 'Skyliner to Caribbean Beach, transfer to EPCOT',
    legs: [
      { mode: 'skyliner', from: 'AOA', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 17, tags: ['transfer', 'scenic'],
  },
  {
    id: 'pop-hs-skyliner',
    from: 'POP', to: 'HS', name: 'Skyliner to Caribbean Beach, transfer to Hollywood Studios',
    legs: [
      { mode: 'skyliner', from: 'POP', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 10, tags: ['transfer', 'scenic'],
  },
  {
    id: 'aoa-hs-skyliner',
    from: 'AOA', to: 'HS', name: 'Skyliner to Caribbean Beach, transfer to Hollywood Studios',
    legs: [
      { mode: 'skyliner', from: 'AOA', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'HS', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 10, tags: ['transfer', 'scenic'],
  },
  {
    id: 'pop-cbr-skyliner',
    from: 'POP', to: 'CBR', name: 'Skyliner to Caribbean Beach Resort',
    legs: [{ mode: 'skyliner', from: 'POP', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true }],
    totalRideMinutes: 5, tags: ['scenic'],
  },
  {
    id: 'pop-riv-skyliner',
    from: 'POP', to: 'RIV', name: 'Skyliner to Caribbean Beach, transfer to Riviera Resort',
    legs: [
      { mode: 'skyliner', from: 'POP', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'RIV', rideMinutes: 4, simRange: [0,0], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 9, tags: ['transfer', 'scenic'],
  },
  {
    id: 'pop-mk-bus',
    from: 'POP', to: 'MK', name: 'Bus from Pop Century',
    legs: [{ mode: 'bus', from: 'POP', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'aoa-mk-bus',
    from: 'AOA', to: 'MK', name: 'Bus from Art of Animation',
    legs: [{ mode: 'bus', from: 'AOA', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'pop-ak-bus',
    from: 'POP', to: 'AK', name: 'Bus from Pop Century',
    legs: [{ mode: 'bus', from: 'POP', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'pop-ds-bus',
    from: 'POP', to: 'DS', name: 'Bus from Pop Century',
    legs: [{ mode: 'bus', from: 'POP', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'pop-yc-skyliner-walk',
    from: 'POP', to: 'YC', name: 'Skyliner to EPCOT, walk to Yacht Club',
    legs: [
      { mode: 'skyliner', from: 'POP', to: 'CBR', rideMinutes: 5, simRange: [0,0], accessible: true },
      { mode: 'skyliner', from: 'CBR', to: 'EP', rideMinutes: 12, simRange: [0,0], accessible: true, walkMinutes: 3 },
      { mode: 'walk', from: 'EP', to: 'YC', rideMinutes: 9, simRange: [0,0], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 26, tags: ['transfer', 'scenic'],
  },
  {
    id: 'pop-con-bus',
    from: 'POP', to: 'CON', name: 'Bus from Pop Century',
    legs: [{ mode: 'bus', from: 'POP', to: 'CON', rideMinutes: 45, simRange: [1,20], accessible: true }],
    totalRideMinutes: 45, totalRideRange: [45,65], tags: [],
  },
  {
    id: 'pop-akl-bus',
    from: 'POP', to: 'AKL', name: 'Bus from Pop Century',
    legs: [{ mode: 'bus', from: 'POP', to: 'AKL', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: GRAND FLORIDIAN (GF)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'gf-mk-walk',
    from: 'GF', to: 'MK', name: 'Walk to Magic Kingdom (~14 min)',
    legs: [{ mode: 'walk', from: 'GF', to: 'MK', rideMinutes: 14, simRange: [0,0], accessible: true, tip: 'Usually faster than any transit. Scenic path along Seven Seas Lagoon.' }],
    totalRideMinutes: 14, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'gf-mk-watertaxi',
    from: 'GF', to: 'MK', name: 'Gold Flag Water Taxi to Magic Kingdom',
    legs: [{ mode: 'water_taxi_gold', from: 'GF', to: 'MK', rideMinutes: 8, simRange: [1,12], accessible: false, tip: 'Direct dock at GF. Fast option when boat is ready.' }],
    totalRideMinutes: 8, tags: ['water', 'scenic'],
  },
  {
    id: 'gf-mk-monorail',
    from: 'GF', to: 'MK', name: 'Resort Monorail to Magic Kingdom',
    legs: [{ mode: 'monorail_resort', from: 'GF', to: 'MK', rideMinutes: 3, simRange: [1,5], accessible: true, tip: 'Next stop in correct loop direction. Walk is usually as fast when factoring monorail wait.' }],
    totalRideMinutes: 3, tags: [],
  },
  {
    id: 'gf-con-monorail',
    from: 'GF', to: 'CON', name: 'Resort Monorail to Contemporary (via MK)',
    legs: [{ mode: 'monorail_resort', from: 'GF', to: 'CON', rideMinutes: 6, simRange: [1,5], accessible: true, tip: 'GF→MK→CON, two stops in correct loop direction.' }],
    totalRideMinutes: 6, tags: [],
  },
  {
    id: 'gf-ttc-walk',
    from: 'GF', to: 'TTC', name: 'Walk to Polynesian, then walk to TTC (~17 min)',
    legs: [
      { mode: 'walk', from: 'GF', to: 'POLY', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Resort Monorail from GF goes the WRONG way (GF→MK→CON→TTC = 11 min). Walking to Poly then TTC is faster.' },
      { mode: 'walk', from: 'POLY', to: 'TTC', rideMinutes: 5, simRange: [0,0], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 17, tags: ['walk_only'],
  },
  {
    id: 'gf-poly-walk',
    from: 'GF', to: 'POLY', name: 'Walk to Polynesian (~12 min)',
    legs: [{ mode: 'walk', from: 'GF', to: 'POLY', rideMinutes: 12, simRange: [0,0], accessible: true, tip: 'Resort Monorail goes wrong direction from here. Always walk.' }],
    totalRideMinutes: 12, tags: ['walk_only'],
  },
  {
    id: 'gf-ep-walk-monorail',
    from: 'GF', to: 'EP', name: 'Walk to TTC, EPCOT Monorail to EPCOT',
    legs: [
      { mode: 'walk', from: 'GF', to: 'TTC', rideMinutes: 17, simRange: [0,0], accessible: true, tip: 'Walk GF→POLY (~12 min) + POLY→TTC (~5 min). Then take EPCOT Monorail.' },
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 29, tags: ['transfer'],
  },
  {
    id: 'gf-hs-bus',
    from: 'GF', to: 'HS', name: 'Bus from Grand Floridian',
    legs: [{ mode: 'bus', from: 'GF', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'gf-ak-bus',
    from: 'GF', to: 'AK', name: 'Bus from Grand Floridian',
    legs: [{ mode: 'bus', from: 'GF', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'gf-ds-bus',
    from: 'GF', to: 'DS', name: 'Bus from Grand Floridian',
    legs: [{ mode: 'bus', from: 'GF', to: 'DS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'gf-cbr-bus',
    from: 'GF', to: 'CBR', name: 'Bus from Grand Floridian',
    legs: [{ mode: 'bus', from: 'GF', to: 'CBR', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },
  {
    id: 'gf-akl-bus',
    from: 'GF', to: 'AKL', name: 'Bus from Grand Floridian',
    legs: [{ mode: 'bus', from: 'GF', to: 'AKL', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: POLYNESIAN VILLAGE (POLY)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'poly-ttc-walk',
    from: 'POLY', to: 'TTC', name: 'Walk to TTC (~6 min)',
    legs: [{ mode: 'walk', from: 'POLY', to: 'TTC', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'Always walk. Poly is right next to TTC. Monorail in this direction takes 17 min (wrong direction). Never take it.' }],
    totalRideMinutes: 6, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'poly-gf-monorail',
    from: 'POLY', to: 'GF', name: 'Resort Monorail to Grand Floridian',
    legs: [{ mode: 'monorail_resort', from: 'POLY', to: 'GF', rideMinutes: 3, simRange: [1,5], accessible: true, tip: 'Next stop in correct loop direction. Fine to take.' }],
    totalRideMinutes: 3, tags: [],
  },
  {
    id: 'poly-gf-walk',
    from: 'POLY', to: 'GF', name: 'Walk to Grand Floridian (~12 min)',
    legs: [{ mode: 'walk', from: 'POLY', to: 'GF', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only'],
  },
  {
    id: 'poly-mk-monorail',
    from: 'POLY', to: 'MK', name: 'Resort Monorail to Magic Kingdom',
    legs: [{ mode: 'monorail_resort', from: 'POLY', to: 'MK', rideMinutes: 6, simRange: [1,5], accessible: true, tip: 'Two stops in correct direction: POLY→GF→MK.' }],
    totalRideMinutes: 6, tags: [],
  },
  {
    id: 'poly-mk-watertaxi',
    from: 'POLY', to: 'MK', name: 'Gold Flag Water Taxi to Magic Kingdom',
    legs: [{ mode: 'water_taxi_gold', from: 'POLY', to: 'MK', rideMinutes: 8, simRange: [1,12], accessible: false, tip: 'Direct from POLY dock.' }],
    totalRideMinutes: 8, tags: ['water', 'scenic'],
  },
  {
    id: 'poly-con-monorail',
    from: 'POLY', to: 'CON', name: 'Resort Monorail to Contemporary',
    legs: [{ mode: 'monorail_resort', from: 'POLY', to: 'CON', rideMinutes: 9, simRange: [1,5], accessible: true, tip: 'Three stops in correct direction: POLY→GF→MK→CON.' }],
    totalRideMinutes: 9, tags: [],
  },
  {
    id: 'poly-ep-walk-monorail',
    from: 'POLY', to: 'EP', name: 'Walk to TTC, EPCOT Monorail to EPCOT',
    legs: [
      { mode: 'walk', from: 'POLY', to: 'TTC', rideMinutes: 6, simRange: [0,0], accessible: true, tip: 'Do NOT take Resort Monorail backwards. Walk to TTC (5–8 min), then take EPCOT Monorail.' },
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, walkMinutes: 0 },
    ],
    totalRideMinutes: 18, tags: ['transfer'],
  },
  {
    id: 'poly-hs-bus',
    from: 'POLY', to: 'HS', name: 'Bus from Polynesian Village',
    legs: [{ mode: 'bus', from: 'POLY', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'poly-ak-bus',
    from: 'POLY', to: 'AK', name: 'Bus from Polynesian Village',
    legs: [{ mode: 'bus', from: 'POLY', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'poly-ds-bus',
    from: 'POLY', to: 'DS', name: 'Bus from Polynesian Village',
    legs: [{ mode: 'bus', from: 'POLY', to: 'DS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'poly-cbr-bus',
    from: 'POLY', to: 'CBR', name: 'Bus from Polynesian Village',
    legs: [{ mode: 'bus', from: 'POLY', to: 'CBR', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: CONTEMPORARY (CON)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'con-mk-walk',
    from: 'CON', to: 'MK', name: 'Walk to Magic Kingdom (~8 min)',
    legs: [{ mode: 'walk', from: 'CON', to: 'MK', rideMinutes: 8, simRange: [0,0], accessible: true, tip: 'Always walk. Direct sidewalk path, fastest option. Resort Monorail goes the wrong way from here (14 min loop).' }],
    totalRideMinutes: 8, tags: ['walk_only', 'no_water_alt'],
  },
  {
    id: 'con-ttc-monorail',
    from: 'CON', to: 'TTC', name: 'Resort Monorail to TTC',
    legs: [{ mode: 'monorail_resort', from: 'CON', to: 'TTC', rideMinutes: 5, simRange: [1,5], accessible: true, tip: 'Next stop in correct loop direction: CON→TTC.' }],
    totalRideMinutes: 5, tags: [],
  },
  {
    id: 'con-poly-monorail',
    from: 'CON', to: 'POLY', name: 'Resort Monorail to Polynesian',
    legs: [{ mode: 'monorail_resort', from: 'CON', to: 'POLY', rideMinutes: 8, simRange: [1,5], accessible: true, tip: 'Two stops in correct direction: CON→TTC→POLY.' }],
    totalRideMinutes: 8, tags: [],
  },
  {
    id: 'con-gf-monorail',
    from: 'CON', to: 'GF', name: 'Resort Monorail to Grand Floridian',
    legs: [{ mode: 'monorail_resort', from: 'CON', to: 'GF', rideMinutes: 11, simRange: [1,5], accessible: true, tip: 'Three stops: CON→TTC→POLY→GF.' }],
    totalRideMinutes: 11, tags: [],
  },
  {
    id: 'con-ep-monorail',
    from: 'CON', to: 'EP', name: 'Resort Monorail to TTC, EPCOT Monorail to EPCOT',
    legs: [
      { mode: 'monorail_resort', from: 'CON', to: 'TTC', rideMinutes: 5, simRange: [1,5], accessible: true },
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, walkMinutes: 2 },
    ],
    totalRideMinutes: 17, tags: ['transfer'],
  },
  {
    id: 'con-wl-watertaxi',
    from: 'CON', to: 'WL', name: 'Blue Flag Water Taxi to Wilderness Lodge',
    legs: [{ mode: 'water_taxi_blue', from: 'CON', to: 'WL', rideMinutes: 11, simRange: [1,12], accessible: false, tip: 'Blue Flag route: CON↔WL↔FW. Operates 3pm–10:45pm only.' }],
    totalRideMinutes: 11, tags: ['water', 'scenic', 'time_restricted'],
    timeRestriction: 'after_3pm_only',
  },
  {
    id: 'con-fw-watertaxi',
    from: 'CON', to: 'FW', name: 'Blue Flag Water Taxi to Fort Wilderness',
    legs: [{ mode: 'water_taxi_blue', from: 'CON', to: 'FW', rideMinutes: 15, simRange: [1,12], accessible: false, tip: 'Blue Flag route loops CON↔WL↔FW. Runs 3pm–10:45pm only.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic', 'time_restricted'],
    timeRestriction: 'after_3pm_only',
  },
  {
    id: 'con-hs-bus',
    from: 'CON', to: 'HS', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'con-ak-bus',
    from: 'CON', to: 'AK', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'con-ds-bus',
    from: 'CON', to: 'DS', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'DS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'con-cbr-bus',
    from: 'CON', to: 'CBR', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'CBR', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },
  {
    id: 'con-yc-bus',
    from: 'CON', to: 'YC', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'YC', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },
  {
    id: 'con-akl-bus',
    from: 'CON', to: 'AKL', name: 'Bus from Contemporary Resort',
    legs: [{ mode: 'bus', from: 'CON', to: 'AKL', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: WILDERNESS LODGE (WL)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'wl-mk-watertaxi',
    from: 'WL', to: 'MK', name: 'Red Flag Water Taxi to Magic Kingdom',
    legs: [{ mode: 'water_taxi_red', from: 'WL', to: 'MK', rideMinutes: 8, simRange: [1,12], accessible: true, tip: 'Drops directly at MK gates, not TTC. Scenic, relaxing ride. Recommended.' }],
    totalRideMinutes: 8, tags: ['water', 'scenic'],
  },
  {
    id: 'wl-mk-bus',
    from: 'WL', to: 'MK', name: 'Bus from Wilderness Lodge to Magic Kingdom',
    legs: [{ mode: 'bus', from: 'WL', to: 'MK', rideMinutes: 7, simRange: [1,20], accessible: true, tip: 'Bus drops directly at MK gates (not TTC). Faster ride than the boat, but longer sim wait. Great non-water option.' }],
    totalRideMinutes: 7, totalRideRange: [7,27], tags: ['no_water_alt'],
  },
  {
    id: 'wl-ep-bus',
    from: 'WL', to: 'EP', name: 'Bus from Wilderness Lodge to EPCOT',
    legs: [{ mode: 'bus', from: 'WL', to: 'EP', rideMinutes: 20, simRange: [1,20], accessible: true, tip: 'Bus is shared with Fort Wilderness. FW boards first on outbound trips. No boat option to EPCOT from WL.' }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },
  {
    id: 'wl-hs-bus',
    from: 'WL', to: 'HS', name: 'Bus from Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'WL', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'wl-ak-bus',
    from: 'WL', to: 'AK', name: 'Bus from Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'WL', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'wl-ds-bus',
    from: 'WL', to: 'DS', name: 'Bus from Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'WL', to: 'DS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'wl-con-watertaxi',
    from: 'WL', to: 'CON', name: 'Blue Flag Water Taxi to Contemporary',
    legs: [{ mode: 'water_taxi_blue', from: 'WL', to: 'CON', rideMinutes: 11, simRange: [1,12], accessible: false, tip: 'Blue Flag route: WL↔CON↔FW. Only runs 3pm–10:45pm.' }],
    totalRideMinutes: 11, tags: ['water', 'scenic', 'time_restricted'],
    timeRestriction: 'after_3pm_only',
  },
  {
    id: 'wl-fw-watertaxi',
    from: 'WL', to: 'FW', name: 'Blue Flag Water Taxi to Fort Wilderness',
    legs: [{ mode: 'water_taxi_blue', from: 'WL', to: 'FW', rideMinutes: 7, simRange: [1,12], accessible: false, tip: 'Blue Flag operates 3pm–10:45pm only.' }],
    totalRideMinutes: 7, tags: ['water', 'scenic', 'time_restricted'],
    timeRestriction: 'after_3pm_only',
  },
  {
    id: 'wl-cbr-bus',
    from: 'WL', to: 'CBR', name: 'Bus from Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'WL', to: 'CBR', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },
  {
    id: 'wl-yc-bus',
    from: 'WL', to: 'YC', name: 'Bus from Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'WL', to: 'YC', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: FORT WILDERNESS (FW)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'fw-mk-watertaxi',
    from: 'FW', to: 'MK', name: 'Green Flag Water Taxi to Magic Kingdom',
    legs: [{ mode: 'water_taxi_green', from: 'FW', to: 'MK', rideMinutes: 13, simRange: [1,12], accessible: true, tip: 'Take internal FW bus to Settlement marina first (~10–15 min). Boat drops at MK gates directly.' }],
    totalRideMinutes: 13, tags: ['water', 'scenic'],
  },
  {
    id: 'fw-mk-bus',
    from: 'FW', to: 'MK', name: 'Bus from Fort Wilderness to Magic Kingdom',
    legs: [{ mode: 'bus', from: 'FW', to: 'MK', rideMinutes: 17, simRange: [1,20], accessible: true, tip: 'Take internal FW bus to Outpost Depot first. External bus drops at MK gates, not TTC. A real, always-available option.' }],
    totalRideMinutes: 17, totalRideRange: [17,37], tags: ['no_water_alt'],
  },
  {
    id: 'fw-ep-bus-monorail',
    from: 'FW', to: 'EP', name: 'Bus to TTC, EPCOT Monorail to EPCOT',
    legs: [
      { mode: 'bus', from: 'FW', to: 'TTC', rideMinutes: 15, simRange: [1,20], accessible: true, tip: 'FW bus goes to TTC, not directly to EPCOT. Transfer to EPCOT Monorail at TTC.' },
      { mode: 'monorail_epcot', from: 'TTC', to: 'EP', rideMinutes: 12, simRange: [1,10], accessible: true, walkMinutes: 3 },
    ],
    totalRideMinutes: 27, totalRideRange: [27,47], tags: ['transfer'],
  },
  {
    id: 'fw-hs-bus',
    from: 'FW', to: 'HS', name: 'Bus from Fort Wilderness',
    legs: [{ mode: 'bus', from: 'FW', to: 'HS', rideMinutes: 35, simRange: [1,20], accessible: true, tip: 'Take internal FW bus to Outpost Depot, then external bus to HS.' }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'fw-ak-bus',
    from: 'FW', to: 'AK', name: 'Bus from Fort Wilderness',
    legs: [{ mode: 'bus', from: 'FW', to: 'AK', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'fw-ds-bus',
    from: 'FW', to: 'DS', name: 'Bus from Fort Wilderness',
    legs: [{ mode: 'bus', from: 'FW', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'fw-wl-bus',
    from: 'FW', to: 'WL', name: 'Bus from Fort Wilderness to Wilderness Lodge',
    legs: [{ mode: 'bus', from: 'FW', to: 'WL', rideMinutes: 5, simRange: [1,20], accessible: true, tip: 'Short shared bus hop, available anytime.' }],
    totalRideMinutes: 5, totalRideRange: [5,25], tags: [],
  },
  {
    id: 'fw-con-watertaxi',
    from: 'FW', to: 'CON', name: 'Blue Flag Water Taxi to Contemporary',
    legs: [{ mode: 'water_taxi_blue', from: 'FW', to: 'CON', rideMinutes: 15, simRange: [1,12], accessible: false, tip: 'Blue Flag loops FW↔WL↔CON. Operates 3pm–10:45pm only.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic', 'time_restricted'],
    timeRestriction: 'after_3pm_only',
  },
  {
    id: 'fw-minnie',
    from: 'FW', to: 'GF', name: 'Minnie Van (Lyft)',
    legs: [{ mode: 'minnie_van', from: 'FW', to: 'GF', rideMinutes: 22, simRange: [0,0], accessible: true }],
    totalRideMinutes: 22, tags: [],
  },
  {
    id: 'fw-cbr-bus',
    from: 'FW', to: 'CBR', name: 'Bus from Fort Wilderness',
    legs: [{ mode: 'bus', from: 'FW', to: 'CBR', rideMinutes: 47, simRange: [1,20], accessible: true }],
    totalRideMinutes: 47, totalRideRange: [47,67], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: ANIMAL KINGDOM LODGE (AKL)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'akl-ak-bus',
    from: 'AKL', to: 'AK', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'AK', rideMinutes: 10, simRange: [1,20], accessible: true, tip: 'Short and direct. AKL is very close to Animal Kingdom.' }],
    totalRideMinutes: 10, totalRideRange: [10,30], tags: [],
  },
  {
    id: 'akl-mk-bus',
    from: 'AKL', to: 'MK', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'MK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'akl-ep-bus',
    from: 'AKL', to: 'EP', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'EP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'akl-hs-bus',
    from: 'AKL', to: 'HS', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'akl-bb-bus',
    from: 'AKL', to: 'BB', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, tip: 'Close proximity. Direct bus.' }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },
  {
    id: 'akl-ds-bus',
    from: 'AKL', to: 'DS', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'akl-cbr-bus',
    from: 'AKL', to: 'CBR', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'CBR', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },
  {
    id: 'akl-yc-bus',
    from: 'AKL', to: 'YC', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'YC', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },
  {
    id: 'akl-con-bus',
    from: 'AKL', to: 'CON', name: 'Bus from Animal Kingdom Lodge',
    legs: [{ mode: 'bus', from: 'AKL', to: 'CON', rideMinutes: 42, simRange: [1,20], accessible: true }],
    totalRideMinutes: 42, totalRideRange: [42,62], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: CORONADO SPRINGS (COR)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'cor-ak-bus',
    from: 'COR', to: 'AK', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'AK', rideMinutes: 17, simRange: [1,20], accessible: true, tip: 'Close to AK. One of the faster bus rides from a resort.' }],
    totalRideMinutes: 17, totalRideRange: [17,37], tags: [],
  },
  {
    id: 'cor-mk-bus',
    from: 'COR', to: 'MK', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'cor-ep-bus',
    from: 'COR', to: 'EP', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'cor-hs-bus',
    from: 'COR', to: 'HS', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'cor-bb-bus',
    from: 'COR', to: 'BB', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },
  {
    id: 'cor-ds-bus',
    from: 'COR', to: 'DS', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'cor-cbr-bus',
    from: 'COR', to: 'CBR', name: 'Bus from Coronado Springs',
    legs: [{ mode: 'bus', from: 'COR', to: 'CBR', rideMinutes: 40, simRange: [1,20], accessible: true }],
    totalRideMinutes: 40, totalRideRange: [40,60], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: ALL-STAR RESORTS (ASMo / ASMu / ASS)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'asmo-mk-bus',
    from: 'ASMo', to: 'MK', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmo-ep-bus',
    from: 'ASMo', to: 'EP', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmo-hs-bus',
    from: 'ASMo', to: 'HS', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmo-ak-bus',
    from: 'ASMo', to: 'AK', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmo-bb-bus',
    from: 'ASMo', to: 'BB', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'BB', rideMinutes: 12, simRange: [1,20], accessible: true, tip: 'Very close to Blizzard Beach. Direct bus.' }],
    totalRideMinutes: 12, totalRideRange: [12,32], tags: [],
  },
  {
    id: 'asmo-ds-bus',
    from: 'ASMo', to: 'DS', name: 'Bus from All-Star Movies',
    legs: [{ mode: 'bus', from: 'ASMo', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },
  {
    id: 'asmu-mk-bus',
    from: 'ASMu', to: 'MK', name: 'Bus from All-Star Music',
    legs: [{ mode: 'bus', from: 'ASMu', to: 'MK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmu-ep-bus',
    from: 'ASMu', to: 'EP', name: 'Bus from All-Star Music',
    legs: [{ mode: 'bus', from: 'ASMu', to: 'EP', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmu-hs-bus',
    from: 'ASMu', to: 'HS', name: 'Bus from All-Star Music',
    legs: [{ mode: 'bus', from: 'ASMu', to: 'HS', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmu-ak-bus',
    from: 'ASMu', to: 'AK', name: 'Bus from All-Star Music',
    legs: [{ mode: 'bus', from: 'ASMu', to: 'AK', rideMinutes: 30, simRange: [1,20], accessible: true }],
    totalRideMinutes: 30, totalRideRange: [30,50], tags: [],
  },
  {
    id: 'asmu-bb-bus',
    from: 'ASMu', to: 'BB', name: 'Bus from All-Star Music',
    legs: [{ mode: 'bus', from: 'ASMu', to: 'BB', rideMinutes: 12, simRange: [1,20], accessible: true }],
    totalRideMinutes: 12, totalRideRange: [12,32], tags: [],
  },
  {
    id: 'ass-mk-bus',
    from: 'ASS', to: 'MK', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'MK', rideMinutes: 28, simRange: [1,20], accessible: true, tip: 'Sports is the first stop on All-Stars shared bus, shortest wait.' }],
    totalRideMinutes: 28, totalRideRange: [28,48], tags: [],
  },
  {
    id: 'ass-ep-bus',
    from: 'ASS', to: 'EP', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'EP', rideMinutes: 28, simRange: [1,20], accessible: true }],
    totalRideMinutes: 28, totalRideRange: [28,48], tags: [],
  },
  {
    id: 'ass-hs-bus',
    from: 'ASS', to: 'HS', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'HS', rideMinutes: 28, simRange: [1,20], accessible: true }],
    totalRideMinutes: 28, totalRideRange: [28,48], tags: [],
  },
  {
    id: 'ass-ak-bus',
    from: 'ASS', to: 'AK', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'AK', rideMinutes: 28, simRange: [1,20], accessible: true }],
    totalRideMinutes: 28, totalRideRange: [28,48], tags: [],
  },
  {
    id: 'ass-bb-bus',
    from: 'ASS', to: 'BB', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'BB', rideMinutes: 10, simRange: [1,20], accessible: true }],
    totalRideMinutes: 10, totalRideRange: [10,30], tags: [],
  },
  {
    id: 'ass-ds-bus',
    from: 'ASS', to: 'DS', name: 'Bus from All-Star Sports',
    legs: [{ mode: 'bus', from: 'ASS', to: 'DS', rideMinutes: 35, simRange: [1,20], accessible: true }],
    totalRideMinutes: 35, totalRideRange: [35,55], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: PORT ORLEANS FRENCH QUARTER (POFQ) & RIVERSIDE (POR)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'pofq-ds-sassagoula',
    from: 'POFQ', to: 'DS', name: 'Sassagoula River Cruise to Disney Springs',
    legs: [{ mode: 'sassagoula_boat', from: 'POFQ', to: 'DS', rideMinutes: 15, simRange: [1,12], accessible: true, tip: 'Scenic river cruise. Popular option for resort guests.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic'],
  },
  {
    id: 'pofq-ds-bus',
    from: 'POFQ', to: 'DS', name: 'Bus from Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'POFQ', to: 'DS', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },
  {
    id: 'por-ds-sassagoula',
    from: 'POR', to: 'DS', name: 'Sassagoula River Cruise to Disney Springs',
    legs: [{ mode: 'sassagoula_boat', from: 'POR', to: 'DS', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Stops at POFQ first, then Disney Springs. Relaxing option.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'por-ds-bus',
    from: 'POR', to: 'DS', name: 'Bus from Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'POR', to: 'DS', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },
  {
    id: 'pofq-por-boat',
    from: 'POFQ', to: 'POR', name: 'Sassagoula Boat between French Quarter and Riverside',
    legs: [{ mode: 'sassagoula_boat', from: 'POFQ', to: 'POR', rideMinutes: 5, simRange: [1,12], accessible: true }],
    totalRideMinutes: 5, tags: ['water'],
  },
  {
    id: 'pofq-por-walk',
    from: 'POFQ', to: 'POR', name: 'Walk between French Quarter and Riverside (~12 min)',
    legs: [{ mode: 'walk', from: 'POFQ', to: 'POR', rideMinutes: 12, simRange: [0,0], accessible: true }],
    totalRideMinutes: 12, tags: ['walk_only'],
  },
  {
    id: 'pofq-mk-bus',
    from: 'POFQ', to: 'MK', name: 'Bus from Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'POFQ', to: 'MK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'pofq-ep-bus',
    from: 'POFQ', to: 'EP', name: 'Bus from Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'POFQ', to: 'EP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'pofq-hs-bus',
    from: 'POFQ', to: 'HS', name: 'Bus from Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'POFQ', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'pofq-ak-bus',
    from: 'POFQ', to: 'AK', name: 'Bus from Port Orleans French Quarter',
    legs: [{ mode: 'bus', from: 'POFQ', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'pofq-tl-via-ds',
    from: 'POFQ', to: 'TL', name: 'Bus to Disney Springs, transfer to Typhoon Lagoon',
    legs: [
      { mode: 'bus', from: 'POFQ', to: 'DS', rideMinutes: 20, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 30, totalRideRange: [30,55], tags: ['transfer'],
  },
  {
    id: 'por-mk-bus',
    from: 'POR', to: 'MK', name: 'Bus from Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'POR', to: 'MK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'por-ep-bus',
    from: 'POR', to: 'EP', name: 'Bus from Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'POR', to: 'EP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'por-hs-bus',
    from: 'POR', to: 'HS', name: 'Bus from Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'POR', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'por-ak-bus',
    from: 'POR', to: 'AK', name: 'Bus from Port Orleans Riverside',
    legs: [{ mode: 'bus', from: 'POR', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FROM: OLD KEY WEST (OKW) & SARATOGA SPRINGS (SS)
  // ─────────────────────────────────────────────────────────────────────────

  {
    id: 'okw-ds-sassagoula',
    from: 'OKW', to: 'DS', name: 'Sassagoula River Cruise to Disney Springs',
    legs: [{ mode: 'sassagoula_boat', from: 'OKW', to: 'DS', rideMinutes: 20, simRange: [1,12], accessible: true, tip: 'Green flag boat. Scenic river cruise option.' }],
    totalRideMinutes: 20, tags: ['water', 'scenic'],
  },
  {
    id: 'okw-ds-bus',
    from: 'OKW', to: 'DS', name: 'Bus from Old Key West',
    legs: [{ mode: 'bus', from: 'OKW', to: 'DS', rideMinutes: 20, simRange: [1,20], accessible: true }],
    totalRideMinutes: 20, totalRideRange: [20,40], tags: [],
  },
  {
    id: 'ss-ds-sassagoula',
    from: 'SS', to: 'DS', name: 'Sassagoula River Cruise to Disney Springs',
    legs: [{ mode: 'sassagoula_boat', from: 'SS', to: 'DS', rideMinutes: 15, simRange: [1,12], accessible: true, tip: 'Blue flag, shortest Sassagoula run. SS is adjacent to DS.' }],
    totalRideMinutes: 15, tags: ['water', 'scenic'],
  },
  {
    id: 'ss-ds-walk',
    from: 'SS', to: 'DS', name: 'Walk to Disney Springs (~17 min)',
    legs: [{ mode: 'walk', from: 'SS', to: 'DS', rideMinutes: 17, simRange: [0,0], accessible: true, tip: 'Saratoga Springs is right next to Disney Springs. Easy walk.' }],
    totalRideMinutes: 17, tags: ['walk_only'],
  },
  {
    id: 'ss-ds-bus',
    from: 'SS', to: 'DS', name: 'Bus from Saratoga Springs',
    legs: [{ mode: 'bus', from: 'SS', to: 'DS', rideMinutes: 15, simRange: [1,20], accessible: true }],
    totalRideMinutes: 15, totalRideRange: [15,35], tags: [],
  },
  {
    id: 'okw-tl-via-ds',
    from: 'OKW', to: 'TL', name: 'Bus to Disney Springs, transfer to Typhoon Lagoon',
    legs: [
      { mode: 'bus', from: 'OKW', to: 'DS', rideMinutes: 20, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 30, totalRideRange: [30,55], tags: ['transfer'],
  },
  {
    id: 'ss-tl-via-ds',
    from: 'SS', to: 'TL', name: 'Bus to Disney Springs, transfer to Typhoon Lagoon',
    legs: [
      { mode: 'bus', from: 'SS', to: 'DS', rideMinutes: 15, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'DS', to: 'TL', rideMinutes: 10, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 25, totalRideRange: [25,50], tags: ['transfer'],
  },
  {
    id: 'okw-mk-bus',
    from: 'OKW', to: 'MK', name: 'Bus from Old Key West',
    legs: [{ mode: 'bus', from: 'OKW', to: 'MK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'okw-ep-bus',
    from: 'OKW', to: 'EP', name: 'Bus from Old Key West',
    legs: [{ mode: 'bus', from: 'OKW', to: 'EP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'okw-hs-bus',
    from: 'OKW', to: 'HS', name: 'Bus from Old Key West',
    legs: [{ mode: 'bus', from: 'OKW', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'okw-ak-bus',
    from: 'OKW', to: 'AK', name: 'Bus from Old Key West',
    legs: [{ mode: 'bus', from: 'OKW', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ss-mk-bus',
    from: 'SS', to: 'MK', name: 'Bus from Saratoga Springs',
    legs: [{ mode: 'bus', from: 'SS', to: 'MK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ss-ep-bus',
    from: 'SS', to: 'EP', name: 'Bus from Saratoga Springs',
    legs: [{ mode: 'bus', from: 'SS', to: 'EP', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ss-hs-bus',
    from: 'SS', to: 'HS', name: 'Bus from Saratoga Springs',
    legs: [{ mode: 'bus', from: 'SS', to: 'HS', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'ss-ak-bus',
    from: 'SS', to: 'AK', name: 'Bus from Saratoga Springs',
    legs: [{ mode: 'bus', from: 'SS', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true }],
    totalRideMinutes: 32, totalRideRange: [32,52], tags: [],
  },
  {
    id: 'okw-bb-via-ak',
    from: 'OKW', to: 'BB', name: 'Bus to AK area, Bus to Blizzard Beach',
    legs: [
      { mode: 'bus', from: 'OKW', to: 'AK', rideMinutes: 32, simRange: [1,20], accessible: true },
      { mode: 'bus', from: 'AK', to: 'BB', rideMinutes: 15, simRange: [1,20], accessible: true, walkMinutes: 5 },
    ],
    totalRideMinutes: 47, totalRideRange: [47,72], tags: ['transfer'],
  },

];
