import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
import { Colors, FontFamily } from '../utils/theme';

interface BrandMarkProps {
  /** Over the blue banner. Set false for the mark on a white surface. */
  onDark?: boolean;
  size?: 'lg' | 'sm';
}

// A mark, not a sentence
//
// The banner used to render the string "Walt Disney World transportation" in
// the app's body font, left-aligned, in sentence case, wrapping onto two
// lines inside the frame. A wordmark that reflows is not a wordmark, and a
// brand set in the same face as the body copy is the fastest way to read as
// generated.
//
// This is a fan project and cannot carry Disney's script logo, so it carries
// its own: a beam-and-nose emblem beside a fixed two-line lockup that never
// wraps and never changes size with the content around it.
function Emblem({ size, onDark }: { size: number; onDark: boolean }) {
  const plate = onDark ? Colors.textOnDark : Colors.primaryBlue;
  const ink = onDark ? Colors.heroBottom : Colors.textOnDark;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect x={0} y={0} width={48} height={48} rx={13} fill={plate} />
      <G>
        {/* the beam */}
        <Rect x={7} y={33} width={34} height={4} rx={2} fill={ink} opacity={0.45} />
        {/* the nose */}
        <Path
          d="M13 13h14c6.1 0 11 4.6 11 10.4V28a2.6 2.6 0 0 1-2.6 2.6H13A2.6 2.6 0 0 1 10.4 28V15.6A2.6 2.6 0 0 1 13 13Z"
          fill={ink}
        />
        {/* windows, knocked back out of the nose */}
        <Rect x={14} y={17} width={7.4} height={5.6} rx={1.8} fill={plate} />
        <Rect x={24} y={17} width={7.4} height={5.6} rx={1.8} fill={plate} />
        <Circle cx={35} cy={20} r={2.6} fill={plate} />
      </G>
    </Svg>
  );
}

export default function BrandMark({ onDark = true, size = 'lg' }: BrandMarkProps) {
  const lg = size === 'lg';
  const fg = onDark ? Colors.textOnDark : Colors.textPrimary;
  const fgSub = onDark ? Colors.textOnDarkSub : Colors.textSecondary;

  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel="Walt Disney World Transportation"
    >
      <Emblem size={lg ? 46 : 34} onDark={onDark} />
      <View style={styles.text}>
        <Text
          style={[styles.over, { color: fgSub, fontSize: lg ? 13 : 11 }]}
          numberOfLines={1}
        >
          Walt Disney World
        </Text>
        <Text
          style={[styles.word, { color: fg, fontSize: lg ? 25 : 19, lineHeight: lg ? 29 : 23 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Transportation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    justifyContent: 'center',
  },
  over: {
    fontFamily: FontFamily.semibold,
    letterSpacing: 1.4,
  },
  word: {
    fontFamily: FontFamily.bold,
    letterSpacing: -0.4,
    marginTop: 1,
  },
});
