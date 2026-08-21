import React from 'react';
import { View, Image, ImageSourcePropType, StyleSheet, ViewStyle } from 'react-native';
import Svg, {
  Defs, LinearGradient, Stop, Rect, Circle, Ellipse, Path, G,
} from 'react-native-svg';
import { TransportMode } from '../types';
import { transportColor, Colors } from '../utils/theme';
import { Glyph, tintOf } from './ModeGlyph';

interface ModeSceneProps {
  mode: TransportMode;
  /** Aspect-ratio band height. The detail hero uses 180. */
  height?: number;
  /** A real photograph, when there is one. Takes precedence over the drawing.
   *  This is the seam: dropping a `require('../../assets/photos/x.jpg')` in
   *  here replaces the illustration with no other change. */
  image?: ImageSourcePropType;
  style?: ViewStyle;
}

const W = 320;
const H = 120;

// Illustrated mode banners
//
// The reference app is photography-first: a 500-point hero on every detail
// page, a thumbnail on every list row, character art on the home screen. This
// app shipped with no imagery at all, which after the wordmark is the loudest
// "generated" signal there is.
//
// These are drawn rather than photographed because a fan project cannot ship
// Disney's photography, and stock pictures of a monorail would be worse than
// an honest illustration. Every scene takes an `image` prop, so a real photo
// library drops in later without touching a single call site.

type Family = 'rail' | 'cable' | 'water' | 'road' | 'path';

function familyOf(mode: TransportMode): Family {
  switch (mode) {
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':  return 'rail';
    case 'skyliner':        return 'cable';
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue': return 'water';
    case 'bus':
    case 'minnie_van':      return 'road';
    default:                return 'path';
  }
}

const SKY_TOP = '#BFE0F4';
const SKY_BOTTOM = '#E9F4FB';
const GROUND = '#DDEBD8';
const GROUND_DEEP = '#C7DFC0';
const WATER = '#BEDCF0';
const WATER_DEEP = '#9FC9E6';
const SHADOW = 'rgba(14,44,75,0.10)';

function Clouds() {
  return (
    <G opacity={0.85}>
      <Ellipse cx={54} cy={26} rx={26} ry={11} fill="#FFFFFF" />
      <Ellipse cx={74} cy={22} rx={18} ry={9} fill="#FFFFFF" />
      <Ellipse cx={246} cy={34} rx={22} ry={9} fill="#FFFFFF" opacity={0.8} />
      <Ellipse cx={262} cy={30} rx={15} ry={7} fill="#FFFFFF" opacity={0.8} />
    </G>
  );
}

function Palms({ x }: { x: number }) {
  return (
    <G opacity={0.5}>
      <Rect x={x} y={62} width={3} height={30} rx={1.5} fill={GROUND_DEEP} />
      <Path d={`M${x - 12} 64q12 -12 25 0`} stroke={GROUND_DEEP} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d={`M${x - 9} 58q13 -8 22 4`} stroke={GROUND_DEEP} strokeWidth={4} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Scene({ mode }: { mode: TransportMode }) {
  const family = familyOf(mode);
  const body = transportColor(mode);
  const tint = tintOf(body);

  // The glyph is drawn on a 48-unit grid; this drops it into the scene at a
  // consistent size and baseline across every mode.
  const vehicle = (x: number, y: number, scale: number) => (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Glyph mode={mode} body={body} tint={tint} />
    </G>
  );

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SKY_TOP} />
          <Stop offset="1" stopColor={SKY_BOTTOM} />
        </LinearGradient>
      </Defs>

      <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
      <Clouds />

      {family === 'water' ? (
        <>
          <Rect x={0} y={78} width={W} height={H - 78} fill={WATER} />
          <Path d={`M0 78 Q80 72 160 78 T320 78 L320 ${H} L0 ${H} Z`} fill={WATER_DEEP} opacity={0.55} />
          <Path d="M24 100q14-5 28 0M212 108q14-5 28 0M120 116q14-5 28 0"
            stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
          <Ellipse cx={160} cy={104} rx={48} ry={7} fill={SHADOW} />
          {vehicle(128, 44, 1.35)}
        </>
      ) : family === 'road' ? (
        <>
          <Rect x={0} y={74} width={W} height={H - 74} fill={GROUND} />
          <Rect x={0} y={88} width={W} height={20} fill="#CFD8DF" />
          <Path d="M10 98h26M62 98h26M114 98h26M166 98h26M218 98h26M270 98h26"
            stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          <Palms x={38} />
          <Palms x={276} />
          <Ellipse cx={160} cy={98} rx={42} ry={6} fill={SHADOW} />
          {vehicle(128, 42, 1.35)}
        </>
      ) : family === 'cable' ? (
        <>
          <Rect x={0} y={86} width={W} height={H - 86} fill={GROUND} />
          <Palms x={30} />
          <Palms x={288} />
          <Path d="M-10 34 L330 50" stroke={Colors.textPlaceholder} strokeWidth={2.5} fill="none" />
          <G opacity={0.45}>{vehicle(38, 26, 0.7)}</G>
          <G opacity={0.7}>{vehicle(238, 34, 0.85)}</G>
          {vehicle(130, 28, 1.3)}
        </>
      ) : family === 'rail' ? (
        <>
          <Rect x={0} y={84} width={W} height={H - 84} fill={GROUND} />
          <Palms x={26} />
          <Palms x={292} />
          {/* The beam, with its piers */}
          <Rect x={0} y={72} width={W} height={10} rx={3} fill="#D3DCE4" />
          <Rect x={0} y={82} width={W} height={4} fill="#BCC7D1" />
          <Rect x={52} y={82} width={12} height={24} fill="#C6D0D9" />
          <Rect x={256} y={82} width={12} height={24} fill="#C6D0D9" />
          {vehicle(122, 24, 1.45)}
        </>
      ) : (
        <>
          <Rect x={0} y={80} width={W} height={H - 80} fill={GROUND} />
          <Path d={`M0 108 Q90 88 160 96 T320 88 L320 ${H} L0 ${H} Z`} fill="#E8E1D2" />
          <Palms x={34} />
          <Palms x={284} />
          <Ellipse cx={160} cy={100} rx={26} ry={5} fill={SHADOW} />
          {vehicle(136, 46, 1.15)}
        </>
      )}

      {/* Two sparkles, the reference app's one piece of ambient decoration. */}
      <G fill="#FFFFFF" opacity={0.9}>
        <Path d="M292 18l2.2 5.4 5.4 2.2-5.4 2.2-2.2 5.4-2.2-5.4-5.4-2.2 5.4-2.2Z" />
        <Circle cx={30} cy={48} r={2.4} />
      </G>
    </Svg>
  );
}

export default function ModeScene({ mode, height = 120, image, style }: ModeSceneProps) {
  return (
    <View style={[styles.wrap, { height }, style]}>
      {image
        ? <Image source={image} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
        : <Scene mode={mode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: SKY_BOTTOM,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});
