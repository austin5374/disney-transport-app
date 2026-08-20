import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Leg } from '../types';
import { Colors, transportColor } from '../utils/theme';
import { modeLabel } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import LiveArrival from './LiveArrival';
import InfoSheet from './InfoSheet';

const placeLabel = (id: string) => DESTINATION_MAP[id]?.label ?? id;

// What to call the physical spot you'd walk to for each mode — used by the
// "walking directions" prompt below. Walking/rideshare legs get none: you're
// either already walking, or waiting for a car, not heading to a station.
function boardingPointNoun(mode: string): string | null {
  switch (mode) {
    case 'bus':              return 'bus stop';
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':   return 'monorail station';
    case 'skyliner':         return 'Skyliner station';
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue':  return 'boat dock';
    default:                 return null;
  }
}

interface StepCardProps {
  leg: Leg;
  stepNum: number;
  totalSteps: number;
  state: 'done' | 'current' | 'upcoming';
}

function ModeIcon({ mode, color }: { mode: string; color: string }) {
  switch (mode) {
    case 'skyliner':
      return <MaterialCommunityIcons name="gondola" size={22} color={color} />;
    case 'bus':
      return <Ionicons name="bus" size={22} color={color} />;
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':
      return <MaterialCommunityIcons name="train" size={22} color={color} />;
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue':
      return <Ionicons name="boat" size={22} color={color} />;
    case 'walk':
      return <Ionicons name="walk" size={22} color={color} />;
    case 'minnie_van':
      return <Ionicons name="car" size={22} color={color} />;
    default:
      return <Ionicons name="navigate" size={22} color={color} />;
  }
}

function instructionTitle(leg: Leg): string {
  switch (leg.mode) {
    case 'skyliner':         return `Board Skyliner at ${placeLabel(leg.from)}`;
    case 'bus':              return `Board Bus at ${placeLabel(leg.from)}`;
    case 'monorail_express': return `Board Express Monorail at ${placeLabel(leg.from)}`;
    case 'monorail_resort':  return `Board Resort Monorail at ${placeLabel(leg.from)}`;
    case 'monorail_epcot':   return `Board EPCOT Monorail at ${placeLabel(leg.from)}`;
    case 'ferry_ttc_mk':     return `Board Ferry Boat at ${placeLabel(leg.from)}`;
    case 'friendship_boat':  return `Board Friendship Boat at ${placeLabel(leg.from)}`;
    case 'sassagoula_boat':  return `Board Sassagoula River Cruise at ${placeLabel(leg.from)}`;
    case 'water_taxi_gold':  return `Board Gold Flag Water Launch at ${placeLabel(leg.from)}`;
    case 'water_taxi_red':   return `Board Red Flag Water Launch at ${placeLabel(leg.from)}`;
    case 'water_taxi_green': return `Board Green Flag Water Launch at ${placeLabel(leg.from)}`;
    case 'water_taxi_blue':  return `Board Blue Flag Water Launch at ${placeLabel(leg.from)}`;
    case 'walk':             return `Walk to ${placeLabel(leg.to)} (~${leg.rideMinutes} min)`;
    case 'minnie_van':       return `Book Minnie Van via Lyft`;
    default:                 return `Travel to ${placeLabel(leg.to)}`;
  }
}

export default function StepCard({ leg, stepNum, totalSteps, state }: StepCardProps) {
  const isDone     = state === 'done';
  const isCurrent  = state === 'current';
  const isUpcoming = state === 'upcoming';
  const isMinnie   = leg.mode === 'minnie_van';
  const accentColor = transportColor(leg.mode);
  const boardingPoint = boardingPointNoun(leg.mode);
  const [showWalkInfo, setShowWalkInfo] = React.useState(false);

  return (
    <View style={[
      styles.card,
      isDone     && styles.cardDone,
      isCurrent  && styles.cardCurrent,
      isCurrent  && { borderColor: accentColor },
    ]}>
      {/* Step label */}
      <Text style={[
        styles.stepLabel,
        isDone    && styles.stepLabelDone,
        isCurrent && styles.stepLabelCurrent,
        isCurrent && { color: accentColor },
      ]}>
        Step {stepNum} of {totalSteps}{isDone ? ' · complete' : isCurrent ? ' · now' : ''}
      </Text>

      {/* Instruction row */}
      <View style={styles.instructionRow}>
        <View style={[styles.iconWrap, isDone && styles.faded]}>
          <ModeIcon mode={leg.mode} color={transportColor(leg.mode)} />
        </View>
        <View style={styles.instructionText}>
          <Text style={[styles.instructionTitle, isDone && styles.faded]}>
            {instructionTitle(leg)}
          </Text>
          {leg.mode !== 'walk' && leg.mode !== 'minnie_van' && (
            <Text style={[styles.subDetail, isDone && styles.faded]}>
              Ride time: {leg.rideMinutes} min · Destination: {placeLabel(leg.to)}
            </Text>
          )}
        </View>
      </View>

      {/* Tip box: only for the current step — advice for a step you haven't
          reached yet is premature and just adds noise */}
      {leg.tip && isCurrent && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>{leg.tip}</Text>
        </View>
      )}

      {/* Live arrival: current step only */}
      {isCurrent && !isMinnie && (
        <View style={styles.arrivalRow}>
          <LiveArrival mode={leg.mode} from={leg.from} to={leg.to} />
        </View>
      )}

      {/* Minnie Van book button */}
      {isCurrent && isMinnie && (
        <View style={[styles.arrivalRow, styles.lyftRow]}>
          <Ionicons name="phone-portrait-outline" size={14} color={Colors.primaryBlue} />
          <Text style={styles.lyftBtn}>Book via Lyft app</Text>
        </View>
      )}

      {/* Walking directions concept: current step only, transit modes only */}
      {isCurrent && boardingPoint && (
        <TouchableOpacity style={styles.walkRow} onPress={() => setShowWalkInfo(true)} activeOpacity={0.7}>
          <Ionicons name="walk-outline" size={15} color={Colors.primaryBlue} />
          <Text style={styles.walkText}>Walking directions to the {boardingPoint}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primaryBlue} />
        </TouchableOpacity>
      )}

      {boardingPoint && (
        <InfoSheet
          visible={showWalkInfo}
          title="Walking directions"
          message={`This is a demo, so it can't route you for real — but here's the idea: tapping this would open turn-by-turn walking directions from where you are to the ${boardingPoint} at ${placeLabel(leg.from)}.`}
          onClose={() => setShowWalkInfo(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
  },
  cardDone: {
    opacity: 0.45,
  },
  cardCurrent: {
    borderWidth: 1.5,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textPlaceholder,
    marginBottom: 8,
  },
  stepLabelDone: {
    color: Colors.textPlaceholder,
  },
  stepLabelCurrent: {
    fontWeight: '500',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    marginTop: 1,
  },
  faded: {
    opacity: 0.6,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  subDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tipBox: {
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    paddingLeft: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,215,0,0.06)',
    borderRadius: 4,
  },
  tipText: {
    fontSize: 12,
    color: Colors.warnText,
    lineHeight: 18,
  },
  arrivalRow: {
    marginTop: 10,
  },
  lyftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lyftBtn: {
    fontSize: 13,
    color: Colors.primaryBlue,
    fontWeight: '500',
  },
  walkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  walkText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.primaryBlue,
    fontWeight: '500',
  },
});
