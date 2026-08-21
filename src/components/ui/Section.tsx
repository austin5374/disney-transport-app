import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Type, Spacing, SECTION_GAP } from '../../utils/theme';

interface SectionProps {
  children: React.ReactNode;
  /** Title Case navy heading above the section's content. */
  header?: string;
  /** Drop the horizontal padding. For full-bleed rows and lists. */
  flush?: boolean;
  /** Suppress the gray gutter under this section (for stacked siblings). */
  last?: boolean;
  style?: ViewStyle;
}

// The core layout unit. The reference app is a vertical stack of edge-to-edge
// white blocks separated by a short gray gutter. No rounded cards, no 1px
// borders floating on a tint. Everything in this app renders inside one.
export default function Section({
  children, header, flush, last, style,
}: SectionProps) {
  return (
    <>
      <View style={[styles.section, flush && styles.flush, style]}>
        {header ? <Text style={[styles.header, flush && styles.inset]}>{header}</Text> : null}
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
  header: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
});
