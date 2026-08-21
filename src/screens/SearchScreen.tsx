import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootStackParamList, Destination, ActiveFilters } from '../types';
import { Colors, Type, Spacing, Radius, StatusColors, Brand } from '../utils/theme';
import { detectZone, ZONE_TO_DESTINATION } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import { TRANSIT_LINES } from '../data/lines';
import { useLiveStatus } from '../utils/liveStatus';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import FilterPills from '../components/FilterPills';
import DestinationPicker from '../components/DestinationPicker';
import AppModal from '../components/AppModal';
import InfoSheet from '../components/InfoSheet';
import Section from '../components/ui/Section';
import PillButton from '../components/ui/PillButton';
import LinkAction from '../components/ui/LinkAction';
import Divider from '../components/ui/Divider';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Search'>;
  route: RouteProp<RootStackParamList, 'Search'>;
};

const DEFAULT_FILTERS: ActiveFilters = {
  sort: 'fastest',
  noWater: false,
  accessible: false,
};

// Trips people actually take, used to fill what was previously half a screen
// of empty space below the form.
const POPULAR: { from: string; to: string }[] = [
  { from: 'POLY', to: 'MK' },
  { from: 'CBR',  to: 'HS' },
  { from: 'MK',   to: 'EP' },
  { from: 'POP',  to: 'DS' },
];

type LocationStatus = 'idle' | 'checking' | 'not_at_park' | 'denied';

export default function SearchScreen({ navigation, route: navRoute }: Props) {
  const [from, setFrom] = useState<Destination | null>(null);
  const [to, setTo] = useState<Destination | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [timeOverride, setTimeOverride] = useState<Date | null>(null);
  const [recent, setRecent] = useState<Destination[]>([]);
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [geoSheet, setGeoSheet] = useState<Destination | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [sameLocationInfo, setSameLocationInfo] = useState(false);

  // The tab bar's center action bumps this timestamp to clear the form.
  const reset = navRoute.params?.reset;
  useEffect(() => {
    if (reset === undefined) return;
    setFrom(null);
    setTo(null);
    setFilters(DEFAULT_FILTERS);
    setTimeOverride(null);
    setLocationStatus('idle');
  }, [reset]);

  const live = useLiveStatus();
  const advisories = useMemo(
    () => TRANSIT_LINES.filter(l => live[l.id] && live[l.id].status !== 'operating'),
    [live]
  );

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('location timed out')), ms)),
    ]);

  // Only ever runs from an explicit tap. Firing a permission prompt on first
  // paint, before the user has done anything, is the fastest way to get a
  // permanent block — and when it was denied the old screen showed nothing at
  // all, leaving the origin field stuck on its placeholder forever.
  const detectLocation = async () => {
    setLocationStatus('checking');
    try {
      const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), 4000);
      if (status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      const loc = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        5000
      );
      const zoneId = detectZone(loc.coords.latitude, loc.coords.longitude);
      const dest = zoneId ? DESTINATION_MAP[ZONE_TO_DESTINATION[zoneId]] : null;
      if (dest) {
        setLocationStatus('idle');
        setGeoSheet(dest);
      } else {
        setLocationStatus('not_at_park');
      }
    } catch {
      setLocationStatus('denied');
    }
  };

  const addRecent = (dest: Destination) => {
    setRecent(prev => [dest, ...prev.filter(d => d.id !== dest.id)].slice(0, 5));
  };

  const select = (dest: Destination) => {
    addRecent(dest);
    if (picker === 'from') {
      if (to && to.id === dest.id) setTo(null);
      setFrom(dest);
    } else {
      if (from && from.id === dest.id) {
        setSameLocationInfo(true);
        return;
      }
      setTo(dest);
    }
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const search = (a: Destination, b: Destination) => {
    navigation.navigate('Results', {
      from: a, to: b, filters, timeOverride: timeOverride?.toISOString(),
    });
  };

  const locationHint =
    locationStatus === 'checking'   ? 'Locating you…' :
    locationStatus === 'denied'     ? 'Location unavailable. Choose a starting point below.' :
    locationStatus === 'not_at_park'? "You don't appear to be on property. Choose a starting point below." :
    null;

  const ready = !!from && !!to;

  return (
    <View style={styles.screen}>
      <AppHeader title={Brand.name} subtitle={Brand.tagline} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Trip form — underlined fields with floating labels and a swap
            control, the shape the reference app's Get Directions sheet uses. */}
        <View style={styles.tripSection}>
          <View style={styles.tripBody}>
            <View style={styles.gutter}>
              <Ionicons name="navigate" size={16} color={Colors.textPlaceholder} />
              <View style={styles.gutterDots}>
                {[0, 1, 2, 3].map(i => <View key={i} style={styles.gutterDot} />)}
              </View>
              <Ionicons
                name="star"
                size={16}
                color={to ? Colors.primaryBlue : Colors.textPlaceholder}
              />
            </View>

            <View style={styles.fields}>
              <TouchableOpacity
                style={styles.field}
                onPress={() => setPicker('from')}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="Choose starting point"
              >
                <Text style={styles.fieldLabel}>From</Text>
                <Text
                  style={[styles.fieldValue, !from && styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {from ? from.label : 'Walt Disney World Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.field, styles.fieldLast]}
                onPress={() => setPicker('to')}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel="Choose destination"
              >
                <Text style={styles.fieldLabel}>To</Text>
                <Text
                  style={[styles.fieldValue, !to && styles.fieldPlaceholder]}
                  numberOfLines={1}
                >
                  {to ? to.label : 'Walt Disney World Location'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={swap}
              disabled={!from && !to}
              style={styles.swapBtn}
              accessibilityRole="button"
              accessibilityLabel="Swap origin and destination"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="swap-vertical"
                size={22}
                color={from || to ? Colors.primaryBlue : Colors.textPlaceholder}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.locateRow}
            onPress={detectLocation}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Ionicons name="locate" size={18} color={Colors.primaryBlue} />
            <Text style={styles.locateText}>Use My Location</Text>
          </TouchableOpacity>

          {locationHint ? <Text style={styles.locationHint}>{locationHint}</Text> : null}

          {/* An explicit submit. The old screen navigated only when both
              fields happened to be filled, so a user who picked a destination
              while location was denied sat on a completed form with no action
              and no explanation. */}
          <View style={styles.submitRow}>
            <PillButton
              label="Get Directions"
              solid
              disabled={!ready}
              onPress={() => { if (from && to) search(from, to); }}
              style={styles.submitBtn}
            />
            {!ready && (
              <Text style={styles.submitHint}>
                {!from && !to ? 'Choose where you are and where you are going.'
                  : !from ? 'Choose a starting point.'
                  : 'Choose a destination.'}
              </Text>
            )}
          </View>
        </View>

        <FilterPills filters={filters} onChange={setFilters} />
        <TimeBanner timeOverride={timeOverride} onTimeChange={setTimeOverride} />
        <View style={styles.gutterGap} />

        {/* Live advisories — the planner is the app's landing tab, and a
            disruption is the one thing worth interrupting it for. */}
        {advisories.length > 0 && (
          <Section eyebrow="Service Advisories" flush>
            {advisories.slice(0, 3).map((line, i) => {
              const st = live[line.id];
              const sc = StatusColors[st.status];
              return (
                <View key={line.id}>
                  {i > 0 && <Divider />}
                  <View style={styles.advisoryRow}>
                    <View style={[styles.advisoryDot, { backgroundColor: sc.text }]} />
                    <View style={styles.advisoryText}>
                      <Text style={styles.advisoryName}>{line.name}</Text>
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
                onPress={() => navigation.getParent()?.navigate('Status' as never)}
              />
            </View>
          </Section>
        )}

        <Section eyebrow="Popular Trips" flush>
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
                    {a.label} <Text style={styles.popularArrow}>to</Text> {b.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
                </TouchableOpacity>
              </View>
            );
          })}
        </Section>

        <Section eyebrow="Explore" flush last>
          <TouchableOpacity
            style={styles.popularRow}
            onPress={() => navigation.getParent()?.navigate('Map' as never)}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.popularText}>Transit Map</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity
            style={styles.popularRow}
            onPress={() => navigation.getParent()?.navigate('Status' as never)}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Text style={styles.popularText}>Transportation Status</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
          </TouchableOpacity>
        </Section>
      </ScrollView>

      <DestinationPicker
        visible={picker !== null}
        title={picker === 'from' ? 'Where From?' : 'Where To?'}
        onClose={() => setPicker(null)}
        onSelect={select}
        recent={recent}
        excludeId={picker === 'from' ? to?.id : from?.id}
      />

      {geoSheet && (
        <AppModal transparent animationType="slide" onRequestClose={() => setGeoSheet(null)}>
          <TouchableOpacity
            style={styles.geoOverlay}
            activeOpacity={1}
            onPress={() => setGeoSheet(null)}
          >
            <View style={styles.geoSheet}>
              <Text style={styles.geoTitle}>It looks like you are at</Text>
              <Text style={styles.geoLocation}>{geoSheet.label}</Text>
              <PillButton
                label="Use This Location"
                solid
                onPress={() => { setFrom(geoSheet); setGeoSheet(null); }}
                style={styles.geoBtn}
              />
              <PillButton
                label="Choose Another"
                onPress={() => { setGeoSheet(null); setPicker('from'); }}
                style={styles.geoBtn}
              />
            </View>
          </TouchableOpacity>
        </AppModal>
      )}

      <InfoSheet
        visible={sameLocationInfo}
        title="You are already there"
        message="Your starting point and destination are the same location."
        onClose={() => setSameLocationInfo(false)}
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
  tripSection: {
    backgroundColor: Colors.sectionBg,
    paddingTop: Spacing.lg,
  },
  tripBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  gutter: {
    width: 20,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  gutterDots: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: Spacing.xs,
  },
  gutterDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dividerStrong,
  },
  fields: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  field: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primaryBorder,
    marginBottom: Spacing.md,
  },
  fieldLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    ...Type.caption,
    color: Colors.textSecondary,
  },
  fieldValue: {
    ...Type.body,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  fieldPlaceholder: {
    color: Colors.textPlaceholder,
  },
  swapBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  locateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  locateText: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  locationHint: {
    ...Type.caption,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  submitRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  submitBtn: {
    alignSelf: 'stretch',
  },
  submitHint: {
    ...Type.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  gutterGap: {
    height: 8,
    backgroundColor: Colors.pageBg,
  },
  advisoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  advisoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  advisoryText: {
    flex: 1,
  },
  advisoryName: {
    ...Type.action,
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
  geoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14,44,75,0.45)',
    justifyContent: 'flex-end',
  },
  geoSheet: {
    backgroundColor: Colors.sectionBg,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.sm,
    alignItems: 'center',
    gap: Spacing.md,
  },
  geoTitle: {
    ...Type.body,
    color: Colors.textSecondary,
  },
  geoLocation: {
    ...Type.title,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  geoBtn: {
    alignSelf: 'stretch',
  },
});
