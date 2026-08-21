import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Type, Spacing, SECTION_GAP } from '../../utils/theme';

interface SectionProps {
  children: React.ReactNode;
  /** Small all-caps eyebrow above the section's content. */
  eyebrow?: string;
  /** Large heading inside the section. */
  title?: string;
  /** Drop the horizontal padding — for full-bleed rows and lists. */
  flush?: boolean;
  /** Suppress the gray gutter under this section (for stacked siblings). */
  last?: boolean;
  style?: ViewStyle;
}

// The core layout unit. The reference app is a vertical stack of edge-to-edge
// white blocks separated by a short gray gutter — no rounded cards, no 1px
// borders floating on a tint. Everything in this app renders inside one.
export default function Section({
  children, eyebrow, title, flush, last, style,
}: SectionProps) {
  return (
    <>
      <View style={[styles.section, flush && styles.flush, style]}>
        {eyebrow ? <Text style={[styles.eyebrow, flush && styles.inset]}>{eyebrow}</Text> : null}
        {title ? <Text style={[styles.title, flush && styles.inset]}>{title}</Text> : null}
        {children}
      </View>
      {!last && <View style={styles.gutter} />}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  flush: {
    paddingHorizontal: 0,
  },
  inset: {
    paddingHorizontal: Spacing.lg,
  },
  eyebrow: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
});
