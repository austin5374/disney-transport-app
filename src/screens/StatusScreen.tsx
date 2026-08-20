import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TRANSIT_LINES, LineGroup } from '../data/lines';
import { useLiveStatus, refreshLiveStatus } from '../utils/liveStatus';
import { Colors, Brand } from '../utils/theme';
import StatusCard from '../components/StatusCard';
import BusTimesPanel from '../components/BusTimesPanel';

const GROUPS: { key: LineGroup | 'All'; label: string }[] = [
  { key: 'All',      label: 'All' },
  { key: 'Monorail', label: 'Monorail' },
  { key: 'Skyliner', label: 'Skyliner' },
  { key: 'Boats',    label: 'Boats' },
  { key: 'Buses',    label: 'Buses' },
];

function Skeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map(i => (
        <View key={i} style={skStyles.card}>
          <View style={skStyles.stripe} />
          <View style={{ flex: 1, padding: 12 }}>
            <View style={[skStyles.bar, { width: '55%' }]} />
            <View style={[skStyles.bar, { width: '80%', height: 8, marginTop: 8 }]} />
            <View style={[skStyles.bar, { width: '35%', height: 8, marginTop: 8 }]} />
          </View>
        </View>
      ))}
    </>
  );
}

export default function StatusScreen() {
  const insets = useSafeAreaInsets();
  const live = useLiveStatus();
  const [group, setGroup] = useState<LineGroup | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [booting, setBooting] = useState(true);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 700);
    const c = setInterval(() => setClock(Date.now()), 30_000);
    return () => { clearTimeout(t); clearInterval(c); };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    refreshLiveStatus();
    setTimeout(() => setRefreshing(false), 600);
  };

  const lines = useMemo(
    () => TRANSIT_LINES.filter(l => group === 'All' || l.group === group),
    [group]
  );

  const disrupted = TRANSIT_LINES.filter(l => live[l.id]?.status !== 'operating');
  const updated = new Date(Object.values(live)[0]?.updatedAt ?? clock);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.brand}>{Brand.name}</Text>
        <Text style={styles.headerTitle}>Transportation Status</Text>
        <Text style={styles.headerSub}>
          {disrupted.length === 0
            ? 'All systems operating normally'
            : `${disrupted.length} ${disrupted.length === 1 ? 'line' : 'lines'} with service advisories`}
        </Text>
      </View>

      {/* Group filter */}
      <View style={styles.chipsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {GROUPS.map(g => {
            const active = group === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setGroup(g.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryBlue} />}
      >
        {booting ? (
          <Skeleton />
        ) : (
          <>
            <Text style={styles.updated}>
              Updated {updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · pull to refresh
            </Text>

            {(['Monorail', 'Skyliner', 'Boats', 'Buses'] as LineGroup[])
              .filter(g => group === 'All' || group === g)
              .map(g => (
                <View key={g}>
                  <Text style={styles.sectionTitle}>{g}</Text>
                  {lines.filter(l => l.group === g).map(l =>
                    live[l.id] ? <StatusCard key={l.id} line={l} status={live[l.id]} /> : null
                  )}
                  {g === 'Buses' && <BusTimesPanel />}
                </View>
              ))}

            <Text style={styles.footnote}>
              Unofficial demo — all status and arrival data is simulated. Not affiliated with
              or endorsed by The Walt Disney Company.
            </Text>
          </>
        )}
        <View style={{ height: 24 }} />
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
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 3,
  },
  chipsWrap: {
    backgroundColor: Colors.primaryBlue,
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  chipActive: {
    backgroundColor: '#fff',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  chipTextActive: {
    color: Colors.primaryBlue,
  },
  scroll: {
    paddingBottom: 12,
  },
  updated: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
  },
  footnote: {
    fontSize: 11,
    color: Colors.textPlaceholder,
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 20,
    lineHeight: 16,
  },
});

const skStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
    height: 86,
  },
  stripe: {
    width: 4,
    backgroundColor: Colors.divider,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.divider,
  },
});
