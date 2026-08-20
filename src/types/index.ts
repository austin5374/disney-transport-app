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
  | 'no_water_alt'
  | 'time_restricted';

// ─── Leg ────────────────────────────────────────────────────────────────────
export interface Leg {
  mode: TransportMode;
  from: string;
  to: string;
  rideMinutes: number;
  simRange: [number, number];
  walkMinutes?: number; // walk TO this leg (before boarding)
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
  timeRestriction?: 'before_10am' | 'before_4pm' | 'after_3pm_only' | 'after_10am';
  notes?: string;
  name: string; // human-readable name for the card
}

// ─── Filters ────────────────────────────────────────────────────────────────
export interface ActiveFilters {
  fastestFirst: boolean;
  scenic: boolean;
  noWater: boolean;
  accessible: boolean;
  noTransfer: boolean;
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
  Search: undefined;
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
