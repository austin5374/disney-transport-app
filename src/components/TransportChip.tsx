import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TransportMode } from '../types';
import { Colors, Type, Spacing, Radius, transportColor } from '../utils/theme';
import { modeLabel } from '../utils/routing';

interface TransportChipProps {
  mode: TransportMode;
}

// A quiet, neutral chip carrying a line-colored dot. The old version drew a
// colored border and colored label for every mode, which turned a route with
// three legs into three competing accent colors.
export default function TransportChip({ mode }: TransportChipProps) {
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: transportColor(mode) }]} />
      <Text style={styles.label}>{modeLabel(mode)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.pageBg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs + 2,
  },
  label: {
    ...Type.caption,
    color: Colors.textPrimary,
  },
});
