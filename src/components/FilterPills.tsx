import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActiveFilters, SortMode } from '../types';
import { Colors, Type, Spacing, Radius } from '../utils/theme';

interface FilterPillsProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

// Sort is a three-way choice, not three independent switches. The old version
// had a "Fastest first" toggle whose off-state changed nothing, because the
// sort fell through to the same comparator either way.
const SORTS: { key: SortMode; label: string }[] = [
  { key: 'fastest',   label: 'Fastest' },
  { key: 'transfers', label: 'Fewest transfers' },
  { key: 'scenic',    label: 'Scenic' },
];

const TOGGLES: { key: 'noWater' | 'accessible'; label: string }[] = [
  { key: 'noWater',    label: 'No boats' },
  { key: 'accessible', label: 'Step-free' },
];

export default function FilterPills({ filters, onChange }: FilterPillsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SORTS.map(({ key, label }) => {
          const active = filters.sort === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange({ ...filters, sort: key })}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.75}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.separator} />

        {TOGGLES.map(({ key, label }) => {
          const active = filters[key];
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onChange({ ...filters, [key]: !active })}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.75}
              accessibilityRole="switch"
              accessibilityState={{ checked: active }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* The row runs past the right edge on every phone width. Without this
          the last pill is sliced mid-word with no hint that it scrolls. */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', Colors.sectionBg]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
        style={styles.fade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    backgroundColor: Colors.sectionBg,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    paddingRight: Spacing.xxl + Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.xs,
    backgroundColor: Colors.divider,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sectionBg,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
  },
  pillActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  pillText: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.textOnDark,
  },
  fade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Spacing.xxl,
  },
});
