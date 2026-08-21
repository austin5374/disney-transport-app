import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ActiveFilters } from '../types';
import { Colors, Type, Spacing } from '../utils/theme';
import { getActiveRoutes, applyFilters, describeExclusions } from '../utils/routing';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import FilterPills from '../components/FilterPills';
import RouteCard from '../components/RouteCard';
import Section from '../components/ui/Section';
import PillButton from '../components/ui/PillButton';
import LinkAction from '../components/ui/LinkAction';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route: navRoute }: Props) {
  const { from, to, filters: initialFilters, timeOverride: initialTimeOverride } = navRoute.params;
  const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
  const [timeDate, setTimeDate] = useState<Date | null>(
    initialTimeOverride ? new Date(initialTimeOverride) : null
  );

  const all = useMemo(
    () => getActiveRoutes(from.id, to.id, timeDate ?? undefined),
    [from.id, to.id, timeDate]
  );
  const routes = useMemo(() => applyFilters(all, filters), [all, filters]);

  // Transit options come first; a paid car is never the headline answer.
  const transit = routes.filter(r => !r.legs.some(l => l.mode === 'minnie_van'));
  const paid = routes.filter(r => r.legs.some(l => l.mode === 'minnie_van'));

  // Naming the filters that are actually removing routes, rather than
  // blaming the network for an empty list the user's own settings produced.
  const excluded = describeExclusions(all, filters);

  const clearFilters = () =>
    setFilters({ sort: filters.sort, noWater: false, accessible: false });

  const reverseTrip = () => navigation.setParams({ from: to, to: from });

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={to.label}
        subtitle={`From ${from.label}`}
      />

      <FilterPills filters={filters} onChange={setFilters} />
      <TimeBanner timeOverride={timeDate} onTimeChange={setTimeDate} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {transit.length > 0
              ? `${transit.length} transit option${transit.length === 1 ? '' : 's'}`
              : 'No transit options'}
          </Text>
          <LinkAction label="Reverse Trip" onPress={reverseTrip} noChevron />
        </View>

        {transit.length === 0 && (
          <Section flush={false}>
            {excluded.length > 0 ? (
              <>
                <Text style={styles.emptyTitle}>Your filters hid every route</Text>
                <Text style={styles.emptyBody}>
                  {excluded.join(' ')} Turn a filter off to see the rest.
                </Text>
                <PillButton label="Clear Filters" onPress={clearFilters} style={styles.emptyBtn} />
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>No Disney transport on this route</Text>
                <Text style={styles.emptyBody}>
                  Disney does not connect {from.label} and {to.label} directly, and no
                  reasonable transfer exists at this time of day.
                </Text>
              </>
            )}
          </Section>
        )}

        {transit.map((r, i) => (
          <RouteCard
            key={r.id}
            route={r}
            isBest={i === 0 && filters.sort === 'fastest'}
            isScenic={i === 0 && filters.sort === 'scenic'}
            onPress={() => navigation.navigate('Detail', {
              routeData: r, from, to, timeOverride: timeDate?.toISOString(),
            })}
          />
        ))}

        {paid.length > 0 && (
          <>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>Other Ways To Get There</Text>
              <Text style={styles.groupSub}>Paid rides, not included with your stay</Text>
            </View>
            {paid.map(r => (
              <RouteCard
                key={r.id}
                route={r}
                onPress={() => navigation.navigate('Detail', {
                  routeData: r, from, to, timeOverride: timeDate?.toISOString(),
                })}
              />
            ))}
          </>
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  summaryText: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyBody: {
    ...Type.body,
    color: Colors.textSecondary,
  },
  emptyBtn: {
    marginTop: Spacing.lg,
  },
  groupHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  groupTitle: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
  },
  groupSub: {
    ...Type.caption,
    color: Colors.textPlaceholder,
    marginTop: 2,
  },
});
