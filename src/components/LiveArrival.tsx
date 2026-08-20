import React, { useRef, useEffect, useState } from 'react';
import { Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { TransportMode } from '../types';
import { simulateArrival, hasArrivalSim, modeLabel } from '../utils/routing';
import { lineForLeg } from '../data/lines';
import { useLiveStatus, refreshLiveStatus } from '../utils/liveStatus';
import { Colors } from '../utils/theme';

interface LiveArrivalProps {
  mode: TransportMode;
  from?: string;
  to?: string;
  compact?: boolean;
}

export default function LiveArrival({ mode, from, to, compact }: LiveArrivalProps) {
  const live = useLiveStatus();
  const [fallbackMinutes, setFallbackMinutes] = useState(() => simulateArrival(mode));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  if (!hasArrivalSim(mode)) return null;

  const line = from && to ? lineForLeg(mode, from, to) : null;
  const status = line ? live[line.id] : null;

  let label: string;
  let color = Colors.liveGreen;

  if (status?.status === 'down') {
    label = status.etaMinutes
      ? `${line!.shortName} down — est. ${status.etaMinutes} min`
      : `${line!.shortName} temporarily down`;
    color = Colors.statusDown;
  } else if (status?.status === 'delayed') {
    const next = status.nextArrivals[0];
    label = next != null && line!.headwayMinutes[1] > 1
      ? `Delays — next in ~${next} min`
      : 'Running with delays';
    color = Colors.statusDelayed;
  } else if (status && line) {
    if (line.headwayMinutes[1] <= 1) {
      label = 'Boarding now';
    } else {
      const next = status.nextArrivals[0];
      label = next == null || next === 0
        ? `${modeLabel(mode)} arriving now`
        : `Next ${modeLabel(mode)} in ${next} min`;
    }
  } else {
    label = mode === 'skyliner'
      ? 'Boarding now'
      : `Next ${modeLabel(mode)} in ${fallbackMinutes} min`;
  }

  const refresh = () => {
    refreshLiveStatus();
    setFallbackMinutes(simulateArrival(mode));
  };

  return (
    <TouchableOpacity onPress={refresh} activeOpacity={0.7} style={styles.row}>
      <Animated.View style={[styles.dot, { opacity: pulseAnim, backgroundColor: color }]} />
      <Text style={[styles.text, compact && styles.textCompact, { color }]}>{label}</Text>
      <Text style={[styles.refresh, { color }]}> ↻</Text>
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
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  textCompact: {
    fontSize: 12,
  },
  refresh: {
    fontSize: 13,
    opacity: 0.7,
  },
});
