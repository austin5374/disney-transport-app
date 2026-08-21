import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Leg } from '../types';
import { Colors, Type, Spacing, Radius, SECTION_GAP } from '../utils/theme';
import { DESTINATION_MAP } from '../data/destinations';
import LiveArrival from './LiveArrival';
import InfoSheet from './InfoSheet';
import ModeGlyph from './ModeGlyph';

const placeLabel = (id: string) => DESTINATION_MAP[id]?.label ?? id;

// What to call the physical spot you'd walk to for each mode. Used by the
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
    case 'walk':             return `Walk to ${placeLabel(leg.to)}`;
    case 'minnie_van':       return 'Request a Minnie Van in the Lyft app';
    default:                 return `Travel to ${placeLabel(leg.to)}`;
  }
}

export default function StepCard({ leg, stepNum, totalSteps }: StepCardProps) {
  const isMinnie = leg.mode === 'minnie_van';
  const isWalk = leg.mode === 'walk';
  const boardingPoint = boardingPointNoun(leg.mode);
  const [showWalkInfo, setShowWalkInfo] = React.useState(false);

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.stepLabel}>Step {stepNum} of {totalSteps}</Text>

        {/* The walk that precedes boarding. This value lives on 55 legs in the
            route data and was previously rendered nowhere, which is why some
            routes' totals did not visibly add up from their steps. */}
        {leg.walkMinutes ? (
          <View style={styles.walkPrefix}>
            <Ionicons name="walk" size={16} color={Colors.textSecondary} />
            <Text style={styles.walkPrefixText}>
              Walk {leg.walkMinutes} min to the {boardingPoint ?? 'next stop'}
            </Text>
          </View>
        ) : null}

        <View style={styles.instructionRow}>
          <ModeGlyph mode={leg.mode} size={32} tile />
          <View style={styles.instructionText}>
            <Text style={styles.instructionTitle}>{instructionTitle(leg)}</Text>
            <Text style={styles.subDetail}>
              {isWalk
                ? `About ${leg.rideMinutes} min on foot`
                : isMinnie
                  ? `About ${leg.rideMinutes} min · paid ride`
                  : `${leg.rideMinutes} min ride · get off at ${placeLabel(leg.to)}`}
            </Text>
          </View>
        </View>

        {leg.tip ? (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>{leg.tip}</Text>
          </View>
        ) : null}

        {!isMinnie && !isWalk && (
          <View style={styles.arrivalRow}>
            <LiveArrival mode={leg.mode} from={leg.from} to={leg.to} />
          </View>
        )}

        {boardingPoint && (
          <TouchableOpacity
            style={styles.walkRow}
            onPress={() => setShowWalkInfo(true)}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.walkText}>Walking directions to the {boardingPoint}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primaryBlue} />
          </TouchableOpacity>
        )}

        {boardingPoint && (
          <InfoSheet
            visible={showWalkInfo}
            title="Walking directions"
            message={`Turn-by-turn walking guidance to the ${boardingPoint} at ${placeLabel(leg.from)} is not available in this build.`}
            onClose={() => setShowWalkInfo(false)}
          />
        )}
      </View>
      <View style={styles.gutter} />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
  stepLabel: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  walkPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  walkPrefixText: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  subDetail: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tipBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryTint,
  },
  tipText: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
  },
  arrivalRow: {
    marginTop: Spacing.md,
  },
  walkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  walkText: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
});
