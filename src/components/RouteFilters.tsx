import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActiveFilters, SortMode } from '../types';
import { Colors, Type, Spacing, Radius } from '../utils/theme';
import AppModal from './AppModal';
import SegmentTabs, { Segment } from './ui/SegmentTabs';
import LinkAction from './ui/LinkAction';
import Divider from './ui/Divider';

interface RouteFiltersProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  /** Hide the sort tabs when there is nothing to sort. */
  showSort: boolean;
}

const SORTS: Segment<SortMode>[] = [
  { key: 'fastest',   label: 'Fastest' },
  { key: 'transfers', label: 'Fewest Transfers' },
  { key: 'scenic',    label: 'Scenic' },
];

const TOGGLES: { key: 'noWater' | 'accessible'; label: string; detail: string }[] = [
  {
    key: 'noWater',
    label: 'No Boats',
    detail: 'Hide any route with a ferry, launch or Friendship Boat leg.',
  },
  {
    key: 'accessible',
    label: 'Step-Free',
    detail: 'Show only routes where every leg is step-free.',
  },
];

// Sorting and filtering are two different jobs
//
// The reference app keeps them apart and this now does too: the order is a
// two-or-three-way choice, so it gets underlined tabs, and the refinements are
// independent switches, so they live behind a filter control alongside a
// "Reset All Filters" link. That icon-button, pill and reset-link row is
// lifted directly from the reference's map filters.
export default function RouteFilters({ filters, onChange, showSort }: RouteFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = TOGGLES.filter(t => filters[t.key]).length;

  const reset = () => onChange({ ...filters, noWater: false, accessible: false });

  return (
    <View style={styles.wrap}>
      {showSort && (
        <SegmentTabs
          items={SORTS}
          value={filters.sort}
          onChange={sort => onChange({ ...filters, sort })}
          accessibilityLabel="Sort routes"
        />
      )}

      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setSheetOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={20} color={Colors.primaryBlue} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setSheetOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.dropdownText}>
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.spacer} />

        {activeCount > 0 && (
          <LinkAction label="Reset All Filters" noChevron onPress={reset} />
        )}
      </View>

      {sheetOpen && (
        <AppModal transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setSheetOpen(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Filters</Text>
                <TouchableOpacity
                  onPress={() => setSheetOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close filters"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.done}>Done</Text>
                </TouchableOpacity>
              </View>

              {TOGGLES.map((toggle, i) => (
                <View key={toggle.key}>
                  {i > 0 && <Divider />}
                  <View style={styles.switchRow}>
                    <View style={styles.switchText}>
                      <Text style={styles.switchLabel}>{toggle.label}</Text>
                      <Text style={styles.switchDetail}>{toggle.detail}</Text>
                    </View>
                    <Switch
                      value={filters[toggle.key]}
                      onValueChange={v => onChange({ ...filters, [toggle.key]: v })}
                      trackColor={{ false: Colors.dividerStrong, true: Colors.primaryBorder }}
                      thumbColor={Platform.OS === 'android' ? Colors.primaryBlue : undefined}
                      ios_backgroundColor={Colors.dividerStrong}
                      accessibilityLabel={toggle.label}
                    />
                  </View>
                </View>
              ))}

              {activeCount > 0 && (
                <View style={styles.sheetFooter}>
                  <LinkAction label="Reset All Filters" noChevron onPress={reset} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </AppModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 38,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
  },
  dropdownText: {
    ...Type.label,
    color: Colors.textPrimary,
  },
  spacer: {
    flex: 1,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  done: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  switchDetail: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
