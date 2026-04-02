import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ActiveFilters } from '../types';
import { Colors } from '../utils/theme';

interface FilterPillsProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

const PILLS: { key: keyof ActiveFilters; label: string }[] = [
  { key: 'fastestFirst', label: 'Fastest first' },
  { key: 'scenic',       label: 'Scenic'        },
  { key: 'noWater',      label: 'No water'      },
  { key: 'accessible',   label: 'Accessible'    },
  { key: 'noTransfer',   label: 'No transfer'   },
];

export default function FilterPills({ filters, onChange }: FilterPillsProps) {
  const toggle = (key: keyof ActiveFilters) => {
    const next = { ...filters, [key]: !filters[key] };
    // fastestFirst and scenic are mutually exclusive
    if (key === 'fastestFirst' && next.fastestFirst) next.scenic = false;
    if (key === 'scenic'       && next.scenic)       next.fastestFirst = false;
    onChange(next);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {PILLS.map(({ key, label }) => {
        const active = filters[key];
        return (
          <TouchableOpacity
            key={key}
            onPress={() => toggle(key)}
            style={[styles.pill, active && styles.pillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pillActive: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderColor: Colors.gold,
  },
  pillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pillTextActive: {
    color: Colors.warnText,
  },
});
