import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../utils/theme';

/** Hairline row separator, inset from the left the way list dividers are in
 *  the reference app. Pass `full` for an edge-to-edge rule. */
export default function Divider({ full }: { full?: boolean }) {
  return <View style={[styles.line, full && styles.full]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: Spacing.lg,
  },
  full: {
    marginLeft: 0,
  },
});
