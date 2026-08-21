import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Type, Spacing } from '../../utils/theme';

export interface Stat {
  label: string;
  value: string;
}

interface StatRowProps {
  items: Stat[];
}

// The parts that add up to a headline number
//
// These were six full-height StatBlocks stacked down the screen, about 470
// points of scrolling before the reader reached a single direction. The
// reference app uses the tall centered treatment at most three times on a
// page and only for facts that have nowhere better to live. A journey's wait,
// ride, walk and transfer counts are one fact in four parts, so they read as
// one row.
export default function StatRow({ items }: StatRowProps) {
  return (
    <View style={styles.row}>
      {items.map(item => (
        <View key={item.label} style={styles.cell}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  value: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  label: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
