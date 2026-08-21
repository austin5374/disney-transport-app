import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SectionList, StyleSheet, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Destination } from '../types';
import { DESTINATIONS, DESTINATION_MAP } from '../data/destinations';
import { TRANSIT_LINES, TransitLine } from '../data/lines';
import { destinationSubtitle, matchesQuery } from '../utils/destinationMeta';
import { useLiveStatus, STATUS_LABEL } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius, StatusColors } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import ModeGlyph from '../components/ModeGlyph';
import { goToTab, goToStatus } from '../utils/navigateTab';

// The fourth tab slot
//
// The reference app's bottom bar is Home · Map · ⊕ · Search · More, and those
// five positions are muscle memory for anyone who has used it. The old build
// put a warning glyph in the search position, which reads both as the wrong
// app and as a permanent error state. Transportation status moved to the More
// hub, where the reference keeps its secondary destinations.

const SUGGESTED = ['MK', 'EP', 'HS', 'AK', 'DS', 'TTC'];

type Row =
  | { kind: 'place'; dest: Destination }
  | { kind: 'line'; line: TransitLine };

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const live = useLiveStatus();

  const sections = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return [{
        title: 'Suggested',
        data: SUGGESTED
          .map(id => DESTINATION_MAP[id])
          .filter(Boolean)
          .map<Row>(dest => ({ kind: 'place', dest })),
      }];
    }

    const places = DESTINATIONS
      .filter(d => matchesQuery(d, q))
      .map<Row>(dest => ({ kind: 'place', dest }));

    const lower = q.toLowerCase();
    const lines = TRANSIT_LINES
      .filter(l =>
        l.name.toLowerCase().includes(lower) ||
        l.shortName.toLowerCase().includes(lower) ||
        l.group.toLowerCase().includes(lower) ||
        l.stations.some(s => s.toLowerCase().includes(lower))
      )
      .map<Row>(line => ({ kind: 'line', line }));

    const out: { title: string; data: Row[] }[] = [];
    if (places.length) out.push({ title: 'Places', data: places });
    if (lines.length) out.push({ title: 'Transportation', data: lines });
    return out;
  }, [query]);

  const openPlace = (dest: Destination) => {
    goToTab(navigation, 'Planner', { screen: 'Plan', params: { presetTo: dest.id } });
  };

  return (
    <View style={styles.screen}>
      <AppHeader plain title="Search" />

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textPlaceholder} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search places and transportation"
          placeholderTextColor={Colors.textPlaceholder}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Search places and transportation"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={Colors.textPlaceholder} />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={row => row.kind === 'place' ? `p-${row.dest.id}` : `l-${row.line.id}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          if (item.kind === 'place') {
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={`Plan a trip to ${item.dest.label}`}
                onPress={() => openPlace(item.dest)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.dest.label}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{destinationSubtitle(item.dest)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
              </TouchableOpacity>
            );
          }

          const status = live[item.line.id];
          const sc = status ? StatusColors[status.status] : null;
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`${item.line.name}, view transportation status`}
              onPress={() => goToStatus(navigation)}
            >
              <ModeGlyph mode={item.line.mode} size={30} tile />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={2}>{item.line.name}</Text>
                {status && sc ? (
                  <Text style={[styles.rowSub, { color: sc.text }]} numberOfLines={1}>
                    {STATUS_LABEL[status.status]}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.primaryBlue} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyBody}>
              Nothing on property matches "{query.trim()}". Try a shorter search, or the
              name of a resort, park or monorail beam.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.sectionBg,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.pageBg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchInput: {
    ...Type.body,
    flex: 1,
    color: Colors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as never } : {}),
  },
  list: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: Colors.pageBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  rowSub: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyBody: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
