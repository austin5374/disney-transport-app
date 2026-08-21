import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Type, Spacing, Radius } from '../../utils/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

// The reference app's primary action shape: a white pill with a 2px blue
// border and a blue label, sized to its own text and sitting at the left of
// its row, usually paired with a right-aligned LinkAction. "Purchase / Learn
// More", "Buy Tickets / View Guide", "Today's Showtimes / All Hours" are all
// the same component in the same arrangement.
//
// There was a `solid` variant here, used for the planner's submit. A
// full-width filled blue bar is the house style of every SaaS signup form and
// appears nowhere in the reference; it is gone, and this shape is the only
// button in the app. There is exactly one other action shape (LinkAction).
// Resist adding a third.
export default function PillButton({
  label, onPress, disabled, style,
}: PillButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.pill, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.sectionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.sectionBg,
  },
  label: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  labelDisabled: {
    color: Colors.textPlaceholder,
  },
});
