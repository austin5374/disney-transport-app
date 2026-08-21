import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Type, Spacing, Radius } from '../../utils/theme';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  /** Filled blue instead of outlined — for the single strongest action on a screen. */
  solid?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// The reference app's primary action shape: a white pill with a 2px blue
// border and a blue label. There is exactly one other action shape in that
// app (LinkAction) and nothing else. Resist adding a third.
export default function PillButton({
  label, onPress, solid, disabled, style,
}: PillButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.pill,
        solid && styles.solid,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, solid && styles.labelSolid, disabled && styles.labelDisabled]}>
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
  solid: {
    backgroundColor: Colors.primaryBlue,
  },
  disabled: {
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.sectionBg,
  },
  label: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  labelSolid: {
    color: Colors.textOnDark,
  },
  labelDisabled: {
    color: Colors.textPlaceholder,
  },
});
