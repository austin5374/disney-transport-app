import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Type, Spacing } from '../../utils/theme';

interface StatBlockProps {
  label: string;
  value: string;
  /** Suppress the divider below (for the last block in a stack). */
  last?: boolean;
}

// The reference app's detail-page body: a small gray centered label above a
// large navy centered value, separated by hairlines. Hours / Ages /
// Entertainment Type all use this exact shape.
export default function StatBlock({ label, value, last }: StatBlockProps) {
  return (
    <View style={[styles.block, !last && styles.bordered]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  label: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Type.stat,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
