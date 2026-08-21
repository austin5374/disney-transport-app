import type { TextStyle } from 'react-native';
import appConfig from '../../app.json';

// Design tokens
// Modeled on the My Disney Experience app: near-neutral gray page ground,
// full-bleed white sections, near-black navy text, and exactly one bright
// interactive blue. No gold. The reference app has none, and using it as an
// accent was the loudest "this isn't the same app" signal in the old palette.

export const Colors = {
  // Interactive blue. Links, buttons, active states, selected chips
  primaryBlue:   '#0B79D0',
  primaryHover:  '#1994DC',
  primaryTint:   '#E7F2FB',   // wash behind blue content
  primaryBorder: '#9CCBEC',

  // Text
  textPrimary:   '#0E2C4B',   // near-black navy. Headings and body
  textSecondary: '#5A6B7B',
  textPlaceholder: '#8C97A3',
  textOnDark:    '#FFFFFF',
  textOnDarkSub: 'rgba(255,255,255,0.78)',

  // Bottom tab bar. The reference fills the selected glyph in near-black
  // navy and leaves the rest a mid gray; the interactive blue never appears
  // down there.
  tabActive:     '#0E2C4B',
  tabInactive:   '#9AA5B1',

  // Surfaces
  sectionBg:     '#FFFFFF',   // full-bleed section fill
  pageBg:        '#EDF1F5',   // the gutter between sections
  divider:       '#E3E8EE',
  dividerStrong: '#D5DDE5',

  // Hero gradient (planner / status / map headers)
  heroTop:       '#1B7FC4',
  heroMid:       '#136BAE',
  heroBottom:    '#0E5490',

  // Service status. Amber and red are reserved for real disruptions only,
  // never for decoration or emphasis.
  statusOperating:      '#1B8A4B',
  statusOperatingBg:    '#E8F6ED',
  statusOperatingBorder:'#A9DCBD',
  statusDelayed:        '#9A6206',
  statusDelayedBg:      '#FDF4E3',
  statusDelayedBorder:  '#EFCE93',
  statusDown:           '#B3261E',
  statusDownBg:         '#FBEBEA',
  statusDownBorder:     '#EDB9B6',
  // Outside operating hours. Deliberately neutral: a line that is simply shut
  // for the night is not a fault, and painting it amber would cry wolf.
  statusClosed:         '#5A6B7B',
  statusClosedBg:       '#EDF1F5',
  statusClosedBorder:   '#D5DDE5',

  // Transport line colors. These identify real WDW lines on the map and on
  // status cards. They are data, not UI accent.
  skyliner:        '#1E96A8',
  bus:             '#4E7D1F',
  monorailExpress: '#D6453D',
  monorailResort:  '#D68A15',
  monorailEpcot:   '#2F8757',
  ferryBoat:       '#2E6FC4',
  waterTaxi:       '#2E6FC4',
  friendshipBoat:  '#22857A',
  sassagoula:      '#7A4E33',
  walk:            '#7A8592',
  minnieVan:       '#C24E27',

  // Map
  mapWater:        '#DCEBF7',
  mapWaterStroke:  '#C7DFEF',
} as const;

export const StatusColors = {
  operating: { text: Colors.statusOperating, bg: Colors.statusOperatingBg, border: Colors.statusOperatingBorder },
  delayed:   { text: Colors.statusDelayed,   bg: Colors.statusDelayedBg,   border: Colors.statusDelayedBorder },
  down:      { text: Colors.statusDown,      bg: Colors.statusDownBg,      border: Colors.statusDownBorder },
  closed:    { text: Colors.statusClosed,    bg: Colors.statusClosedBg,    border: Colors.statusClosedBorder },
};

// Typography
// Eight roles on a 13/14/15/16/17/20/24/28 ramp, three weights. The old
// palette had 17 distinct sizes. Including 10.5, 11.5, 12.5 and 13.5. And
// used weight 500 for both headings and body, which left the UI with no
// hierarchy at all. Anything that needs a size off this ramp is a design
// mistake, not a missing token: spread a role, never override its fontSize.
//
// There is deliberately no all-caps role. The reference app does not use one
// anywhere: section headers are Title Case navy `title`, and small field
// labels are Title Case gray `caption` or `label`. An uppercase eyebrow was
// the loudest typographic tell in the old build.

export const FontFamily = {
  regular:  'NunitoSans_400Regular',
  semibold: 'NunitoSans_600SemiBold',
  bold:     'NunitoSans_700Bold',
} as const;

export const Type = {
  /** Screen hero title */
  display:    { fontFamily: FontFamily.bold,     fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  /** Section headers and route names */
  title:      { fontFamily: FontFamily.bold,     fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  /** The one big number in a stat block or an outlined key-value box */
  // Tabular figures so a countdown ticking from 10 to 9 doesn't reflow the
  // row it sits in.
  stat:       { fontFamily: FontFamily.bold,     fontSize: 26, lineHeight: 32, letterSpacing: -0.3,
                fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  /** Sub-headings inside a section, list-row titles */
  subtitle:   { fontFamily: FontFamily.semibold, fontSize: 18, lineHeight: 24 },
  /** Default readable text */
  body:       { fontFamily: FontFamily.regular,  fontSize: 17, lineHeight: 25 },
  /** Supporting text under a title. The second line of a list row */
  bodySmall:  { fontFamily: FontFamily.regular,  fontSize: 16, lineHeight: 23 },
  /** Buttons, links, pill labels. Anything tappable */
  action:     { fontFamily: FontFamily.semibold, fontSize: 17, lineHeight: 23 },
  /** Emphasized inline text that is not itself an action */
  label:      { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 20 },
  /** Metadata, timestamps, field labels */
  caption:    { fontFamily: FontFamily.regular,  fontSize: 14, lineHeight: 19 },
} as const;

// Spacing + radius
// A 4pt scale. Previously these existed in this file and were imported by
// exactly zero components, which is why every screen invented its own numbers.

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export const Radius = {
  /** chips, badges, small tags */
  sm:  8,
  /** inputs, inner bordered boxes */
  md:  12,
  /** bottom sheets */
  lg:  20,
  /** pill buttons and filter pills */
  pill: 24,
} as const;

/** Height of the gray gutter that separates two full-bleed white sections. */
export const SECTION_GAP = 8;

export const transportColor = (mode: string): string => {
  switch (mode) {
    case 'skyliner':         return Colors.skyliner;
    case 'bus':              return Colors.bus;
    case 'monorail_express': return Colors.monorailExpress;
    case 'monorail_resort':  return Colors.monorailResort;
    case 'monorail_epcot':   return Colors.monorailEpcot;
    case 'ferry_ttc_mk':     return Colors.ferryBoat;
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue':  return Colors.waterTaxi;
    case 'friendship_boat':  return Colors.friendshipBoat;
    case 'sassagoula_boat':  return Colors.sassagoula;
    case 'walk':             return Colors.walk;
    case 'minnie_van':       return Colors.minnieVan;
    default:                 return Colors.textSecondary;
  }
};

// Destination badge tiers. Parks read as primary blue, water parks as teal,
// everything else as a neutral slate. The reference app tints by category
// but never introduces a warm accent to do it.
export const groupTier = (group: string): 'park' | 'water' | 'hub' => {
  if (group === 'Parks') return 'park';
  if (group === 'Water Parks') return 'water';
  return 'hub';
};

export const GroupTierColors: Record<'park' | 'water' | 'hub', { bg: string; text: string }> = {
  park:  { bg: Colors.primaryTint, text: Colors.primaryBlue },
  water: { bg: '#E4F3F1',          text: Colors.friendshipBoat },
  hub:   { bg: '#EDF1F5',          text: Colors.textSecondary },
};

export const groupBadgeColors = (group: string) => GroupTierColors[groupTier(group)];

export const Brand = {
  /** The banner on every screen. This is a fan project and carries no product
   *  name of its own; the disclaimer on the About screen says whose network
   *  it describes and that it is unofficial. */
  title: 'Walt Disney World Transportation',
  /** The one place a version number is written down. `package.json` is held
   *  in step by a test rather than by anyone remembering to edit both. */
  version: appConfig.expo.version,
};

export const Gradients = {
  hero: [Colors.heroTop, Colors.heroMid, Colors.heroBottom] as const,
};
