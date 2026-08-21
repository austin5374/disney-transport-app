import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Platform,
} from 'react-native';
import { TRANSIT_LINES, LineGroup } from '../data/lines';
import { useLiveStatus, refreshLiveStatus, getTemporaryBridges } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import StatusCard from '../components/StatusCard';
import BusTimesPanel from '../components/BusTimesPanel';
import TemporaryBridgeCard from '../components/TemporaryBridgeCard';
import Section from '../components/ui/Section';
import ModeGlyph from '../components/ModeGlyph';
import IconTabs, { IconTab } from '../components/ui/IconTabs';

type Filter = LineGroup | 'All' | 'Advisories';

// The reference app's category rail: illustrated glyph over a Title Case
// label, with the active one in blue over a blue underline, scrolling when it
// runs past the edge. It replaces a row of rounded pills, which is a shape
// that app uses nowhere.
const FILTERS: IconTab<Filter>[] = [
  { key: 'All',        label: 'All',        icon: 'apps-outline' },
  { key: 'Advisories', label: 'Advisories', icon: 'alert-circle-outline' },
  { key: 'Monorail',   label: 'Monorail',   renderIcon: () => <ModeGlyph mode="monorail_express" size={26} /> },
  { key: 'Skyliner',   label: 'Skyliner',   renderIcon: () => <ModeGlyph mode="skyliner" size={26} /> },
  { key: 'Boats',      label: 'Boats',      renderIcon: () => <ModeGlyph mode="ferry_ttc_mk" size={26} /> },
  { key: 'Buses',      label: 'Buses',      renderIcon: () => <ModeGlyph mode="bus" size={26} /> },
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

export default function StatusScreen({ navigation }: { navigation: { goBack: () => void } }) {
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

  // A line that has simply shut for the night is not an advisory. It used to
  // be counted as one, so the header read "5 lines with advisories" at 11pm
  // when nothing at all was wrong.
  const disrupted = useMemo(
    () => TRANSIT_LINES.filter(l => {
      const st = live[l.id]?.status;
      return st === 'down' || st === 'delayed';
    }),
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
        showBack
        onBack={() => navigation.goBack()}
        title="Transportation Status"
        subtitle={
          disrupted.length === 0
            ? 'All lines operating normally'
            : `${disrupted.length} line${disrupted.length === 1 ? '' : 's'} with advisories`
        }
      />

      <IconTabs
        items={FILTERS
          .filter(f => f.key !== 'Advisories' || disrupted.length > 0)
          .map(f => f.key === 'Advisories' ? { ...f, badge: disrupted.length } : f)}
        value={filter}
        onChange={setFilter}
        accessibilityLabel="Filter transportation status"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          Platform.OS === 'web'
            ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryBlue} />
        }
      >
        {/* The board recomputes on its own every 20 seconds, and status is a
            pure function of the wall clock, so a refresh control could only
            ever advance the countdown by a second. Stating the time it was
            last computed is the honest signal; a button is a promise of
            control the engine does not have. */}
        <View style={styles.updatedRow}>
          <Text style={styles.updatedText}>
            Updated {updated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </Text>
        </View>

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
              const lines = TRANSIT_LINES.filter(l => {
                if (l.group !== g) return false;
                if (filter !== 'All') return true;
                // Disrupted lines are pinned to the top of the "All" view, so
                // they are not repeated inside their group. Closed ones are
                // not pinned, so they stay here.
                const st = live[l.id]?.status;
                return st !== 'down' && st !== 'delayed';
              });
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
            Service levels, departure estimates, and crowd levels here are modeled, not live
            operational data. Not affiliated with The Walt Disney Company.
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
  groupHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  groupTitle: {
    ...Type.title,
    color: Colors.textPrimary,
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
