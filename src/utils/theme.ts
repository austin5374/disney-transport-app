export const Colors = {
  // Primary brand — deep indigo, deliberately distinct from Disney's blue
  primaryBlue:   '#4F46A5',
  primaryDark:   '#3B3480',
  lightBlueTint: '#EDEBFA',
  blueBorder:    '#C9C4EE',
  // Backgrounds
  pageBg:        '#F2F2F7',
  cardBg:        '#FFFFFF',
  cardBorder:    '#E4E3EE',
  divider:       '#EEEDF4',
  // Text
  textPrimary:   '#1C1B2E',
  textSecondary: '#75748A',
  textPlaceholder:'#9C9BAE',
  // Live status
  liveGreen:     '#1F9D55',
  statusOperating:      '#1F9D55',
  statusOperatingBg:    '#E7F6EC',
  statusOperatingBorder:'#B7E2C6',
  statusDelayed:        '#B97509',
  statusDelayedBg:      '#FDF3E1',
  statusDelayedBorder:  '#F0CE8B',
  statusDown:           '#C43D3D',
  statusDownBg:         '#FBEAEA',
  statusDownBorder:     '#EDBABA',
  // Warnings / accents
  warnText:      '#7B5800',
  warnBg:        '#FFF8E1',
  warnBorder:    '#FFD54F',
  warnIcon:      '#FFB300',
  waterText:     '#1D6B52',
  waterBg:       '#EAF4F0',
  waterBorder:   '#A8D8C8',
  // Gold accent
  gold:          '#E0A93E',
  // Transport colors
  skyliner:      '#7F77DD',
  bus:           '#639922',
  monorailExpress:'#E8554D',
  monorailResort: '#F2A93B',
  monorailEpcot:  '#4C9F70',
  ferryBoat:      '#378ADD',
  waterTaxi:      '#378ADD',
  friendshipBoat: '#2E9E8F',
  sassagoula:     '#8A6FBF',
  walk:           '#9C9BAE',
  minnieVan:      '#D85A30',
};

export const StatusColors = {
  operating: { text: Colors.statusOperating, bg: Colors.statusOperatingBg, border: Colors.statusOperatingBorder },
  delayed:   { text: Colors.statusDelayed,   bg: Colors.statusDelayedBg,   border: Colors.statusDelayedBorder },
  down:      { text: Colors.statusDown,      bg: Colors.statusDownBg,      border: Colors.statusDownBorder },
};

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

export const Brand = {
  name: 'ParkWays',
  tagline: 'Walt Disney World transit, unofficial',
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const Radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  18,
};
