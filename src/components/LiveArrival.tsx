import React, { useRef, useEffect } from 'react';
import { Text, View, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TransportMode } from '../types';
import { modeLabel } from '../utils/routing';
import { lineForLeg } from '../data/lines';
import { useLineStatus, refreshLiveStatus } from '../utils/liveStatus';
import { Colors, Type, Spacing } from '../utils/theme';

interface LiveArrivalProps {
  mode: TransportMode;
  from: string;
  to: string;
  compact?: boolean;
}

export default function LiveArrival({ mode, from, to, compact }: LiveArrivalProps) {
  const line = lineForLeg(mode, from, to);
  // Subscribing to one line instead of the whole board means this row only
  // re-renders when its own service actually changes.
  const status = useLineStatus(line?.id);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const disrupted = !!status && status.status !== 'operating';

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

  let label: string;
  let color: string = Colors.statusOperating;

  if (status.status === 'down') {
    label = status.etaMinutes
      ? `${line.shortName} down · about ${status.etaMinutes} min`
      : `${line.shortName} temporarily down`;
    color = Colors.statusDown;
  } else if (status.status === 'delayed') {
    const next = status.nextArrivals[0];
    label = next != null && line.headwayMinutes[1] > 1
      ? `Delays · next in about ${next} min`
      : 'Running with delays';
    color = Colors.statusDelayed;
  } else if (line.headwayMinutes[1] <= 1) {
    label = 'Boarding now';
  } else {
    const next = status.nextArrivals[0];
    label = next == null || next === 0
      ? `${modeLabel(mode)} arriving now`
      : `Next ${modeLabel(mode)} in ${next} min`;
  }

  return (
    <TouchableOpacity
      onPress={refreshLiveStatus}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`${label}. Tap to refresh.`}
      style={styles.row}
    >
      <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: color }]} />
      <Text style={[styles.text, compact && styles.textCompact, { color }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.refresh}>
        <Ionicons name="refresh" size={13} color={color} />
      </View>
    </TouchableOpacity>
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
  refresh: {
    marginLeft: Spacing.xs + 2,
    opacity: 0.75,
  },
});
