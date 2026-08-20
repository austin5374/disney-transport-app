import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Gradients } from '../utils/theme';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  timeOverride?: Date | null;
  onResetTime?: () => void;
}

// Only the true tab-root screen (Trip Planner) gets the colorful gradient
// hero — matching the real app, where drilled-into screens (a route's
// results, its step-by-step) are plain white with dark text, and the big
// hero treatment is reserved for tab-root/dashboard-style screens.
export default function AppHeader({
  title, showBack, onBack, subtitle, timeOverride, onResetTime,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={styles.row}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={showBack ? Colors.primaryBlue : '#fff'} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}

      <View style={styles.titleArea}>
        <Text style={showBack ? styles.pageTitleDark : styles.appTitle} numberOfLines={1}>
          {title ?? 'Trip Planner'}
        </Text>
        {subtitle ? (
          <Text style={showBack ? styles.subtitleDark : styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        ) : !showBack ? (
          <Text style={styles.subtitle}>Get anywhere on property</Text>
        ) : null}
      </View>

      {timeOverride ? (
        <TouchableOpacity onPress={onResetTime} style={showBack ? styles.timeOverridePillDark : styles.timeOverridePill}>
          <Text style={showBack ? styles.timeOverrideTextDark : styles.timeOverrideText}>
            {timeOverride.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ×
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
    </View>
  );

  if (showBack) {
    return (
      <View style={[styles.containerFlat, { paddingTop: insets.top + 8 }]}>
        {content}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={Gradients.sky}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 8 }]}
    >
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  containerFlat: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
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
  pageTitleDark: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 1,
  },
  subtitleDark: {
    color: Colors.textSecondary,
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
  timeOverridePillDark: {
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeOverrideTextDark: {
    color: Colors.primaryBlue,
    fontSize: 11,
    fontWeight: '600',
  },
});
