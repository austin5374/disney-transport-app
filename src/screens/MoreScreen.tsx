import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Brand, Gradients } from '../utils/theme';

const ROWS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  {
    icon: 'pulse-outline',
    title: 'Live status board',
    body: 'Every monorail, Skyliner, boat, and bus line with current service level, next departures, and crowd levels. Statuses update automatically.',
  },
  {
    icon: 'navigate-outline',
    title: 'Trip planner',
    body: 'Point-to-point routing between every park, resort, and Disney Springs, with time-of-day rules (park-to-park buses after 10 AM, Blue Flag launches after 3 PM, and more).',
  },
  {
    icon: 'map-outline',
    title: 'Transit map',
    body: 'A schematic map of the monorail, Skyliner, and watercraft network. Tap a line in the legend to highlight it and see its live status.',
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient colors={Gradients.sky} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.brand}>{Brand.name}</Text>
        <Text style={styles.headerTitle}>About</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{Brand.name}</Text>
          <Text style={styles.heroSub}>{Brand.tagline}</Text>
        </View>

        {ROWS.map(r => (
          <View key={r.title} style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={r.icon} size={20} color={Colors.primaryBlue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{r.title}</Text>
              <Text style={styles.rowBody}>{r.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Demo notice</Text>
          <Text style={styles.disclaimerBody}>
            This app is a technology demo. All service statuses, wait times, arrival estimates,
            and crowd levels are simulated. Disney does not publish a public transportation API,
            so no data here reflects actual operations.{'\n\n'}
            Route structure (monorail lines, Skyliner stations, boat launches, and bus patterns)
            is modeled on the real Walt Disney World transportation network as documented by
            official guides and guest resources.{'\n\n'}
            {Brand.name} is an unofficial fan project. It is not affiliated with, endorsed by,
            or sponsored by The Walt Disney Company. All Disney park, resort, and attraction
            names are trademarks of their respective owners and are used solely for
            identification.
          </Text>
        </View>

        <Text style={styles.version}>Version 2.0 · simulated data</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  brand: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primaryBlue,
    letterSpacing: 0.5,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.lightBlueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  rowBody: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  disclaimer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  disclaimerBody: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  version: {
    textAlign: 'center',
    fontSize: 11.5,
    color: Colors.textPlaceholder,
    marginTop: 18,
  },
});
