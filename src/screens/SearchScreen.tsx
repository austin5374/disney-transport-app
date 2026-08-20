import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, Destination, ActiveFilters } from '../types';
import { Colors } from '../utils/theme';
import { detectZone, ZONE_TO_DESTINATION } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import AppHeader from '../components/AppHeader';
import TimeBanner from '../components/TimeBanner';
import FilterPills from '../components/FilterPills';
import DestinationPicker from '../components/DestinationPicker';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Search'> };

const DEFAULT_FILTERS: ActiveFilters = {
  fastestFirst: true,
  scenic:       false,
  noWater:      false,
  accessible:   false,
  noTransfer:   false,
};

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

  // Auto-navigate when both fields filled
  useEffect(() => {
    if (from && to) {
      if (from.id === to.id) {
        Alert.alert("You're already there!", "FROM and TO are the same location.");
        setTo(null);
        return;
      }
      navigation.navigate('Results', {
        from, to, filters,
        timeOverride: timeOverride?.toISOString(),
      });
    }
  }, [from, to]);

  const handleUseMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setFromPickerOpen(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const zoneId = detectZone(loc.coords.latitude, loc.coords.longitude);
      if (!zoneId) {
        setFromPickerOpen(true);
        return;
      }
      const destId = ZONE_TO_DESTINATION[zoneId];
      const dest   = DESTINATION_MAP[destId];
      if (dest) {
        setGeoSheet({ zone: zoneId, dest });
      } else {
        setFromPickerOpen(true);
      }
    } catch {
      setFromPickerOpen(true);
    }
  };

  const addRecent = (dest: Destination) => {
    setRecent(prev => [dest, ...prev.filter(d => d.id !== dest.id)].slice(0, 5));
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        timeOverride={timeOverride}
        onResetTime={() => setTimeOverride(null)}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TimeBanner timeOverride={timeOverride} onTimeChange={setTimeOverride} />

        {/* Input card */}
        <View style={styles.inputCard}>
          {/* FROM */}
          <View style={styles.inputRow}>
            <View style={styles.dotCol}>
              <View style={styles.dotFrom} />
              <View style={styles.dotLine} />
            </View>
            <View style={styles.inputBody}>
              <Text style={styles.inputLabel}>From</Text>
              <TouchableOpacity
                onPress={() => setFromPickerOpen(true)}
                style={styles.inputTouchable}
              >
                <Text style={from ? styles.inputValue : styles.inputPlaceholder}>
                  {from?.label ?? 'Current location or pick...'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleUseMyLocation} style={styles.locationPill}>
              <Text style={styles.locationPillText}>⊙ Use my location</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputDivider} />

          {/* TO */}
          <View style={styles.inputRow}>
            <View style={styles.dotCol}>
              <View style={styles.dotTo} />
            </View>
            <TouchableOpacity
              style={styles.inputBody}
              onPress={() => setToPickerOpen(true)}
            >
              <Text style={styles.inputLabel}>To</Text>
              <Text style={to ? styles.inputValue : styles.inputPlaceholder}>
                {to?.label ?? 'Where to?'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter pills */}
        <FilterPills filters={filters} onChange={setFilters} />

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✨ Live-aware routing</Text>
          <Text style={styles.infoBody}>
            Routes adjust to the time of day and current service status — a delayed or down line is flagged right on its route card. Check the Status tab for the full board.
          </Text>
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
        <Modal transparent animationType="slide" onRequestClose={() => setGeoSheet(null)}>
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
        </Modal>
      )}
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
  inputCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginTop: 14,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dotCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  dotFrom: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryBlue,
  },
  dotLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardBorder,
    marginTop: 3,
  },
  dotTo: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: Colors.liveGreen,
  },
  inputBody: {
    flex: 1,
  },
  inputTouchable: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  inputValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  inputPlaceholder: {
    fontSize: 15,
    color: Colors.textPlaceholder,
  },
  locationPill: {
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
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginLeft: 48,
  },
  infoCard: {
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 14,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primaryBlue,
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
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
});
