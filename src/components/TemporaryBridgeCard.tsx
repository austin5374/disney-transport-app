import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TemporaryBridge } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius, SECTION_GAP } from '../utils/theme';
import ModeGlyph from './ModeGlyph';

interface TemporaryBridgeCardProps {
  bridge: TemporaryBridge;
}

// A stopgap bus brought up to cover an active outage, not a fixed route.
// Amber is the app's disruption color and this is a disruption, so the tag
// earns it here. Unlike the old palette, which used the same warm accent for
// ordinary badges and links.
export default function TemporaryBridgeCard({ bridge }: TemporaryBridgeCardProps) {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Temporary Service</Text>
            </View>
            <Text style={styles.name}>{bridge.name}</Text>
            <Text style={styles.stations}>{bridge.stations.join(' · ')}</Text>
          </View>
          <ModeGlyph mode="bus" size={34} tile />
        </View>
        <Text style={styles.note}>{bridge.note}</Text>
      </View>
      <View style={styles.gutter} />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.statusDelayedBorder,
    backgroundColor: Colors.statusDelayedBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginBottom: Spacing.sm,
  },
  tagText: {
    ...Type.caption,
    fontFamily: Type.label.fontFamily,
    color: Colors.statusDelayed,
  },
  name: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  stations: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  note: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
