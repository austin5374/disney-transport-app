import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Type, Spacing } from '../../utils/theme';

export interface ActionItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

interface ActionRowProps {
  items: ActionItem[];
}

// The reference app's detail-page header: an evenly split row of icon-over-
// label actions divided by vertical hairlines (Find on Map | Get Directions |
// Add to My Plans). Two or three items; beyond that the labels wrap badly.
export default function ActionRow({ items }: ActionRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={styles.rule} />}
          <TouchableOpacity
            style={styles.item}
            onPress={item.onPress}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Ionicons name={item.icon} size={26} color={Colors.primaryBlue} />
            <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  rule: {
    width: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.xs,
  },
  label: {
    ...Type.label,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
