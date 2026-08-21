// ─── Transport modes ────────────────────────────────────────────────────────
export type TransportMode =
  | 'skyliner'
  | 'bus'
  | 'monorail_express'
  | 'monorail_resort'
  | 'monorail_epcot'
  | 'ferry_ttc_mk'
  | 'water_taxi_gold'
  | 'water_taxi_red'
  | 'water_taxi_green'
  | 'water_taxi_blue'
  | 'friendship_boat'
  | 'sassagoula_boat'
  | 'walk'
  | 'minnie_van';

// ─── Route tags ─────────────────────────────────────────────────────────────
export type RouteTag =
  | 'water'
  | 'walk_only'
  | 'transfer'
  | 'before_10am_only'
  | 'scenic'
  | 'time_restricted';

// ─── Leg ────────────────────────────────────────────────────────────────────
export interface Leg {
  mode: TransportMode;
  from: string;
  to: string;
  /** Time aboard the vehicle, excluding any wait or walk. */
  rideMinutes: number;
  /** Walk TO this leg, before boarding. Rendered by StepCard and counted in
   *  the journey total — previously stored on 55 legs and displayed nowhere,
   *  which is why some route totals did not add up from their own steps. */
  walkMinutes?: number;
  tip?: string;
  accessible: boolean;
}

// ─── Route ──────────────────────────────────────────────────────────────────
export interface Route {
  id: string;
  from: string;
  to: string;
  legs: Leg[];
  totalRideMinutes: number;
  totalRideRange?: [number, number];
  tags: RouteTag[];
  timeRestriction?: 'before_10am' | 'after_3pm_only' | 'after_10am' | 'after_4pm_only';
  notes?: string;
  name: string; // human-readable name for the card
}

// ─── Filters ────────────────────────────────────────────────────────────────
// Sort is one three-way choice rather than two mutually-exclusive booleans
// plus a "fastest first" switch whose off-state changed nothing.
export type SortMode = 'fastest' | 'transfers' | 'scenic';

export interface ActiveFilters {
  sort: SortMode;
  /** Exclude any route with a watercraft leg. */
  noWater: boolean;
  /** Exclude any route with a leg that is not step-free. */
  accessible: boolean;
}

// ─── Geofence zone ──────────────────────────────────────────────────────────
export interface GeofenceZone {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusMeters: number;
}

// ─── Destination ────────────────────────────────────────────────────────────
export interface Destination {
  id: string;
  label: string;
  group: DestinationGroup;
  abbrev: string; // 2–3 char for journey diagram
  /** Approximate center of the property, used to estimate drive time for the
   *  paid-ride option. Accurate to roughly a block, which is all a duration
   *  estimate needs. */
  lat: number;
  lng: number;
}

export type DestinationGroup =
  | 'Parks'
  | 'Water Parks'
  | 'Transportation'
  | 'Entertainment'
  | 'Deluxe MK Area'
  | 'Deluxe EPCOT Area'
  | 'Deluxe AK Area'
  | 'Moderate Resorts'
  | 'Value Resorts'
  | 'DVC / Other';

// ─── Navigation param types ─────────────────────────────────────────────────
export type RootStackParamList = {
  /** `reset` is a timestamp bumped by the tab bar's center action to clear
   *  the planner back to a blank form. */
  Search: { reset?: number } | undefined;
  Results: {
    from: Destination;
    to: Destination;
    filters: ActiveFilters;
    timeOverride?: string; // ISO string
  };
  Detail: {
    routeData: Route;
    from: Destination;
    to: Destination;
    timeOverride?: string;
  };
};
