import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Type, Spacing } from '../../utils/theme';

interface LinkActionProps {
  label: string;
  onPress: () => void;
  /** Hide the trailing chevron for links that don't navigate. */
  noChevron?: boolean;
  style?: ViewStyle;
}

// The reference app's secondary action: blue label, trailing chevron,
// right-aligned in its row. Pairs with PillButton at the foot of a section.
export default function LinkAction({ label, onPress, noChevron, style }: LinkActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityRole="link"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={[styles.row, style]}
    >
      <Text style={styles.label}>{label}</Text>
      {!noChevron && (
        <Ionicons name="chevron-forward" size={16} color={Colors.primaryBlue} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  chevron: {
    marginLeft: Spacing.xs,
    marginTop: 1,
  },
});
