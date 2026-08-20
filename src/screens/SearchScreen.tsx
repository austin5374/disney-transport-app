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

  const fromText = from
    ? from.label
    : locationStatus === 'checking'
      ? 'Locating you…'
      : 'Walt Disney World Location';

  const swapFromTo = () => {
    const prevFrom = from;
    setFrom(to);
    setTo(prevFrom);
  };

  const goToTab = (tab: 'Status' | 'Map') => navigation.getParent()?.navigate(tab as never);

  return (
    <View style={styles.screen}>
      <AppHeader
        timeOverride={timeOverride}
        onResetTime={() => setTimeOverride(null)}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Trip card: From and To in one connected control, with a swap
            button — the standard get-directions layout (Apple/Google Maps),
            instead of a big "Where to?" search bar with a separate, lesser
            "from" row bolted on underneath. */}
        <View style={styles.tripCard}>
          <View style={styles.tripIcons}>
            <View style={styles.tripDot} />
            <View style={styles.tripConnector} />
            <Ionicons
              name="location"
              size={15}
              color={to ? groupBadgeColors(to.group).text : Colors.textPlaceholder}
            />
          </View>

          <View style={styles.tripFields}>
            <View style={styles.tripFieldRow}>
              <TouchableOpacity style={styles.tripFieldTap} onPress={() => setFromPickerOpen(true)} activeOpacity={0.7}>
                <Text style={styles.tripLabel}>From</Text>
                <Text
                  style={[styles.tripValue, !from && styles.tripValuePlaceholder]}
                  numberOfLines={1}
                >
                  {fromText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUseMyLocation}
                style={styles.tripLocateBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="locate" size={16} color={Colors.primaryBlue} />
              </TouchableOpacity>
            </View>

            <View style={styles.tripDivider} />

            <TouchableOpacity style={styles.tripFieldRow} onPress={() => setToPickerOpen(true)} activeOpacity={0.7}>
              <View style={styles.tripFieldTap}>
                <Text style={styles.tripLabel}>To</Text>
                <Text style={[styles.tripValue, !to && styles.tripValuePlaceholder]} numberOfLines={1}>
                  {to?.label ?? 'Search parks, resorts, and more!'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={swapFromTo}
            style={styles.tripSwapBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="swap-vertical" size={19} color={Colors.primaryBlue} />
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <FilterPills filters={filters} onChange={setFilters} />

        <TimeBanner timeOverride={timeOverride} onTimeChange={setTimeOverride} />

        {/* Quick actions: shortcuts to the app's other core views, instead of
            a directory of destinations that just duplicates the search
            fields above. */}
        <View style={styles.actionsSection}>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionCol} onPress={() => goToTab('Status')} activeOpacity={0.7}>
              <Ionicons name="pulse-outline" size={22} color={Colors.primaryBlue} />
              <Text style={styles.actionLabel}>Live Status</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionCol} onPress={() => goToTab('Map')} activeOpacity={0.7}>
              <Ionicons name="map-outline" size={22} color={Colors.primaryBlue} />
              <Text style={styles.actionLabel}>Transit Map</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity style={styles.actionCol} onPress={handleUseMyLocation} activeOpacity={0.7}>
              <Ionicons name="locate-outline" size={22} color={Colors.primaryBlue} />
              <Text style={styles.actionLabel}>Use My Location</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  tripCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  tripIcons: {
    width: 16,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 3,
  },
  tripDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 2,
    borderColor: Colors.primaryBlue,
    backgroundColor: Colors.cardBg,
  },
  tripConnector: {
    flex: 1,
    width: 0,
    marginVertical: 4,
    borderLeftWidth: 1.5,
    borderLeftColor: Colors.cardBorder,
    borderStyle: 'dashed',
  },
  tripFields: {
    flex: 1,
    marginLeft: 14,
  },
  tripFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripFieldTap: {
    flex: 1,
    paddingVertical: 8,
  },
  tripLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  tripValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  tripValuePlaceholder: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  tripDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  tripLocateBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBlueTint,
  },
  tripSwapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 6,
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
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  actionsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 16,
  },
  actionCol: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  actionLabel: {
    fontSize: 12,
    color: Colors.primaryBlue,
    fontWeight: '600',
    textAlign: 'center',
  },
});
