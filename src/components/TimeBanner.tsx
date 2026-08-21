import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppModal from './AppModal';
import { Colors, Type, Spacing, Radius } from '../utils/theme';
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
  const [pickerValue, setPickerValue] = useState(new Date());

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
          onPress={() => { setPickerValue(timeOverride ?? new Date()); setShowPicker(true); }}
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
        <AppModal transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Plan for a different time</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)} accessibilityRole="button">
                  <Text style={styles.done}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  if (date) {
                    setPickerValue(date);
                    onTimeChange(date);
                    if (Platform.OS === 'android') setShowPicker(false);
                  }
                }}
                style={styles.picker}
              />
            </View>
          </TouchableOpacity>
        </AppModal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,44,75,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.sectionBg,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: Spacing.xxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  done: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  picker: {
    width: '100%',
  },
});
