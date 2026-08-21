import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import TimePickerSheet from './TimePickerSheet';
import { Colors, Type, Spacing } from '../utils/theme';
import { getTimeBannerMessage } from '../utils/routing';

interface TimeBannerProps {
  timeOverride: Date | null;
  onTimeChange: (date: Date | null) => void;
}

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// A quiet inline row rather than a bordered callout. It only earns space when
// the time actually changes what the planner will show, or when the user has
// deliberately overridden it.
export default function TimeBanner({ timeOverride, onTimeChange }: TimeBannerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const effectiveTime = timeOverride ?? new Date();
  const advisory = getTimeBannerMessage(effectiveTime);

  if (!advisory && !timeOverride) return null;

  return (
    <>
      <View style={styles.row}>
        <Ionicons
          name={advisory ? 'information-circle-outline' : 'time-outline'}
          size={18}
          color={advisory ? Colors.statusDelayed : Colors.textSecondary}
        />
        <Text style={[styles.text, advisory && styles.textAdvisory]}>
          {advisory ?? `Showing routes for ${fmt(effectiveTime)}`}
        </Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
        >
          <Text style={styles.link}>Change</Text>
        </TouchableOpacity>
        {timeOverride && (
          <TouchableOpacity
            onPress={() => onTimeChange(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear time override"
          >
            <Ionicons name="close" size={17} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <TimePickerSheet
          value={timeOverride ?? new Date()}
          onChange={onTimeChange}
          onClose={() => setShowPicker(false)}
          onClear={timeOverride ? () => onTimeChange(null) : undefined}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  text: {
    ...Type.bodySmall,
    flex: 1,
    color: Colors.textSecondary,
  },
  textAdvisory: {
    color: Colors.textPrimary,
  },
  link: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
});
