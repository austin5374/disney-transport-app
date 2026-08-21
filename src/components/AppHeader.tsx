import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Type, Spacing, Gradients } from '../utils/theme';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  /** Blue chevron at the left of a flat bar. Implies the flat treatment. */
  showBack?: boolean;
  onBack?: () => void;
  /** Flat white bar with no back control, for a tab root that needs a title. */
  plain?: boolean;
}

// Two header treatments, matching the reference app:
//
//   Flat bar   → white, centered navy title that may wrap to two lines, a
//                hairline rule, and a blue chevron only when there is
//                somewhere to go back to. This is what the reference uses on
//                every screen that carries a title at all.
//   Blue field → reserved for the planner's banner, which is the app's front
//                door. Nothing else gets one.
//
// The old build put the blue gradient on all four tab roots, which is the
// default header of every navigator tutorial and appears on exactly zero
// screens of the reference app.
export default function AppHeader({ title, subtitle, showBack, onBack, plain }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  if (showBack || plain) {
    return (
      <View style={[styles.flatBar, { paddingTop: insets.top + Spacing.sm }]}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={26} color={Colors.primaryBlue} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

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
