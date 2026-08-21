import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';
import { Colors, Spacing, Gradients } from '../utils/theme';
import BrandMark from './BrandMark';

// The front door
//
// The reference app's home screen opens on an illustrated blue field — clouds,
// balloons, a starburst, sparkles — with the wordmark over it, and the first
// white card overlapping its bottom edge. This app opened on a flat
// three-stop gradient with a line of body text on it, which is the default
// header of every navigator tutorial written since 2019.
//
// The art here is deliberately quiet: a skyline of piers and a beam, a couple
// of clouds, a scatter of sparkles. Enough that the field reads as a place
// rather than as a color.
function BannerArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 168"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      <G opacity={0.15} fill={Colors.textOnDark}>
        <Ellipse cx={72} cy={64} rx={36} ry={13} />
        <Ellipse cx={100} cy={58} rx={23} ry={10} />
        <Ellipse cx={300} cy={100} rx={30} ry={11} />
        <Ellipse cx={276} cy={95} rx={18} ry={8} />
      </G>

      {/* Sparkles. Nothing sits in the top-right corner, which on a phone is
          occupied by the wifi and battery glyphs. */}
      <G fill={Colors.textOnDark}>
        <Path d="M318 128l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6Z" opacity={0.6} />
        <Path d="M34 118l1.8 4.4 4.4 1.8-4.4 1.8-1.8 4.4-1.8-4.4-4.4-1.8 4.4-1.8Z" opacity={0.45} />
        <Circle cx={244} cy={62} r={2.4} opacity={0.5} />
        <Circle cx={140} cy={40} r={2} opacity={0.35} />
      </G>

      {/* A beam along the foot of the banner, with a monorail running out of
          frame behind the greeting card. */}
      <G opacity={0.2}>
        <Rect x={0} y={140} width={360} height={7} rx={3.5} fill={Colors.textOnDark} />
        <Rect x={40} y={147} width={10} height={21} fill={Colors.textOnDark} opacity={0.7} />
        <Rect x={300} y={147} width={10} height={21} fill={Colors.textOnDark} opacity={0.7} />
      </G>
      <G opacity={0.3}>
        <Path
          d="M214 112h40c17 0 30 12 30 27v7a5 5 0 0 1-5 5H214a5 5 0 0 1-5-5v-29a5 5 0 0 1 5-5Z"
          fill={Colors.textOnDark}
        />
      </G>
    </Svg>
  );
}

export default function HomeBanner() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={Gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={[styles.banner, { paddingTop: insets.top + Spacing.xl }]}
    >
      <View style={StyleSheet.absoluteFill}>
        <BannerArt />
      </View>
      <BrandMark />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingHorizontal: Spacing.lg,
    // Deep enough for the art to read, and for the greeting card below to
    // overlap its bottom edge the way the reference's does. The card is pulled
    // up 32 points, so this leaves roughly 36 of banner showing beneath it.
    paddingBottom: 68,
    overflow: 'hidden',
  },
});
