import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransportMode } from '../types';
import { transportColor } from '../utils/theme';
import { modeLabel } from '../utils/routing';

interface TransportChipProps {
  mode: TransportMode;
}

export default function TransportChip({ mode }: TransportChipProps) {
  const color = transportColor(mode);
  return (
    <View style={[styles.chip, { borderColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{modeLabel(mode)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#fff',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
