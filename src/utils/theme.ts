export const Colors = {
  // Primary
  primaryBlue:   '#0B6FAB',
  lightBlueTint: '#E8F3FB',
  blueBorder:    '#B3D4EF',
  // Backgrounds
  pageBg:        '#F0F4F8',
  cardBg:        '#FFFFFF',
  cardBorder:    '#E0E8F0',
  divider:       '#EEF3F7',
  // Text
  textPrimary:   '#1A2A35',
  textSecondary: '#7A8A99',
  textPlaceholder:'#9BA8B5',
  // Status
  liveGreen:     '#27AE60',
  warnText:      '#7B5800',
  warnBg:        '#FFF8E1',
  warnBorder:    '#FFD54F',
  warnIcon:      '#FFB300',
  waterText:     '#1D6B52',
  waterBg:       '#EAF4F0',
  waterBorder:   '#A8D8C8',
  // Gold
  gold:          '#FFD700',
  // Transport colors
  skyliner:      '#7F77DD',
  bus:           '#639922',
  monorailExpress:'#0B6FAB',
  monorailResort: '#EF9F27',
  monorailEpcot:  '#EF9F27',
  ferryBoat:      '#378ADD',
  waterTaxi:      '#378ADD',
  friendshipBoat: '#378ADD',
  sassagoula:     '#378ADD',
  walk:           '#9BA8B5',
  minnieVan:      '#D85A30',
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
