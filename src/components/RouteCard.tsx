import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Route } from '../types';
import { Colors, Type, Spacing, Radius, StatusColors, SECTION_GAP } from '../utils/theme';
import { lineForLeg } from '../data/lines';
import { LineStatus, ServiceStatus } from '../utils/liveStatus';
import { journeyMinutes, restrictionLabel } from '../utils/routing';
import TransportChip from './TransportChip';
import LiveArrival from './LiveArrival';
import ModeGlyph from './ModeGlyph';
import OutlinedBox from './ui/OutlinedBox';
import LinkAction from './ui/LinkAction';

interface RouteCardProps {
  route: Route;
  /** The same board the list was ranked with, so a card's total cannot
   *  disagree with its position. */
  live: Record<string, LineStatus>;
  at?: number;
  onPress: () => void;
}

// One full-bleed white section per route, shaped like the reference app's
// list rows: bold navy name, gray meta line, illustration on the right, and
// the key number inside a blue-bordered box with the action beside it.
//
// There were solid blue "Fastest" and "Scenic" badges above the title. The
// reference app carries no status capsule anywhere: rank is expressed by
// order, and the summary row above the list says what the order means. A
// "Fastest" badge was also being printed on lists of one, which is 42% of all
// trips. The only badge left is a live disruption, which is information
// nothing else on the card carries.
export default function RouteCard({ route, live, at, onPress }: RouteCardProps) {

  const isWater  = route.tags.includes('water');
  const isPaid   = route.legs.some(l => l.mode === 'minnie_van');
  const firstLeg = route.legs[0];

  // Worst live disruption across this route's legs
  let disruption: { status: ServiceStatus; name: string } | null = null;
  for (const leg of route.legs) {
    const line = lineForLeg(leg.mode, leg.from, leg.to);
    const st = line ? live[line.id] : null;
    if (st && st.status !== 'operating') {
      if (!disruption || st.status === 'down') {
        disruption = { status: st.status, name: line!.shortName };
      }
    }
  }

  const total = journeyMinutes(route, live);
  const transfers = route.legs.filter(l => l.mode !== 'walk').length - 1;

  // When a route runs is a fact about the route, and it used to be visible
  // nowhere: a trip the clock had hidden simply wasn't in the list, and a
  // trip that only runs after 10 looked, at noon, like it ran all day.
  const restriction = restrictionLabel(route);
  const lastResort = route.tags.includes('last_resort');

  // The paid-ride note used to be a gray capsule above the title. It is a
  // fact about the trip, not a status, so it belongs on the meta line with the
  // other facts about the trip.
  const meta = [
    isPaid ? (route.priceUsd ? `Paid ride · from $${route.priceUsd}` : 'Paid ride') : null,
    transfers > 0 ? `${transfers} transfer${transfers > 1 ? 's' : ''}` : 'No transfers',
    isWater ? 'Water route' : null,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <View style={styles.section}>
        {/* Three things can sit above the name, and all three are facts the
            rest of the card cannot carry: a live disruption, the hours this
            route runs, and a warning that it is far slower than the trips
            listed above it. */}
        {(disruption || restriction || lastResort) && (
          <View style={styles.badgeRow}>
            {disruption && (
              <View style={[
                styles.badge,
                {
                  backgroundColor: StatusColors[disruption.status].bg,
                  borderColor: StatusColors[disruption.status].border,
                },
              ]}>
                <Text style={[styles.badgeText, { color: StatusColors[disruption.status].text }]}>
                  {disruption.status === 'down'
                    ? `${disruption.name} temporarily down`
                    : `${disruption.name} delays`}
                </Text>
              </View>
            )}
            {restriction && (
              <View style={[styles.badge, styles.badgeNeutral]}>
                <Text style={[styles.badgeText, styles.badgeNeutralText]}>{restriction}</Text>
              </View>
            )}
            {lastResort && (
              <View style={[styles.badge, styles.badgeNeutral]}>
                <Text style={[styles.badgeText, styles.badgeNeutralText]}>Last resort</Text>
              </View>
            )}
          </View>
        )}

        {/* Title + illustration */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routeMeta}>{meta}</Text>
          </View>
          <ModeGlyph mode={firstLeg.mode} size={34} tile />
        </View>

        {/* Legs */}
        <View style={styles.chipsRow}>
          {route.legs.map((leg, i) => (
            <TransportChip key={`${leg.mode}-${i}`} mode={leg.mode} />
          ))}
        </View>

        {/* Key number + action, the reference app's signature list component */}
        <OutlinedBox style={styles.box}>
          <View>
            <Text style={styles.boxLabel}>Total Time</Text>
            <Text style={styles.boxValue}>
              {total} <Text style={styles.boxUnit}>min</Text>
            </Text>
          </View>
          <LinkAction label="View Steps" onPress={onPress} />
        </OutlinedBox>

        {/* Live departure for the first leg */}
        {firstLeg.mode !== 'walk' && firstLeg.mode !== 'minnie_van' && (
          <View style={styles.liveRow}>
            <LiveArrival
              mode={firstLeg.mode}
              from={firstLeg.from}
              to={firstLeg.to}
              live={live}
              at={at}
              compact
            />
          </View>
        )}
      </View>
      <View style={styles.gutter} />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    ...Type.caption,
    fontFamily: Type.label.fontFamily,
    color: Colors.textSecondary,
  },
  badgeNeutral: {
    backgroundColor: Colors.statusClosedBg,
    borderColor: Colors.statusClosedBorder,
  },
  badgeNeutralText: {
    color: Colors.statusClosed,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  routeName: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  routeMeta: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  box: {
    marginTop: Spacing.lg,
  },
  boxLabel: {
    ...Type.label,
    color: Colors.textPrimary,
  },
  boxValue: {
    ...Type.stat,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  boxUnit: {
    ...Type.body,
    color: Colors.textSecondary,
  },
  liveRow: {
    marginTop: Spacing.md,
  },
});
