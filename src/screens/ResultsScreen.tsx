import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Route } from '../types';
import { Colors } from '../utils/theme';
import { getActiveRoutes, applyFilters } from '../utils/routing';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import RouteCard from '../components/RouteCard';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route: navRoute }: Props) {
  const { from, to, filters, timeOverride: initialTimeOverride } = navRoute.params;
  const [timeDate, setTimeDate] = useState<Date | null>(
    initialTimeOverride ? new Date(initialTimeOverride) : null
  );

  const routes = useMemo(() => {
    const active = getActiveRoutes(from.id, to.id, timeDate ?? undefined);
    return applyFilters(active, filters);
  }, [from.id, to.id, timeDate, filters]);

  const hasWaterRoutes = routes.some(r => r.tags.includes('water'));
  const showWaterNudge = !filters.noWater && hasWaterRoutes;

  // The planner auto-navigates here the instant both fields are filled, so
  // there's no moment on that screen where both are set and a swap button
  // would do anything visible. This is where "reverse my trip" actually
  // belongs — updates this screen's own params in place.
  const reverseTrip = () => {
    navigation.setParams({ from: to, to: from });
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={`${routes.length} route${routes.length !== 1 ? 's' : ''} to ${to.label}`}
        subtitle={`${from.label} → ${to.label}`}
        timeOverride={timeDate}
        onResetTime={() => setTimeDate(null)}
      />

      <View style={styles.reverseRow}>
        <TouchableOpacity style={styles.reverseChip} onPress={reverseTrip} activeOpacity={0.7}>
          <Ionicons name="swap-vertical" size={13} color={Colors.primaryBlue} />
          <Text style={styles.reverseChipText}>Reverse trip</Text>
        </TouchableOpacity>
      </View>

      <TimeBanner
        timeOverride={timeDate}
        onTimeChange={setTimeDate}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {routes.length === 0 ? (
          <View style={styles.emptyState}>
            {filters.noWater ? (
              <>
                <Text style={styles.emptyTitle}>No land-only routes available</Text>
                <Text style={styles.emptyBody}>
                  Water transport or rideshare is your best option for this trip. Try turning off "No water" to see all routes.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No Disney transport available</Text>
                <Text style={styles.emptyBody}>
                  No direct Disney transport connects these two locations right now.
                </Text>
                <View style={styles.minnieCta}>
                  <Ionicons name="car" size={16} color={Colors.primaryBlue} />
                  <Text style={styles.minnieCtaText}>Try Minnie Van or Uber/Lyft</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          routes.map((r, i) => {
            const isBest   = i === 0 && filters.fastestFirst;
            const isScenic = filters.scenic && (r.tags.includes('water') || r.tags.includes('scenic'));
            return (
              <RouteCard
                key={r.id}
                route={r}
                index={i}
                isBest={isBest}
                isScenic={isScenic}
                onPress={() => navigation.navigate('Detail', {
                  routeData: r, from, to, timeOverride: timeDate?.toISOString(),
                })}
                onSteps={() => navigation.navigate('Detail', {
                  routeData: r, from, to, timeOverride: timeDate?.toISOString(),
                })}
              />
            );
          })
        )}

        {showWaterNudge && (
          <View style={styles.waterNudge}>
            <Ionicons name="bulb-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.waterNudgeText}>
              Turn on "No water" to hide boat routes and show land-only alternatives
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  reverseRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  reverseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reverseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryBlue,
  },
  scroll: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyState: {
    margin: 24,
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  minnieCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  minnieCtaText: {
    color: Colors.primaryBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  waterNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  waterNudgeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
