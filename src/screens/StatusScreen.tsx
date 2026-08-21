import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Platform,
} from 'react-native';
import { TRANSIT_LINES, LineGroup } from '../data/lines';
import { useLiveStatus, refreshLiveStatus, getTemporaryBridges } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import StatusCard from '../components/StatusCard';
import BusTimesPanel from '../components/BusTimesPanel';
import TemporaryBridgeCard from '../components/TemporaryBridgeCard';
import Section from '../components/ui/Section';

type Filter = LineGroup | 'All' | 'Advisories';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'All',        label: 'All' },
  { key: 'Advisories', label: 'Advisories' },
  { key: 'Monorail',   label: 'Monorail' },
  { key: 'Skyliner',   label: 'Skyliner' },
  { key: 'Boats',      label: 'Boats' },
  { key: 'Buses',      label: 'Buses' },
];

const ORDER: LineGroup[] = ['Monorail', 'Skyliner', 'Boats', 'Buses'];

function Skeleton() {
  return (
    <>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={skStyles.section}>
          <View style={[skStyles.bar, { width: '55%' }]} />
          <View style={[skStyles.bar, { width: '80%', height: 10, marginTop: 10 }]} />
          <View style={[skStyles.bar, { width: '35%', height: 10, marginTop: 10 }]} />
          <View style={[skStyles.bar, { width: '100%', height: 44, marginTop: 16, borderRadius: 12 }]} />
        </View>
      ))}
    </>
  );
}

export default function StatusScreen() {
  const live = useLiveStatus();
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 500);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refreshLiveStatus();
    setTimeout(() => setRefreshing(false), 500);
  };

  const disrupted = useMemo(
    () => TRANSIT_LINES.filter(l => live[l.id] && live[l.id].status !== 'operating'),
    [live]
  );
  const bridges = useMemo(() => getTemporaryBridges(live), [live]);
  const updated = new Date(Object.values(live)[0]?.updatedAt ?? Date.now());

  const visibleGroups = filter === 'All' || filter === 'Advisories'
    ? ORDER
    : ORDER.filter(g => g === filter);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Transportation Status"
        subtitle={
          disrupted.length === 0
            ? 'All lines operating normally'
            : `${disrupted.length} line${disrupted.length === 1 ? '' : 's'} with advisories`
        }
      />

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            const count = f.key === 'Advisories' ? disrupted.length : 0;
            if (f.key === 'Advisories' && count === 0) return null;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}{count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          Platform.OS === 'web'
            ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryBlue} />
        }
      >
        <TouchableOpacity
          style={styles.updatedRow}
          onPress={onRefresh}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Refresh transportation status"
        >
          <Text style={styles.updatedText}>
            Updated {updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {' · '}
            <Text style={styles.updatedLink}>
              {Platform.OS === 'web' ? 'Tap to refresh' : 'Pull to refresh'}
            </Text>
          </Text>
        </TouchableOpacity>

        {booting ? (
          <Skeleton />
        ) : filter === 'Advisories' ? (
          <>
            {disrupted.map(l => <StatusCard key={l.id} line={l} status={live[l.id]} />)}
            {bridges.map(b => <TemporaryBridgeCard key={b.id} bridge={b} />)}
          </>
        ) : (
          <>
            {/* Disruptions are pinned to the top rather than buried nineteen
                cards down under a header that only counts them. */}
            {filter === 'All' && disrupted.length > 0 && (
              <>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>Service Advisories</Text>
                </View>
                {disrupted.map(l => <StatusCard key={`adv-${l.id}`} line={l} status={live[l.id]} />)}
              </>
            )}

            {visibleGroups.map(g => {
              const lines = TRANSIT_LINES.filter(
                l => l.group === g && (filter !== 'All' || live[l.id]?.status === 'operating')
              );
              const groupBridges = g === 'Buses' ? bridges : [];
              if (lines.length === 0 && groupBridges.length === 0 && g !== 'Buses') return null;
              return (
                <View key={g}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{g}</Text>
                  </View>
                  {groupBridges.map(b => <TemporaryBridgeCard key={b.id} bridge={b} />)}
                  {lines.map(l => <StatusCard key={l.id} line={l} status={live[l.id]} />)}
                  {g === 'Buses' && <BusTimesPanel />}
                </View>
              );
            })}
          </>
        )}

        <Section last>
          <Text style={styles.footnote}>
            Service levels, departure estimates, and crowd levels in ParkWays are modeled,
            not live operational data. Not affiliated with The Walt Disney Company.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  filterBar: {
    backgroundColor: Colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.sectionBg,
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  chipText: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textOnDark,
  },
  scroll: {
    paddingBottom: Spacing.xl,
  },
  updatedRow: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  updatedText: {
    ...Type.caption,
    color: Colors.textSecondary,
  },
  updatedLink: {
    ...Type.label,
    color: Colors.primaryBlue,
  },
  groupHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  groupTitle: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
  },
  footnote: {
    ...Type.caption,
    color: Colors.textPlaceholder,
    textAlign: 'center',
    lineHeight: 19,
  },
});

const skStyles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    padding: Spacing.lg,
    marginBottom: 8,
  },
  bar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.divider,
  },
});
