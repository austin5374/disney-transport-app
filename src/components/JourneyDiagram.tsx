import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ScrollView } from 'react-native';
import { Route } from '../types';
import { Colors, transportColor } from '../utils/theme';
import { modeLabel } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';

interface JourneyDiagramProps {
  route: Route;
}

function nodeColor(id: string): string {
  const parks = ['MK', 'EP', 'HS', 'AK', 'TL', 'BB'];
  const hubs  = ['TTC', 'CBR', 'RIV', 'CON', 'GF', 'POLY', 'WL', 'FW', 'BWI', 'YC', 'BC', 'SW', 'DO', 'SR', 'AKL', 'DS'];
  if (parks.includes(id)) return Colors.lightBlueTint;
  if (hubs.includes(id))  return 'rgba(255,215,0,0.15)';
  return Colors.waterBg;
}

function nodeTextColor(id: string): string {
  const parks = ['MK', 'EP', 'HS', 'AK', 'TL', 'BB'];
  if (parks.includes(id)) return Colors.primaryBlue;
  return Colors.warnText;
}

export default function JourneyDiagram({ route }: JourneyDiagramProps) {
  // Collect stops: origin + each leg's destination
  const allStops = [route.legs[0].from, ...route.legs.map(l => l.to)];

  // Collapse to max 4 nodes
  let stops = allStops;
  if (allStops.length > 4) {
    stops = [allStops[0], allStops[1], `via ${DESTINATION_MAP[allStops[2]]?.abbrev ?? allStops[2]}`, allStops[allStops.length - 1]];
  }

  const nodeAnims  = useRef(stops.map(() => new Animated.Value(0))).current;
  const lineAnims  = useRef(route.legs.slice(0, stops.length - 1).map(() => new Animated.Value(0))).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Nodes fade in staggered
    const nodeSeq = stops.map((_, i) =>
      Animated.timing(nodeAnims[i], { toValue: 1, duration: 200, delay: i * 100, useNativeDriver: true })
    );
    // Lines draw after nodes
    const lineSeq = lineAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: (stops.length * 100) + i * 300,
        useNativeDriver: false,
      })
    );
    Animated.sequence([
      Animated.parallel(nodeSeq),
      Animated.parallel(lineSeq),
    ]).start();

    // Transfer pulse
    const hasTransfer = route.tags.includes('transfer');
    if (hasTransfer) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  const hasTransfer = route.tags.includes('transfer');
  const transferIndex = stops.length > 2 ? 1 : -1;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diagram}>
        {stops.map((stopId, i) => {
          const dest = DESTINATION_MAP[stopId];
          const abbrev = dest?.abbrev ?? stopId.slice(0, 3);
          const label  = dest?.label ?? stopId;
          const isLast = i === stops.length - 1;
          const isTransfer = hasTransfer && i === transferIndex;
          const leg = route.legs[i]; // line to the right

          return (
            <View key={i} style={styles.nodeGroup}>
              {/* Node */}
              <Animated.View style={[styles.nodeWrap, { opacity: nodeAnims[i] }]}>
                <View style={[styles.nodeBubble, { backgroundColor: nodeColor(stopId) }]}>
                  <Text style={[styles.nodeAbbrev, { color: nodeTextColor(stopId) }]}>{abbrev}</Text>
                </View>
                <Text style={styles.nodeLabel} numberOfLines={2}>{label}</Text>

                {isTransfer && (
                  <Animated.View style={[styles.transferDot, { transform: [{ scale: pulseAnim }] }]} />
                )}
                {isTransfer && <Text style={styles.transferLabel}>transfer</Text>}
              </Animated.View>

              {/* Line to next node */}
              {!isLast && leg && (
                <View style={styles.lineWrap}>
                  <Text style={styles.lineAbove}>{modeLabel(leg.mode)}</Text>
                  <Animated.View
                    style={[
                      styles.line,
                      {
                        backgroundColor: transportColor(leg.mode),
                        width: lineAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      },
                    ]}
                  />
                  <Text style={styles.lineBelow}>{leg.rideMinutes} min</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {hasTransfer && (
        <View style={styles.transferNote}>
          <View style={[styles.transferDotSmall, { backgroundColor: transportColor(route.legs[0]?.mode ?? 'bus') }]} />
          <Text style={styles.transferNoteText}>
            Transfer at {DESTINATION_MAP[stops[transferIndex]]?.label ?? stops[transferIndex]}. Follow signs for your next transport
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(11,111,171,0.06)',
    borderRadius: 18,
    margin: 16,
    paddingVertical: 16,
  },
  diagram: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  nodeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeWrap: {
    alignItems: 'center',
    width: 68,
  },
  nodeBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  nodeAbbrev: {
    fontSize: 13,
    fontWeight: '500',
  },
  nodeLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    width: 66,
  },
  transferDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.skyliner,
    marginTop: 4,
  },
  transferLabel: {
    fontSize: 8,
    color: Colors.skyliner,
    marginTop: 2,
  },
  lineWrap: {
    width: 80,
    alignItems: 'center',
  },
  lineAbove: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginBottom: 3,
    textAlign: 'center',
  },
  line: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  lineBelow: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  transferNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  transferDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  transferNoteText: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
});
