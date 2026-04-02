import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../utils/theme';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  timeOverride?: Date | null;
  onResetTime?: () => void;
}

export default function AppHeader({
  title, showBack, onBack, subtitle, timeOverride, onResetTime,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleArea}>
          <Text style={showBack ? styles.pageTitleWhite : styles.appTitle} numberOfLines={1}>
            {title ?? 'Disney Transport'}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : !showBack ? (
            <Text style={styles.subtitle}>Walt Disney World Resort</Text>
          ) : null}
        </View>

        {timeOverride ? (
          <TouchableOpacity onPress={onResetTime} style={styles.timeOverridePill}>
            <Text style={styles.timeOverrideText}>
              {timeOverride.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ×
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryBlue,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
  },
  backArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  backPlaceholder: {
    width: 36,
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
  },
  appTitle: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: '500',
  },
  pageTitleWhite: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 1,
  },
  timeOverridePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeOverrideText: {
    color: Colors.gold,
    fontSize: 11,
    fontWeight: '500',
  },
});
