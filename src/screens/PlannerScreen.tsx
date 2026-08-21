import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootStackParamList, Destination, ActiveFilters } from '../types';
import { Colors, Type, Spacing, Radius, StatusColors } from '../utils/theme';
import { detectDestination } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import { TRANSIT_LINES } from '../data/lines';
import { useLiveStatus } from '../utils/liveStatus';
import { goToMap, goToStatus } from '../utils/navigateTab';
import { shortLabel } from '../utils/destinationMeta';
import { usePersistentState, StorageKeys } from '../utils/storage';
import HomeBanner from '../components/HomeBanner';
import TimeBanner from '../components/TimeBanner';
import GetDirectionsSheet from '../components/GetDirectionsSheet';
import ModeGlyph from '../components/ModeGlyph';
import ModeScene from '../components/ModeScene';
import Section from '../components/ui/Section';
import PillButton from '../components/ui/PillButton';
import LinkAction from '../components/ui/LinkAction';
import Divider from '../components/ui/Divider';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Plan'>;
  route: RouteProp<RootStackParamList, 'Plan'>;
};

const DEFAULT_FILTERS: ActiveFilters = {
  sort: 'fastest',
  noWater: false,
  accessible: false,
};

// Trips people actually take.
const POPULAR: { from: string; to: string }[] = [
  { from: 'POLY', to: 'MK' },
  { from: 'CBR',  to: 'HS' },
  { from: 'MK',   to: 'EP' },
  { from: 'POP',  to: 'DS' },
];

type LocationStatus = 'idle' | 'checking' | 'not_at_park' | 'denied';

function greeting(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Home is a feed, not a form
//
// The reference app's home screen is a scrolling stack of full-bleed cards: a
// greeting card overlapping an illustrated banner, then one card per thing
// worth doing, each with a headline, a line or two of body, an outlined pill
// on the left and a text link on the right.
//
// This screen used to be the From/To form itself — which is the one component
// the reference deliberately puts behind a modal, reached from elsewhere. The
// form now lives in GetDirectionsSheet where it belongs, and the greeting card
// is the door to it.
export default function PlannerScreen({ navigation, route: navRoute }: Props) {
  const [from, setFrom] = useState<Destination | null>(null);
  const [to, setTo] = useState<Destination | null>(null);
  const [timeOverride, setTimeOverride] = useState<Date | null>(null);
  // Recents survive a reload now. They were React state and nothing else, so
  // every refresh handed the user a blank app that had never met them.
  const [recent, setRecent] = usePersistentState<Destination[]>(StorageKeys.recents, []);
  const [sheet, setSheet] = useState<null | 'from' | 'to'>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');

  const reset = navRoute.params?.reset;
  useEffect(() => {
    if (reset === undefined) return;
    setFrom(null);
    setTo(null);
    setTimeOverride(null);
    setLocationStatus('idle');
    setSheet('from');
  }, [reset]);

  // The search tab hands over a destination id, so tapping a place there lands
  // on a part-filled trip rather than a blank one. Consumed once, then cleared
  // from the route so a later back-navigation doesn't re-apply it.
  const presetTo = navRoute.params?.presetTo;
  useEffect(() => {
    if (!presetTo) return;
    const dest = DESTINATION_MAP[presetTo];
    navigation.setParams({ presetTo: undefined });
    if (!dest) return;
    setTo(dest);
    setFrom(prev => (prev && prev.id === dest.id ? null : prev));
    setRecent(prev => [dest, ...prev.filter(d => d.id !== dest.id)].slice(0, 5));
    setSheet('from');
  }, [presetTo, navigation]);

  const live = useLiveStatus();
  const advisories = useMemo(
    () => TRANSIT_LINES.filter(l => {
      const st = live[l.id]?.status;
      return st === 'down' || st === 'delayed';
    }),
    [live]
  );

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('location timed out')), ms)),
    ]);

  // Only ever runs from an explicit tap. Firing a permission prompt on first
  // paint, before the user has done anything, is the fastest way to get a
  // permanent block.
  const detectLocation = useCallback(async () => {
    setLocationStatus('checking');
    try {
      const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), 4000);
      if (status !== 'granted') { setLocationStatus('denied'); return; }
      const loc = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        5000
      );
      const id = detectDestination(loc.coords.latitude, loc.coords.longitude);
      const dest = id ? DESTINATION_MAP[id] : null;
      if (dest) {
        setLocationStatus('idle');
        setFrom(dest);
        setRecent(prev => [dest, ...prev.filter(d => d.id !== dest.id)].slice(0, 5));
      } else {
        setLocationStatus('not_at_park');
      }
    } catch {
      setLocationStatus('denied');
    }
  }, []);

  const search = (a: Destination, b: Destination) => {
    setSheet(null);
    setRecent(prev => [b, a, ...prev.filter(d => d.id !== a.id && d.id !== b.id)].slice(0, 5));
    navigation.navigate('Results', {
      fromId: a.id, toId: b.id, filters: DEFAULT_FILTERS,
      timeOverride: timeOverride?.toISOString(),
    });
  };

  const locationHint =
    locationStatus === 'checking'    ? 'Locating you…' :
    locationStatus === 'denied'      ? 'Location unavailable. Choose a starting point below.' :
    locationStatus === 'not_at_park' ? "You don't appear to be on property. Choose a starting point below." :
    null;

  const tripSummary = from && to
    ? `${shortLabel(from.id)} to ${shortLabel(to.id)}`
    : from ? `From ${shortLabel(from.id)}`
    : to ? `To ${shortLabel(to.id)}`
    : 'Where to today?';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <HomeBanner />

        {/* The greeting card, overlapping the banner's bottom edge exactly as
            the reference's "Hello, Austin!" card does. */}
        <View style={styles.greetingWrap}>
          <View style={styles.greetingCard}>
            <View style={styles.greetingRow}>
              <View style={styles.avatar}>
                <ModeGlyph mode="monorail_express" size={30} />
              </View>
              <View style={styles.greetingText}>
                <Text style={styles.greetingHello}>{greeting(new Date().getHours())}</Text>
                <Text style={styles.greetingTrip} numberOfLines={2}>{tripSummary}</Text>
              </View>
            </View>

            {locationHint ? <Text style={styles.hint}>{locationHint}</Text> : null}

            <View style={styles.actionRow}>
              <PillButton
                label={from && to ? 'See Routes' : 'Get Directions'}
                onPress={() => {
                  if (from && to) search(from, to);
                  else setSheet(from ? 'to' : 'from');
                }}
              />
              <LinkAction label="Use My Location" noChevron onPress={detectLocation} />
            </View>
          </View>
        </View>

        <TimeBanner timeOverride={timeOverride} onTimeChange={setTimeOverride} />

        {/* A disruption is the one thing worth interrupting the feed for. */}
        {advisories.length > 0 && (
          <Section header="Service Advisories" flush>
            {advisories.slice(0, 3).map((line, i) => {
              const st = live[line.id];
              const sc = StatusColors[st.status];
              return (
                <View key={line.id}>
                  {i > 0 && <Divider />}
                  <View style={styles.advisoryRow}>
                    <ModeGlyph mode={line.mode} size={26} tile />
                    <View style={styles.advisoryText}>
                      <Text style={styles.advisoryName} numberOfLines={2}>{line.name}</Text>
                      <Text style={[styles.advisoryDetail, { color: sc.text }]} numberOfLines={2}>
                        {st.detail ?? (st.status === 'down' ? 'Temporarily down' : 'Running with delays')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={styles.sectionFooter}>
              <LinkAction
                label="All Transportation Status"
                onPress={() => goToStatus(navigation.getParent())}
              />
            </View>
          </Section>
        )}

        <Section header="Popular Trips" flush>
          {POPULAR.map((trip, i) => {
            const a = DESTINATION_MAP[trip.from];
            const b = DESTINATION_MAP[trip.to];
            if (!a || !b) return null;
            return (
              <View key={`${trip.from}-${trip.to}`}>
                {i > 0 && <Divider />}
                <TouchableOpacity
                  style={styles.popularRow}
                  onPress={() => { setFrom(a); setTo(b); search(a, b); }}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                >
                  <Text style={styles.popularText} numberOfLines={1}>
                    {shortLabel(a.id)} <Text style={styles.popularArrow}>to</Text> {shortLabel(b.id)}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
                </TouchableOpacity>
              </View>
            );
          })}
        </Section>

        {/* A full-bleed card with art, a headline, body copy, and the
            pill-and-link pair. This is the reference app's promo card. */}
        <View style={styles.promo}>
          <ModeScene mode="skyliner" height={130} />
          <View style={styles.promoBody}>
            <Text style={styles.promoTitle}>Transit Map</Text>
            <Text style={styles.promoText}>
              Every monorail beam, Skyliner line and boat route on one diagram, with
              live service on each of them.
            </Text>
            <View style={styles.actionRow}>
              <PillButton label="Open Map" onPress={() => goToMap(navigation.getParent())} />
              <LinkAction
                label="Service Status"
                onPress={() => goToStatus(navigation.getParent())}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <GetDirectionsSheet
        visible={sheet !== null}
        initialField={sheet ?? 'from'}
        from={from}
        to={to}
        recent={recent}
        locationHint={locationHint}
        onClose={() => setSheet(null)}
        onDraftChange={(a, b) => { setFrom(a); setTo(b); }}
        onUseMyLocation={detectLocation}
        onSubmit={search}
      />
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
  greetingWrap: {
    paddingHorizontal: Spacing.lg,
    // Pulls the card up over the banner's lower edge.
    marginTop: -Spacing.xxl,
    marginBottom: Spacing.md,
  },
  greetingCard: {
    backgroundColor: Colors.sectionBg,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    shadowColor: '#0E2C4B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    flex: 1,
  },
  greetingHello: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
  },
  greetingTrip: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  hint: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  advisoryText: {
    flex: 1,
  },
  advisoryName: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  advisoryDetail: {
    ...Type.bodySmall,
    marginTop: 1,
  },
  sectionFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  popularRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  popularText: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
  },
  popularArrow: {
    color: Colors.textSecondary,
  },
  promo: {
    backgroundColor: Colors.sectionBg,
  },
  promoBody: {
    padding: Spacing.lg,
  },
  promoTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  promoText: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
