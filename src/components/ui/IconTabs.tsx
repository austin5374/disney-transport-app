import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors, Type, Spacing } from '../../utils/theme';

export interface IconTab<K extends string> {
  key: K;
  label: string;
  /** An Ionicon, for tabs that stand for a view rather than a vehicle. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** A drawn glyph, for tabs that stand for a mode of transport. The reference
   *  app's category rail is illustrated, not iconographic. */
  renderIcon?: () => React.ReactNode;
  /** Rendered after the label, e.g. an advisory count. */
  badge?: number;
}

interface IconTabsProps<K extends string> {
  items: IconTab<K>[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel?: string;
}

// A scrolling rail of icon-over-label tabs with the active one in blue over a
// blue underline. This is the reference app's category rail — Wait Times /
// Dining / Attractions / Entertainment — reproduced for the places this app
// needs to switch between more categories than fit on a phone.
//
// The rail deliberately lets the last item sit half off the edge rather than
// shrinking everything to fit: a partly visible tab is what tells you the row
// scrolls. The reference does exactly this.
export default function IconTabs<K extends string>({
  items, value, onChange, accessibilityLabel,
}: IconTabsProps<K>) {
  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityRole="tablist"
        accessibilityLabel={accessibilityLabel}
      >
        {items.map(item => {
          const active = item.key === value;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onChange(item.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View style={styles.glyph}>
                {item.renderIcon
                  ? item.renderIcon()
                  : item.icon
                    ? <Ionicons
                        name={item.icon}
                        size={24}
                        color={active ? Colors.primaryBlue : Colors.textPrimary}
                      />
                    : null}
              </View>
              <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                {item.label}{item.badge ? ` (${item.badge})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-end',
  },
  tab: {
    minWidth: 92,
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primaryBlue,
  },
  glyph: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Type.label,
    color: Colors.textPrimary,
  },
  labelActive: {
    color: Colors.primaryBlue,
  },
});
