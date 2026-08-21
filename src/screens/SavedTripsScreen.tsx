import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MoreStackParamList, ActiveFilters } from '../types';
import { DESTINATION_MAP } from '../data/destinations';
import { useSavedTrips, removeSavedTrip } from '../utils/savedTrips';
import { goToTab } from '../utils/navigateTab';
import { Colors, Type, Spacing } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import Divider from '../components/ui/Divider';
import PillButton from '../components/ui/PillButton';

type Props = { navigation: StackNavigationProp<MoreStackParamList, 'SavedTrips'> };

const DEFAULT_FILTERS: ActiveFilters = { sort: 'fastest', noWater: false, accessible: false };

export default function SavedTripsScreen({ navigation }: Props) {
  const trips = useSavedTrips();

  const open = (fromId: string, toId: string) => {
    const from = DESTINATION_MAP[fromId];
    const to = DESTINATION_MAP[toId];
    if (!from || !to) return;
    // A saved trip stores the question, so the answer is recomputed from
    // current service every time it is opened.
    goToTab(navigation.getParent(), 'Planner', {
      screen: 'Results',
      params: { fromId: from.id, toId: to.id, filters: DEFAULT_FILTERS },
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader showBack onBack={() => navigation.goBack()} title="Saved Trips" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {trips.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={34} color={Colors.textPlaceholder} />
            <Text style={styles.emptyTitle}>No saved trips yet</Text>
            <Text style={styles.emptyBody}>
              Save a trip from its directions screen and it will wait here, ready to
              re-check against the day's service.
            </Text>
            <PillButton
              label="Plan a Trip"
              onPress={() => goToTab(navigation.getParent(), 'Planner', { screen: 'Plan' })}
              style={styles.emptyBtn}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {trips.map((trip, i) => {
              const from = DESTINATION_MAP[trip.fromId];
              const to = DESTINATION_MAP[trip.toId];
              if (!from || !to) return null;
              return (
                <View key={`${trip.fromId}-${trip.toId}`}>
                  {i > 0 && <Divider />}
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.rowMain}
                      onPress={() => open(trip.fromId, trip.toId)}
                      activeOpacity={0.6}
                      accessibilityRole="button"
                      accessibilityLabel={`Directions from ${from.label} to ${to.label}`}
                    >
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {from.label} <Text style={styles.rowTo}>to</Text> {to.label}
                      </Text>
                      <Text style={styles.rowSub}>Tap to check today's service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeSavedTrip(trip.fromId, trip.toId)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${from.label} to ${to.label}`}
                    >
                      <Ionicons name="close" size={22} color={Colors.textPlaceholder} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  scroll: {
    paddingBottom: Spacing.xl,
  },
  list: {
    backgroundColor: Colors.sectionBg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  rowTo: {
    color: Colors.textSecondary,
  },
  rowSub: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xxl,
    backgroundColor: Colors.sectionBg,
  },
  emptyTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  emptyBody: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: Spacing.sm,
  },
});
