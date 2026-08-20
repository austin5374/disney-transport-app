import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, Destination, ActiveFilters } from '../types';
import { Colors, groupBadgeColors } from '../utils/theme';
import { detectZone, ZONE_TO_DESTINATION } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import FilterPills from '../components/FilterPills';
import DestinationPicker from '../components/DestinationPicker';
import AppModal from '../components/AppModal';
import InfoSheet from '../components/InfoSheet';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Search'> };

const DEFAULT_FILTERS: ActiveFilters = {
  fastestFirst: true,
  scenic:       false,
  noWater:      false,
  accessible:   false,
  noTransfer:   false,
};

type LocationStatus = 'idle' | 'checking' | 'found' | 'not_at_park' | 'denied';

// One-tap "where to" shortcuts shown before a destination is picked, so the
// planner never opens on a blank page. Fixed resort->park pairs (the old
// "Popular routes") only ever helped a visitor already standing at that
// exact resort — everyone else got routes that didn't apply to them. These
// tiles fill in just the destination and reuse whatever "from" is already
// known (current location or a manual pick), so they're useful regardless
// of where the visitor actually is.
const QUICK_DESTINATION_IDS = ['MK', 'EP', 'HS', 'AK', 'DS'];

export default function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [from, setFrom]           = useState<Destination | null>(null);
  const [to, setTo]               = useState<Destination | null>(null);
  const [filters, setFilters]     = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [timeOverride, setTimeOverride] = useState<Date | null>(null);
  const [recent, setRecent]       = useState<Destination[]>([]);
  const [fromPickerOpen, setFromPickerOpen] = useState(false);
  const [toPickerOpen, setToPickerOpen]     = useState(false);
  const [geoSheet, setGeoSheet]   = useState<{ zone: string; dest: Destination } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [sameLocationInfo, setSameLocationInfo] = useState(false);

  // Auto-navigate when both fields filled
  useEffect(() => {
    if (from && to) {
      if (from.id === to.id) {
        setSameLocationInfo(true);
        setTo(null);
        return;
      }
      navigation.navigate('Results', {
        from, to, filters,
        timeOverride: timeOverride?.toISOString(),
      });
    }
  }, [from, to]);

  // Clear the destination whenever the planner regains focus (e.g. backing
  // out of Results/Detail), so the screen returns to a fresh "Where to?"
  // state — with Popular Routes visible — instead of sitting on a stale
  // completed search with nothing else to show.
  useFocusEffect(
    useCallback(() => {
      setTo(null);
    }, [])
  );

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('location timed out')), ms)),
    ]);

  const detectLocation = async (auto: boolean) => {
    setLocationStatus('checking');
    try {
      const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), 4000);
      if (status !== 'granted') {
        setLocationStatus('denied');
        if (!auto) setFromPickerOpen(true);
        return;
      }
      const loc = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        5000
      );
      const zoneId = detectZone(loc.coords.latitude, loc.coords.longitude);
      const destId = zoneId ? ZONE_TO_DESTINATION[zoneId] : null;
      const dest = destId ? DESTINATION_MAP[destId] : null;
      if (zoneId && dest) {
        setLocationStatus('found');
        setGeoSheet({ zone: zoneId, dest });
      } else {
        setLocationStatus('not_at_park');
        if (!auto) setFromPickerOpen(true);
      }
    } catch {
      setLocationStatus('denied');
      if (!auto) setFromPickerOpen(true);
    }
  };

  // Try to place the user automatically as soon as the screen opens
  useEffect(() => {
    detectLocation(true);
  }, []);

  const handleUseMyLocation = () => detectLocation(false);

  const addRecent = (dest: Destination) => {
    setRecent(prev => [dest, ...prev.filter(d => d.id !== dest.id)].slice(0, 5));
  };

  const needsManualLocation = !from && (locationStatus === 'not_at_park' || locationStatus === 'denied');

  const quickDestinations = React.useMemo(
    () => QUICK_DESTINATION_IDS.map(id => DESTINATION_MAP[id]).filter((d): d is Destination => !!d),
    []
  );

  const selectQuickDestination = (dest: Destination) => {
    addRecent(dest);
    setTo(dest);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        timeOverride={timeOverride}
        onResetTime={() => setTimeOverride(null)}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero search: the first thing you should see and tap */}
        <TouchableOpacity
          style={styles.heroSearch}
          onPress={() => setToPickerOpen(true)}
          activeOpacity={0.85}
        >
          <View style={styles.heroIconWrap}>
            <Ionicons name="search" size={20} color={Colors.primaryBlue} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>Where to?</Text>
            <Text style={to ? styles.heroValue : styles.heroPlaceholder} numberOfLines={1}>
              {to?.label ?? 'Search parks, resorts, Disney Springs...'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* From: secondary, defaults toward current location */}
        <View style={styles.fromRow}>
          <View style={styles.fromDotWrap}>
            <View style={[styles.fromDot, needsManualLocation && styles.fromDotWarning]} />
          </View>
          <TouchableOpacity style={styles.fromBody} onPress={() => setFromPickerOpen(true)}>
            <Text
              style={from ? styles.fromValue : needsManualLocation ? styles.fromWarning : styles.fromPlaceholder}
              numberOfLines={1}
            >
              {from
                ? from.label
                : locationStatus === 'checking'
                  ? 'Locating you…'
                  : needsManualLocation
                    ? 'Location unavailable — tap to set manually'
                    : 'Set your starting point'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUseMyLocation} style={styles.locationPill}>
            <Ionicons name="locate" size={12} color={Colors.primaryBlue} />
            <Text style={styles.locationPillText}>Use my location</Text>
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <FilterPills filters={filters} onChange={setFilters} />

        <TimeBanner timeOverride={timeOverride} onTimeChange={setTimeOverride} />

        {/* Quick destinations: fills the destination only, reusing whatever
            "from" is already known — useful no matter where the visitor is,
            unlike a fixed list of resort->park pairs. */}
        {!to && quickDestinations.length > 0 && (
          <View style={styles.popularSection}>
            <Text style={styles.popularTitle}>Quick destinations</Text>
            <View style={styles.quickGrid}>
              {quickDestinations.map(dest => {
                const badge = groupBadgeColors(dest.group);
                return (
                  <TouchableOpacity
                    key={dest.id}
                    style={styles.quickTile}
                    onPress={() => selectQuickDestination(dest)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.quickBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.quickBadgeText, { color: badge.text }]}>{dest.abbrev}</Text>
                    </View>
                    <Text style={styles.quickLabel} numberOfLines={2}>{dest.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>


      {/* Pickers */}
      <DestinationPicker
        visible={fromPickerOpen}
        onClose={() => setFromPickerOpen(false)}
        onSelect={d => { setFrom(d); addRecent(d); }}
        recent={recent}
        excludeId={to?.id}
      />
      <DestinationPicker
        visible={toPickerOpen}
        onClose={() => setToPickerOpen(false)}
        onSelect={d => { setTo(d); addRecent(d); }}
        recent={recent}
        excludeId={from?.id}
      />

      {/* Geofence confirmation sheet */}
      {geoSheet && (
        <AppModal transparent animationType="slide" onRequestClose={() => setGeoSheet(null)}>
          <TouchableOpacity
            style={styles.geoOverlay}
            activeOpacity={1}
            onPress={() => setGeoSheet(null)}
          >
            <View style={styles.geoSheet}>
              <Text style={styles.geoTitle}>It looks like you're at…</Text>
              <Text style={styles.geoLocation}>{geoSheet.dest.label}</Text>
              <Text style={styles.geoSub}>Is that right?</Text>
              <View style={styles.geoButtons}>
                <TouchableOpacity
                  style={styles.geoConfirm}
                  onPress={() => { setFrom(geoSheet.dest); setGeoSheet(null); }}
                >
                  <Text style={styles.geoConfirmText}>Yes, use this location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.geoManual}
                  onPress={() => { setGeoSheet(null); setFromPickerOpen(true); }}
                >
                  <Text style={styles.geoManualText}>Pick manually</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </AppModal>
      )}

      <InfoSheet
        visible={sameLocationInfo}
        title="You're already there!"
        message="Your FROM and TO are the same location."
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
    paddingBottom: 20,
  },
  heroSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.lightBlueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  heroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroPlaceholder: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPlaceholder,
  },
  fromRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  fromDotWrap: {
    width: 46,
    alignItems: 'center',
    marginRight: 14,
  },
  fromDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
    backgroundColor: Colors.cardBg,
  },
  fromDotWarning: {
    borderColor: Colors.statusDown,
  },
  fromBody: {
    flex: 1,
  },
  fromValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  fromPlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fromWarning: {
    fontSize: 14,
    color: Colors.statusDown,
    fontWeight: '500',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    marginLeft: 8,
  },
  locationPillText: {
    color: Colors.primaryBlue,
    fontSize: 11,
    fontWeight: '500',
  },
  geoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  geoSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  geoTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  geoLocation: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  geoSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  geoButtons: {
    width: '100%',
    gap: 10,
  },
  geoConfirm: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  geoConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  geoManual: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  geoManualText: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  popularSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  popularTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickTile: {
    width: 84,
    alignItems: 'center',
  },
  quickBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickBadgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  quickLabel: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
});
