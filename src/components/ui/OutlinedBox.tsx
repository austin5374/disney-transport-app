import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../../utils/theme';

interface OutlinedBoxProps {
  children: React.ReactNode;
  /** Override the border color for status-tinted variants. */
  color?: string;
  style?: ViewStyle;
}

// The reference app's signature list component: a full-width rounded
// rectangle with a blue border holding the row's key number on the left and
// its action on the right (Standby Line / 20 Minutes ... View Details).
export default function OutlinedBox({ children, color, style }: OutlinedBoxProps) {
  return (
    <View style={[styles.box, color ? { borderColor: color } : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.primaryBlue,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.sectionBg,
  },
});
