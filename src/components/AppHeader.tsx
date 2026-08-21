import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Type, Spacing, Gradients } from '../utils/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

// Two header treatments, matching the reference app exactly:
//
//   Tab-root screens  → full-bleed gradient hero, white wordmark, no back.
//   Drilled-in screens → white bar, centered navy title that may wrap to two
//                        lines, blue chevron-back at the left, hairline rule.
//
// The old header put a gold title on a dusty blue strip on every screen and
// carried a tappable time-override pill that, on the detail screen, was wired
// to a no-op. Both are gone.
export default function AppHeader({ title, subtitle, showBack, onBack }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  if (showBack) {
    return (
      <View style={[styles.flatBar, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.primaryBlue} />
        </TouchableOpacity>

        <View style={styles.flatTitleArea}>
          <Text style={styles.pageTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={styles.pageSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.backBtn} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={Gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + Spacing.md }]}
    >
      <Text style={styles.heroTitle}>{title}</Text>
      {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flatBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 34,
    paddingTop: 2,
  },
  flatTitleArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  pageTitle: {
    ...Type.subtitle,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  pageSubtitle: {
    ...Type.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heroTitle: {
    ...Type.display,
    color: Colors.textOnDark,
  },
  heroSubtitle: {
    ...Type.bodySmall,
    color: Colors.textOnDarkSub,
    marginTop: 2,
  },
});
