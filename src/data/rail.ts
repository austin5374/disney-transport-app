import { Route, Leg, TransportMode } from '../types';
import { shortLabel } from './destinations';
import { between, dayKey } from '../utils/deterministic';

// Monorail connections are generated from the beams themselves rather than
// written out pair by pair.
//
// The resort beam is a one-way loop, so its 5 stations make 20 ordered pairs.
// Only 12 of those were ever hand-authored, which meant Magic Kingdom to Grand
// Floridian, Grand Floridian to the TTC, Polynesian to the TTC and five others
// offered a walk or a boat and no train at all. Deriving every pair from the
// stop order makes that class of gap impossible.

interface RailLine {
  mode: TransportMode;
  /** Stations in the direction the train travels. */
  stops: string[];
  /** Minutes from stops[i] to stops[i+1]. On a loop the final entry is the
   *  hop from the last stop back to stops[0]. */
  hops: number[];
  /** A loop runs one direction only, so reaching the station physically next
   *  door can mean riding most of the way around. */
  loop: boolean;
  /** Some beams only run one way for the first half of the day.
   *
   *  The Express beam is the one that matters: in the morning everybody is
   *  heading into Magic Kingdom, so Disney runs it inbound from the Ticket
   *  Center and opens the return leg around lunchtime — at a different time
   *  each day, depending on how the morning has gone. Travel *backwards*
   *  along `stops` is unavailable until then.
   *
   *  Minutes from midnight, as [earliest, latest]. */
  reverseOpensBetween?: [number, number];
}

/** Where you actually board at each station. */
const BOARDING: Record<string, string> = {
  TTC:  'Board on the upper level of the Transportation and Ticket Center.',
  POLY: 'The station is on the second floor of the Great Ceremonial House.',
  GF:   'The station is one level above the main lobby.',
  MK:   'The station is on the upper level, just outside the park entrance.',
  CON:  'The beam runs straight through the fourth floor of the resort.',
  EP:   'The station sits at the main entrance to EPCOT.',
};

const LINES: RailLine[] = [
  {
    // TTC to Polynesian to Grand Floridian to Magic Kingdom to Contemporary
    // and back to the TTC. One direction only.
    mode: 'monorail_resort',
    stops: ['TTC', 'POLY', 'GF', 'MK', 'CON'],
    hops:  [3, 3, 4, 4, 5],
    loop: true,
  },
  {
    // The Express beam existed at 8 minutes while the Resort loop covered the
    // same TTC-to-Magic-Kingdom run in 9, which makes the express service
    // pointless — and is checkable by anyone who has ridden it. The express
    // run is about four minutes; the resort loop is about ten.
    mode: 'monorail_express',
    stops: ['TTC', 'MK'],
    hops:  [4],
    loop: false,
    reverseOpensBetween: [12 * 60, 13 * 60],
  },
  {
    mode: 'monorail_epcot',
    stops: ['TTC', 'EP'],
    hops:  [13],
    loop: false,
  },
];

const label = shortLabel;

/** The minute this beam's return leg opens today.
 *
 *  Seeded on the date, so it is the same for everyone all day and different
 *  tomorrow — the same trick the status board uses, for the same reason:
 *  a time that rerolls on refresh reads as broken rather than variable. */
export function reverseOpensAt(line: RailLine, at: Date): number | null {
  if (!line.reverseOpensBetween) return null;
  const [lo, hi] = line.reverseOpensBetween;
  return between(lo, hi, 'reverse-open', line.mode, dayKey(at));
}

const clockLabel = (minutes: number): string => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const MODE_NAME: Partial<Record<TransportMode, string>> = {
  monorail_resort:  'Resort Monorail',
  monorail_express: 'Express Monorail',
  monorail_epcot:   'EPCOT Monorail',
};

/** The stations you pass through, in order, riding `line` from `from` to `to`. */
function ride(line: RailLine, from: string, to: string): { path: string[]; minutes: number } | null {
  const i = line.stops.indexOf(from);
  const j = line.stops.indexOf(to);
  if (i < 0 || j < 0 || i === j) return null;

  if (line.loop) {
    const path = [from];
    let minutes = 0;
    let k = i;
    while (line.stops[k] !== to) {
      minutes += line.hops[k];
      k = (k + 1) % line.stops.length;
      path.push(line.stops[k]);
    }
    return { path, minutes };
  }

  // A shuttle beam runs both ways, so ride whichever direction connects them.
  const step = i < j ? 1 : -1;
  const path = [from];
  let minutes = 0;
  for (let k = i; k !== j; k += step) {
    minutes += step === 1 ? line.hops[k] : line.hops[k - 1];
    path.push(line.stops[k + step]);
  }
  return { path, minutes };
}

function tipFor(line: RailLine, path: string[]): string {
  const boarding = BOARDING[path[0]] ?? '';
  const stops = path.length - 1;

  if (!line.loop) return boarding;

  if (stops === 1) return `${boarding} Next stop in the direction of travel.`;

  // List the stops you pass through, not the one you are standing on.
  const ahead = path.slice(1).map(label);
  const last = ahead.pop();
  return `${boarding} ${stops} stops in the direction of travel: ${ahead.join(', ')}, then ${last}.`;
}

/** Every monorail trip available between two stations, if any. */
export function railRoutes(from: string, to: string, at?: Date): Route[] {
  const out: Route[] = [];
  const now = at ?? new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const line of LINES) {
    const trip = ride(line, from, to);
    if (!trip) continue;

    // Riding backwards along the stop order on a beam that has not opened
    // its return leg yet. The trip is still offered — it is how the guest
    // will get back later, and hiding it answers none of the questions they
    // are actually asking — but it is labelled with when it starts.
    const opensAtMinute = reverseOpensAt(line, now);
    const isReverse = line.stops.indexOf(from) > line.stops.indexOf(to);
    const notYetOpen = opensAtMinute !== null && isReverse && nowMinutes < opensAtMinute;

    const leg: Leg = {
      mode: line.mode,
      from,
      to,
      rideMinutes: trip.minutes,
      accessible: true,
      tip: tipFor(line, trip.path),
    };

    // Riding four fifths of a one-way loop to reach somewhere a few minutes
    // away on foot is a real option, just rarely the right one. Saying so is
    // more useful than hiding it.
    const longWayRound = line.loop && trip.path.length - 1 >= 3;

    out.push({
      id: `rail-${line.mode}-${from}-${to}`,
      from,
      to,
      legs: [leg],
      totalRideMinutes: trip.minutes,
      tags: [],
      name: `${MODE_NAME[line.mode] ?? 'Monorail'} to ${label(to)}`,
      ...(longWayRound
        ? { notes: 'The beam runs one direction only, so this rides most of the way around the loop. Check the walking option before you commit to it.' }
        : {}),
      ...(notYetOpen ? { opensAt: clockLabel(opensAtMinute!) } : {}),
    });
  }

  return out;
}

/** Station lists per beam, used by tests to assert full pair coverage. */
export const RAIL_STATIONS: { mode: TransportMode; stops: string[] }[] =
  LINES.map(l => ({ mode: l.mode, stops: l.stops }));
