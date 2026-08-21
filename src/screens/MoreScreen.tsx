import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MoreStackParamList } from '../types';
import { Colors, Type, Spacing, Radius, Brand } from '../utils/theme';
import { goToTab, goToMap } from '../utils/navigateTab';
import AppHeader from '../components/AppHeader';
import Divider from '../components/ui/Divider';

interface Tile {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  go: () => void;
}

// The ☰ hub
//
// The reference app opens this tab on a two-column grid of white cards with
// blue icons, followed by a Title Case "My Visit" header over divider-
// separated list rows. The old build opened it on a README explaining the
// app's features to the person already using them, which is the single most
// reliable portfolio-project marker there is.
//
// Every tile here goes somewhere real. Saved and recent trips arrive with
// persistence; until they store something, they would be another control
// whose only behaviour is to apologise.
type Props = { navigation: StackNavigationProp<MoreStackParamList, 'MoreHome'> };

export default function MoreScreen({ navigation }: Props) {
  const tiles: Tile[] = [
    {
      icon: 'alert-circle-outline',
      label: 'Transportation Status',
      go: () => navigation.navigate('Status'),
    },
    {
      icon: 'map-outline',
      label: 'Transit Map',
      go: () => goToMap(navigation.getParent()),
    },
    {
      icon: 'navigate-outline',
      label: 'Plan a Trip',
      go: () => goToTab(navigation.getParent(), 'Planner', { screen: 'Plan' }),
    },
    {
      icon: 'search-outline',
      label: 'Search',
      go: () => goToTab(navigation.getParent(), 'Search'),
    },
    {
      icon: 'bookmark-outline',
      label: 'Saved Trips',
      go: () => navigation.navigate('SavedTrips'),
    },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader plain title="More" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {tiles.map(tile => (
            <TouchableOpacity
              key={tile.label}
              style={styles.tile}
              onPress={tile.go}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
            >
              <Ionicons name={tile.icon} size={30} color={Colors.primaryBlue} />
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>This App</Text>
        </View>

        <View style={styles.list}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.6}
            accessibilityRole="button"
          >
            <Ionicons name="information-circle-outline" size={22} color={Colors.primaryBlue} />
            <Text style={styles.rowLabel}>About {Brand.title}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
          </TouchableOpacity>
          <Divider />
          <View style={styles.row}>
            <Ionicons name="pricetag-outline" size={22} color={Colors.textPlaceholder} />
            <Text style={[styles.rowLabel, styles.rowLabelQuiet]}>Version {Brand.version}</Text>
          </View>
        </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.pageBg,
  },
  tile: {
    // Two per row, with one gap between them.
    width: '48%',
    flexGrow: 1,
    minHeight: 128,
    backgroundColor: Colors.sectionBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  tileLabel: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  listHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  listTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  list: {
    backgroundColor: Colors.sectionBg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  rowLabel: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
  },
  rowLabelQuiet: {
    color: Colors.textSecondary,
  },
});
