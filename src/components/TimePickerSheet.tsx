import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppModal from './AppModal';
import { Colors, Type, Spacing, Radius } from '../utils/theme';

interface TimePickerSheetProps {
  /** The time the sheet opens on. */
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
  /** Cleared back to the real clock. Omitted when there is nothing to clear. */
  onClear?: () => void;
}

// A time picker that exists
//
// This sheet used to render @react-native-community/datetimepicker, which has
// no web implementation: on native it drew a spinner, and on the web build —
// the one the demo link points at — it rendered nothing at all. The modal
// opened onto a title and a Done button, and the whole "plan for a different
// time" feature was dead in the only place anyone could try it.
//
// Rebuilt out of plain views, so it behaves identically everywhere. The
// presets carry most of the weight: the times that change what the network
// offers are few and known, and "before the buses start" is a far more useful
// thing to ask for than 8:37.
const PRESETS: { label: string; hint: string; hour: number; minute: number }[] = [
  { label: 'Early morning', hint: 'Before park-to-park buses start', hour: 9,  minute: 0 },
  { label: 'Mid-morning',   hint: 'Full service',                    hour: 10, minute: 30 },
  { label: 'Afternoon',     hint: 'Park buses to Disney Springs run', hour: 16, minute: 30 },
  { label: 'Late evening',  hint: 'Some lines have stopped',          hour: 22, minute: 30 },
];

const HOUR_STEP = 1;
const MINUTE_STEP = 15;

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function withClock(base: Date, hour: number, minute: number): Date {
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export default function TimePickerSheet({
  value, onChange, onClose, onClear,
}: TimePickerSheetProps) {
  const [draft, setDraft] = useState(value);

  const activePreset = useMemo(
    () => PRESETS.find(p => p.hour === draft.getHours() && p.minute === draft.getMinutes()),
    [draft]
  );

  const shift = (minutes: number) => {
    const next = new Date(draft.getTime() + minutes * 60_000);
    // Keep the picker on one day: this asks "what time", not "which date".
    setDraft(withClock(draft, next.getHours(), next.getMinutes()));
  };

  const commit = () => { onChange(draft); onClose(); };

  return (
    <AppModal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* Swallow taps inside the sheet so they don't dismiss it. */}
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Plan for a different time</Text>
            <TouchableOpacity onPress={commit} accessibilityRole="button">
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.readoutRow}>
            <Stepper
              label="Back 15 minutes"
              icon="remove"
              onPress={() => shift(-MINUTE_STEP)}
            />
            <View style={styles.readout}>
              <Text style={styles.readoutValue} accessibilityLabel={`Planning for ${fmt(draft)}`}>
                {fmt(draft)}
              </Text>
              <Text style={styles.readoutHint}>
                {activePreset ? activePreset.hint : 'Routes will be shown for this time'}
              </Text>
            </View>
            <Stepper
              label="Forward 15 minutes"
              icon="add"
              onPress={() => shift(MINUTE_STEP)}
            />
          </View>

          <View style={styles.hourRow}>
            <TouchableOpacity
              onPress={() => shift(-60 * HOUR_STEP)}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.hourAction}>− 1 hour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => shift(60 * HOUR_STEP)}
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.hourAction}>+ 1 hour</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.groupLabel}>Times that change what runs</Text>
          {PRESETS.map(preset => {
            const active = activePreset?.label === preset.label;
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.preset, active && styles.presetActive]}
                onPress={() => setDraft(withClock(draft, preset.hour, preset.minute))}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <View style={styles.presetText}>
                  <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                    {preset.label} · {fmt(withClock(draft, preset.hour, preset.minute))}
                  </Text>
                  <Text style={styles.presetHint}>{preset.hint}</Text>
                </View>
                {active && <Ionicons name="checkmark" size={20} color={Colors.primaryBlue} />}
              </TouchableOpacity>
            );
          })}

          {onClear && (
            <TouchableOpacity
              style={styles.clear}
              onPress={() => { onClear(); onClose(); }}
              accessibilityRole="button"
            >
              <Text style={styles.clearLabel}>Use the current time instead</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </AppModal>
  );
}

function Stepper({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.stepper}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon as never} size={22} color={Colors.primaryBlue} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.sm,
  },
  title: {
    ...Type.label,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  cancel: {
    ...Type.action,
    color: Colors.textSecondary,
  },
  done: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  readout: {
    flex: 1,
    alignItems: 'center',
  },
  readoutValue: {
    ...Type.display,
    color: Colors.textPrimary,
  },
  readoutHint: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  stepper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  hourAction: {
    ...Type.label,
    color: Colors.primaryBlue,
  },
  groupLabel: {
    ...Type.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  presetActive: {
    backgroundColor: Colors.primaryTint,
  },
  presetText: {
    flex: 1,
  },
  presetLabel: {
    ...Type.label,
    color: Colors.textPrimary,
  },
  presetLabelActive: {
    color: Colors.primaryBlue,
  },
  presetHint: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  clear: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  clearLabel: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
});
