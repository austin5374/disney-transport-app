import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ActiveFilters } from '../types';
import { Colors, Type, Spacing } from '../utils/theme';
import { DESTINATION_MAP } from '../data/destinations';
import {
  getActiveRoutes, applyFilters, describeExclusions, describeTimeGaps, hiddenByFilters,
} from '../utils/routing';
import { useLiveStatusAt } from '../utils/liveStatus';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import RouteFilters from '../components/RouteFilters';
import RouteCard from '../components/RouteCard';
import Section from '../components/ui/Section';
import PillButton from '../components/ui/PillButton';
import LinkAction from '../components/ui/LinkAction';

// With the badges gone, the order has to explain itself somewhere. This is
// the line that does it.
const DEFAULT_FILTERS: ActiveFilters = { sort: 'fastest', noWater: false, accessible: false };

const SORT_NOTE: Record<ActiveFilters['sort'], string> = {
  fastest:   'Fastest First',
  transfers: 'Fewest Transfers First',
  scenic:    'Most Scenic First',
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Results'>;
  route: RouteProp<RootStackParamList, 'Results'>;
};

export default function ResultsScreen({ navigation, route: navRoute }: Props) {
  const { fromId, toId, filters: initialFilters, timeOverride: initialTimeOverride } = navRoute.params;
  const from = DESTINATION_MAP[fromId];
  const to = DESTINATION_MAP[toId];
  const [filters, setFilters] = useState<ActiveFilters>(initialFilters ?? DEFAULT_FILTERS);
  const [timeDate, setTimeDate] = useState<Date | null>(
    initialTimeOverride ? new Date(initialTimeOverride) : null
  );

  // One board, computed for whichever moment the planner is showing, used by
  // the ranking, by every card's total and by every countdown. They used to
  // disagree: the order ignored live service entirely, so the top card could
  // be the quickest option in theory while the row beneath it said its line
  // was down.
  const at = timeDate ? timeDate.getTime() : null;
  const live = useLiveStatusAt(at);

  const all = useMemo(
    () => (from && to ? getActiveRoutes(from.id, to.id, timeDate ?? undefined) : []),
    [from, to, timeDate]
  );
  const routes = useMemo(() => applyFilters(all, filters, live), [all, filters, live]);

  // Routes this pair really has that the clock is hiding. Without this the
  // list at 8 AM is simply missing the direct bus and never says so, which is
  // exactly the question a guest planning tomorrow morning is asking.
  const gaps = useMemo(
    () => (from && to ? describeTimeGaps(from.id, to.id, timeDate ?? undefined) : []),
    [from, to, timeDate]
  );

  // Transit options come first; a paid car is never the headline answer.
  const transit = routes.filter(r => !r.legs.some(l => l.mode === 'minnie_van'));
  const paid = routes.filter(r => r.legs.some(l => l.mode === 'minnie_van'));

  // Naming the filters that are actually removing routes, rather than
  // blaming the network for an empty list the user's own settings produced.
  const excluded = describeExclusions(all, filters, live);
  // ...and whether the user's own settings are among them. A list emptied by
  // the clock used to be headlined "Your filters hid every route", over
  // filters that were all switched off.
  const blameFilters = hiddenByFilters(all, filters);

  const clearFilters = () =>
    setFilters({ sort: filters.sort, noWater: false, accessible: false });

  const reverseTrip = () => navigation.setParams({ fromId: toId, toId: fromId });

  // A hand-typed or stale URL can name a place that isn't on the list.
  if (!from || !to) {
    return (
      <View style={styles.screen}>
        <AppHeader showBack onBack={() => navigation.goBack()} title="Trip Not Found" />
        <Section flush={false}>
          <Text style={styles.emptyTitle}>We don't know that place</Text>
          <Text style={styles.emptyBody}>
            This link points at a location that isn't on Walt Disney World property.
            Start a new trip and we'll find you a route.
          </Text>
        </Section>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={to.label}
        subtitle={`From ${from.label}`}
      />

      {/* A sort control that cannot change the order is worse than no control:
          42% of all pairs on this network return a single transit option. */}
      <RouteFilters filters={filters} onChange={setFilters} showSort={all.length > 2} />
      <TimeBanner timeOverride={timeDate} onTimeChange={setTimeDate} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {transit.length === 0
              ? 'No Transit Options'
              : transit.length === 1
                ? '1 Transit Option'
                : `${transit.length} Transit Options · ${SORT_NOTE[filters.sort]}`}
          </Text>
          <LinkAction label="Reverse Trip" onPress={reverseTrip} noChevron />
        </View>

        {gaps.map(gap => (
          <View key={gap.window} style={styles.planAheadRow}>
            <Text style={styles.planAheadText}>
              Planning ahead? {gap.count} more route{gap.count === 1 ? '' : 's'}{' '}
              {gap.count === 1 ? 'runs' : 'run'} {gap.window}.
            </Text>
            <LinkAction
              label={`Show ${gap.at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
              onPress={() => setTimeDate(gap.at)}
              noChevron
            />
          </View>
        ))}

        {transit.length === 0 && (
          <Section flush={false}>
            {excluded.length > 0 ? (
              <>
                <Text style={styles.emptyTitle}>
                  {blameFilters ? 'Your filters hid every route' : 'Nothing is running yet'}
                </Text>
                <Text style={styles.emptyBody}>
                  {excluded.join(' ')}
                  {blameFilters
                    ? ' Turn a filter off to see the rest.'
                    : ' Try a later time to see how this trip works once service starts.'}
                </Text>
                {blameFilters && (
                  <PillButton label="Clear Filters" onPress={clearFilters} style={styles.emptyBtn} />
                )}
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

        {transit.map(r => (
          <RouteCard
            key={r.id}
            route={r}
            live={live}
            at={at ?? undefined}
            onPress={() => navigation.navigate('Detail', {
              fromId, toId, routeId: r.id, timeOverride: timeDate?.toISOString(),
            })}
          />
        ))}

        {paid.length > 0 && (
          <>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>Other Ways to Get There</Text>
              <Text style={styles.groupSub}>Paid rides, not included with your stay</Text>
            </View>
            {paid.map(r => (
              <RouteCard
                key={r.id}
                route={r}
                live={live}
                at={at ?? undefined}
                onPress={() => navigation.navigate('Detail', {
                  fromId, toId, routeId: r.id, timeOverride: timeDate?.toISOString(),
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
    ...Type.label,
    color: Colors.textSecondary,
  },
  planAheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planAheadText: {
    ...Type.bodySmall,
    flex: 1,
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
    ...Type.title,
    color: Colors.textPrimary,
  },
  groupSub: {
    ...Type.caption,
    color: Colors.textPlaceholder,
    marginTop: 2,
  },
});
