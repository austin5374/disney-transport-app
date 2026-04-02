import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { TransportMode } from '../types';
import { simulateArrival, hasArrivalSim, modeLabel } from '../utils/routing';
import { Colors } from '../utils/theme';

interface LiveArrivalProps {
  mode: TransportMode;
  compact?: boolean;
}

export default function LiveArrival({ mode, compact }: LiveArrivalProps) {
  const [minutes, setMinutes] = useState(() => simulateArrival(mode));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!hasArrivalSim(mode)) return null;

  const refresh = () => setMinutes(simulateArrival(mode));

  const label = mode === 'skyliner'
    ? 'Departing now'
    : `Next ${modeLabel(mode)} in ${minutes} min`;

  return (
    <TouchableOpacity onPress={refresh} activeOpacity={0.7} style={styles.row}>
      <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
      <Text style={[styles.text, compact && styles.textCompact]}>{label}</Text>
      <Text style={styles.refresh}> ↻</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.liveGreen,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    color: Colors.liveGreen,
    fontWeight: '500',
  },
  textCompact: {
    fontSize: 12,
  },
  refresh: {
    fontSize: 13,
    color: Colors.liveGreen,
    opacity: 0.7,
  },
});
