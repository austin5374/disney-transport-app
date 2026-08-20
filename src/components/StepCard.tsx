import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leg } from '../types';
import { Colors, transportColor } from '../utils/theme';
import { modeLabel } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import LiveArrival from './LiveArrival';

const placeLabel = (id: string) => DESTINATION_MAP[id]?.label ?? id;

interface StepCardProps {
  leg: Leg;
  stepNum: number;
  totalSteps: number;
  state: 'done' | 'current' | 'upcoming';
}

function modeIcon(mode: string): string {
  switch (mode) {
    case 'skyliner':         return '🚡';
    case 'bus':              return '🚌';
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':   return '🚝';
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue':  return '⛵';
    case 'walk':             return '🚶';
    case 'minnie_van':       return '🚗';
    default:                 return '🔄';
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

  return (
    <View style={[
      styles.card,
      isDone     && styles.cardDone,
      isCurrent  && styles.cardCurrent,
    ]}>
      {/* Step label */}
      <Text style={[
        styles.stepLabel,
        isDone    && styles.stepLabelDone,
        isCurrent && styles.stepLabelCurrent,
      ]}>
        Step {stepNum} of {totalSteps}{isDone ? ' — complete' : isCurrent ? ' — now' : ''}
      </Text>

      {/* Instruction row */}
      <View style={styles.instructionRow}>
        <Text style={[styles.icon, isDone && styles.faded]}>{modeIcon(leg.mode)}</Text>
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

      {/* Tip box */}
      {leg.tip && !isDone && (
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>{leg.tip}</Text>
        </View>
      )}

      {/* Live arrival — current step only */}
      {isCurrent && !isMinnie && (
        <View style={styles.arrivalRow}>
          <LiveArrival mode={leg.mode} from={leg.from} to={leg.to} />
        </View>
      )}

      {/* Minnie Van book button */}
      {isCurrent && isMinnie && (
        <View style={styles.arrivalRow}>
          <Text style={styles.lyftBtn}>📱 Book via Lyft app</Text>
        </View>
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
    borderColor: Colors.skyliner,
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
    color: Colors.skyliner,
    fontWeight: '500',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    fontSize: 22,
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
  lyftBtn: {
    fontSize: 13,
    color: Colors.primaryBlue,
    fontWeight: '500',
  },
});
