import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Route } from '../types';
import { Colors, Type, Spacing, transportColor, groupBadgeColors } from '../utils/theme';
import { modeLabel } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';

interface JourneyDiagramProps {
  route: Route;
}

// A compact origin → transfers → destination strip. The previous version ran
// a staggered fade-in plus a looping transfer pulse, which held content back
// for about a second on a screen the user had just navigated to, and pinned
// itself to the left edge of a full-width box.
export default function JourneyDiagram({ route }: JourneyDiagramProps) {
  const stops = [route.legs[0].from, ...route.legs.map(l => l.to)];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {stops.map((stopId, i) => {
        const dest = DESTINATION_MAP[stopId];
        const abbrev = dest?.abbrev ?? stopId.slice(0, 3);
        const label = dest?.label ?? stopId;
        const badge = groupBadgeColors(dest?.group ?? '');
        const leg = route.legs[i];
        const isTransfer = i > 0 && i < stops.length - 1;

        return (
          <React.Fragment key={`${stopId}-${i}`}>
            <View style={styles.stop}>
              <View style={[styles.node, { backgroundColor: badge.bg }]}>
                <Text style={[styles.nodeText, { color: badge.text }]}>{abbrev}</Text>
              </View>
              <Text style={styles.stopLabel} numberOfLines={2}>{label}</Text>
              {isTransfer ? <Text style={styles.transferTag}>Transfer</Text> : null}
            </View>

            {leg ? (
              <View style={styles.connector}>
                <View style={[styles.connectorLine, { backgroundColor: transportColor(leg.mode) }]} />
                <Text style={styles.connectorMode} numberOfLines={2}>{modeLabel(leg.mode)}</Text>
                <Text style={styles.connectorTime}>{leg.rideMinutes} min</Text>
              </View>
            ) : null}
          </React.Fragment>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: Colors.sectionBg,
  },
  content: {
    flexGrow: 1,
    // A two-stop journey should sit centered rather than hugging the left
    // edge of a full-width container.
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  stop: {
    width: 76,
    alignItems: 'center',
  },
  node: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeText: {
    ...Type.action,
  },
  stopLabel: {
    ...Type.caption,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  transferTag: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  connector: {
    width: 96,
    alignItems: 'center',
    paddingTop: Spacing.lg,
  },
  connectorLine: {
    height: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    marginBottom: Spacing.sm,
  },
  connectorMode: {
    ...Type.caption,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  connectorTime: {
    ...Type.caption,
    color: Colors.textSecondary,
  },
});
