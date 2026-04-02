import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Route } from '../types';
import { Colors } from '../utils/theme';
import { getActiveRoutes, applyFilters } from '../utils/routing';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import RouteCard from '../components/RouteCard';
import BottomNav from '../components/BottomNav';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route: navRoute }: Props) {
  const { from, to, filters, timeOverride } = navRoute.params;
  const timeDate = timeOverride ? new Date(timeOverride) : undefined;

  const routes = useMemo(() => {
    const active = getActiveRoutes(from.id, to.id, timeDate);
    return applyFilters(active, filters);
  }, [from.id, to.id, timeOverride, filters]);

  const hasWaterRoutes = routes.some(r => r.tags.includes('water'));
  const showWaterNudge = !filters.noWater && hasWaterRoutes;

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={`${routes.length} route${routes.length !== 1 ? 's' : ''} to ${to.label}`}
        subtitle={`${from.label} → ${to.label}`}
        timeOverride={timeDate ?? null}
        onResetTime={() => {}}
      />

      <TimeBanner
        timeOverride={timeDate ?? null}
        onTimeChange={() => {}}
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
                  <Text style={styles.minnieCtaText}>🚗 Try Minnie Van or Uber/Lyft</Text>
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
                  routeId: r.id, from, to, timeOverride,
                })}
                onSteps={() => navigation.navigate('Detail', {
                  routeId: r.id, from, to, timeOverride,
                })}
              />
            );
          })
        )}

        {showWaterNudge && (
          <View style={styles.waterNudge}>
            <Text style={styles.waterNudgeText}>
              💡 Turn on "No water" to hide boat routes and show land-only alternatives
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav activeTab={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
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
    marginTop: 16,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  minnieCtaText: {
    color: Colors.primaryBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  waterNudge: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  waterNudgeText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    lineHeight: 18,
  },
});
