import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Type, Spacing } from '../../utils/theme';

export interface Segment<K extends string> {
  key: K;
  label: string;
}

interface SegmentTabsProps<K extends string> {
  items: Segment<K>[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel?: string;
}

// Text tabs under a thick blue underline, the shape the reference app uses for
// any two-or-three-way choice between views ("Attractions & Shows | Dining").
//
// This replaces a horizontally scrolling rail of rounded pills that ran off
// the right edge of every phone width and mixed a three-way sort in with two
// independent on/off filters, as though all five were the same kind of
// control. They are not: one picks an order, the others remove routes.
export default function SegmentTabs<K extends string>({
  items, value, onChange, accessibilityLabel,
}: SegmentTabsProps<K>) {
  return (
    <View style={styles.row} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {items.map(item => {
        const active = item.key === value;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(item.key)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.sectionBg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    // Three tabs have to share a 393-point phone without any of them
    // truncating, so the gutters are tight by design.
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: Colors.divider,
  },
  tabActive: {
    borderBottomColor: Colors.primaryBlue,
  },
  label: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primaryBlue,
  },
});
