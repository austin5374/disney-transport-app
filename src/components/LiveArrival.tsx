import React, { useRef, useEffect } from 'react';
import { Text, View, Animated, StyleSheet } from 'react-native';
import { TransportMode } from '../types';
import { modeLabel } from '../utils/routing';
import { lineForLeg } from '../data/lines';
import { useLineStatus, arrivalsForLeg, LineStatus } from '../utils/liveStatus';
import { Colors, Type, Spacing } from '../utils/theme';

interface LiveArrivalProps {
  mode: TransportMode;
  from: string;
  to: string;
  compact?: boolean;
  /** A board computed for another moment, from the planner's time control.
   *  Without it this row reads the real clock while the screen around it
   *  describes a different hour. */
  live?: Record<string, LineStatus>;
  at?: number;
}

export default function LiveArrival({ mode, from, to, compact, live, at }: LiveArrivalProps) {
  const line = lineForLeg(mode, from, to);
  // Subscribing to one line instead of the whole board means this row only
  // re-renders when its own service actually changes.
  const subscribed = useLineStatus(line?.id);
  const status = live && line ? live[line.id] : subscribed;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const disrupted = !!status && (status.status === 'down' || status.status === 'delayed');

  useEffect(() => {
    // Only a disrupted line has something to signal. Pulsing every row on
    // every screen meant ~25 concurrent JS-thread animation loops on web,
    // where useNativeDriver is unavailable.
    if (!disrupted) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [disrupted, pulseAnim]);

  if (!line || !status) return null;

  // Every resort shares one "All resorts to Magic Kingdom" line, so the
  // countdown has to be seeded by the stop you are standing at. Reading it off
  // the line alone showed Pop Century and Animal Kingdom Lodge the same number.
  const arrivals = arrivalsForLeg(line.id, from, at ?? status.updatedAt);
  const next = arrivals[0] ?? status.nextArrivals[0];

  let label: string;
  let color: string = Colors.statusOperating;

  if (status.status === 'closed') {
    label = status.detail ?? `${line.shortName} not running`;
    color = Colors.statusClosed;
  } else if (status.status === 'down') {
    label = status.etaMinutes
      ? `${line.shortName} down · about ${status.etaMinutes} min`
      : `${line.shortName} temporarily down`;
    color = Colors.statusDown;
  } else if (status.status === 'delayed') {
    label = next != null && line.headwayMinutes[1] > 1
      ? `Delays · next in about ${next} min`
      : 'Running with delays';
    color = Colors.statusDelayed;
  } else if (line.headwayMinutes[1] <= 1) {
    label = 'Boarding now';
  } else {
    label = next == null || next === 0
      ? `${modeLabel(mode)} arriving now`
      : `Next ${modeLabel(mode)} in ${next} min`;
  }

  // A readout, not a control. The board recomputes itself on a ticker and its
  // values derive from the wall clock, so there is nothing for a refresh tap
  // to re-roll.
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={label}>
      <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: color }]} />
      <Text style={[styles.text, compact && styles.textCompact, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  text: {
    ...Type.label,
    flexShrink: 1,
  },
  textCompact: {
    ...Type.caption,
  },
});
