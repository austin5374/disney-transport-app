import { Route, Leg, TransportMode } from '../types';
import { TRANSIT_LINES, TransitLine } from './lines';
import { shortLabel } from './destinations';

// Every ordered pair on a line, derived from the line's own stop list
//
// rail.ts already does this for the monorail beams, and the reason it exists
// is instructive: only 12 of the resort loop's 20 ordered pairs had ever been
// written out, so Magic Kingdom to Grand Floridian offered a walk and no
// train. The boats and the Skyliner had the same latent bug — Port Orleans
// Riverside to Old Key West sits on the Sassagoula line and had no boat — for
// exactly the same reason: the stops were declared in one place and the trips
// were typed out in another.
//
// Deriving the trips from the stops makes that class of gap impossible rather
// than fixing its instances one at a time.

interface Stop {
  index: number;
  ids: string[];
}

function findStop(line: TransitLine, id: string): Stop | null {
  if (!line.stops) return null;
  const index = line.stops.findIndex(ids => ids.includes(id));
  return index === -1 ? null : { index, ids: line.stops[index] };
}

const label = shortLabel;

const MODE_NAME: Partial<Record<TransportMode, string>> = {
  skyliner:        'Skyliner',
  ferry_ttc_mk:    'Ferry Boat',
  water_taxi_gold: 'Gold Launch',
  water_taxi_red:  'Red Launch',
  water_taxi_green:'Green Launch',
  water_taxi_blue: 'Blue Launch',
  friendship_boat: 'Friendship Boat',
  sassagoula_boat: 'Sassagoula Boat',
};

function boardingTip(line: TransitLine, fromId: string): string {
  const place = label(fromId);
  return line.mode === 'skyliner'
    ? `Board at the Skyliner station at ${place}.`
    : `Board at the boat dock at ${place}.`;
}

/** Trips this line can carry between two destinations, in either direction. */
export function lineRoutes(from: string, to: string): Route[] {
  const out: Route[] = [];

  for (const line of TRANSIT_LINES) {
    if (!line.stops || !line.hopMinutes) continue;
    const a = findStop(line, from);
    const b = findStop(line, to);
    if (!a || !b || a.index === b.index) continue;

    // These lines run out and back rather than in a loop, so the ride time is
    // the same either way: sum the hops between the two stops.
    const lo = Math.min(a.index, b.index);
    const hi = Math.max(a.index, b.index);
    const ride = line.hopMinutes.slice(lo, hi).reduce((sum, m) => sum + m, 0);
    if (ride <= 0) continue;

    const stopsBetween = hi - lo - 1;
    const legs: Leg[] = [{
      mode: line.mode,
      from,
      to,
      rideMinutes: ride,
      accessible: true,
      tip: boardingTip(line, from),
    }];

    out.push({
      id: `line-${line.id}-${from}-${to}`,
      from,
      to,
      legs,
      totalRideMinutes: ride,
      tags: line.group === 'Boats' ? ['water', 'scenic'] : ['scenic'],
      name: `${MODE_NAME[line.mode] ?? line.shortName} to ${label(to)}`,
      notes: stopsBetween > 0
        ? `${MODE_NAME[line.mode] ?? line.shortName} makes ${stopsBetween} stop${stopsBetween === 1 ? '' : 's'} on the way.`
        : undefined,
    });
  }

  return out;
}
