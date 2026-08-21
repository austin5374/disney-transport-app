import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppModal from './AppModal';
import { DESTINATIONS } from '../data/destinations';
import { useLiveStatus } from '../utils/liveStatus';
import { Colors, StatusColors, Type, Spacing, SECTION_GAP } from '../utils/theme';

// MDE-style "next bus times from your resort" board: pick a resort, see the
// estimated next departure to each park destination. Estimates are derived
// from the shared live-status board so a Down/Delayed bus group is reflected.

const BUS_DESTS = [
  { lineId: 'bus-mk', label: 'Magic Kingdom' },
  { lineId: 'bus-ep', label: 'EPCOT' },
  { lineId: 'bus-hs', label: 'Hollywood Studios' },
  { lineId: 'bus-ak', label: 'Animal Kingdom' },
  { lineId: 'bus-ds', label: 'Disney Springs' },
  { lineId: 'bus-wp', label: 'Water Parks' },
];

const RESORTS = DESTINATIONS.filter(d =>
  !['Parks', 'Water Parks', 'Transportation', 'Entertainment'].includes(d.group)
);

// Deterministic per resort+destination+time-bucket offset so times differ by
// resort but stay stable between renders and drift as time passes.
function stopOffset(resortId: string, lineId: string, bucket: number): number {
  let h = 0;
  const key = `${resortId}|${lineId}|${bucket}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 14; // 0–13 min offset within the ~15–20 min headway
}

export default function BusTimesPanel() {
  const [resort, setResort] = useState(RESORTS.find(r => r.id === 'POP') ?? RESORTS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const live = useLiveStatus();
  const bucket = Math.floor(Date.now() / 60_000); // advances every minute

  const rows = useMemo(() => BUS_DESTS.map(d => {
    const status = live[d.lineId];
    const base = stopOffset(resort.id, d.lineId, Math.floor(bucket / 18));
    const minutesAway = ((base + bucket) % 18) === 0 ? 0 : 18 - ((base + bucket) % 18);
    return { ...d, status, minutesAway };
  }), [resort.id, live, bucket]);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.resortRow} onPress={() => setPickerOpen(true)} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resortLabel}>Bus times from</Text>
          <Text style={styles.resortName}>{resort.label}</Text>
        </View>
        <Ionicons name="chevron-expand-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.divider} />

      {rows.map((row, i) => {
        const st = row.status?.status ?? 'operating';
        const sc = StatusColors[st];
        return (
          <View key={row.lineId} style={[styles.destRow, i < rows.length - 1 && styles.destRowBorder]}>
            <Text style={styles.destName}>{row.label}</Text>
            {st === 'down' ? (
              <Text style={[styles.destTime, { color: sc.text }]}>Service interrupted</Text>
            ) : row.minutesAway === 0 ? (
              <Text style={[styles.destTime, { color: Colors.statusOperating }]}>Arriving now</Text>
            ) : (
              <Text style={[styles.destTime, st === 'delayed' && { color: sc.text }]}>
                {st === 'delayed' ? `~${row.minutesAway + 6} min (delays)` : `${row.minutesAway} min`}
              </Text>
            )}
          </View>
        );
      })}

      <AppModal visible={pickerOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity
              onPress={() => setPickerOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.pickerClose}
            >
              <Ionicons name="close" size={26} color={Colors.primaryBlue} />
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>Choose Your Resort</Text>
            <View style={styles.pickerClose} />
          </View>
          <FlatList
            data={RESORTS}
            keyExtractor={r => r.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => { setResort(item); setPickerOpen(false); }}
              >
                <Text style={[styles.pickerItemText, item.id === resort.id && styles.pickerItemActive]}>
                  {item.label}
                </Text>
                {item.id === resort.id && <Ionicons name="checkmark" size={18} color={Colors.primaryBlue} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.sectionBg,
    paddingVertical: Spacing.sm,
    marginBottom: SECTION_GAP,
  },
  resortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resortLabel: {
    ...Type.caption,
    color: Colors.textSecondary,
  },
  resortName: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  destRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  destName: {
    ...Type.bodySmall,
    color: Colors.textPrimary,
  },
  destTime: {
    ...Type.action,
    color: Colors.textPrimary,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: Colors.sectionBg,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerClose: {
    width: 34,
  },
  pickerTitle: {
    ...Type.subtitle,
    flex: 1,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerItemText: {
    ...Type.body,
    color: Colors.textPrimary,
  },
  pickerItemActive: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
});
