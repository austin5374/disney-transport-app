import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TemporaryBridge } from '../utils/liveStatus';
import { Colors } from '../utils/theme';

interface TemporaryBridgeCardProps {
  bridge: TemporaryBridge;
}

// Visually distinct from a real, permanent bus line — gold accent + a
// "Temporary" tag — so it reads as a stopgap tied to an active outage, not
// a new fixed route someone could rely on tomorrow.
export default function TemporaryBridgeCard({ bridge }: TemporaryBridgeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.stripe} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{bridge.name}</Text>
          <View style={styles.tag}>
            <Ionicons name="time-outline" size={11} color={Colors.warnText} />
            <Text style={styles.tagText}>Temporary</Text>
          </View>
        </View>
        <Text style={styles.stations} numberOfLines={1}>
          {bridge.stations.join(' · ')}
        </Text>
        <Text style={styles.note}>{bridge.note}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.warnBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.warnBorder,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
  },
  stripe: {
    width: 4,
    backgroundColor: Colors.gold,
  },
  body: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.warnBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warnText,
  },
  stations: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: Colors.warnText,
    lineHeight: 17,
  },
});
