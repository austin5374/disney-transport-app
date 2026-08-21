import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { TransportMode } from '../types';
import { Colors, Radius, transportColor } from '../utils/theme';

interface ModeGlyphProps {
  mode: TransportMode;
  size?: number;
  /** Render on a tinted rounded tile, the way the reference app's list rows
   *  carry a thumbnail on the right. */
  tile?: boolean;
}

// Two-tone mode illustrations, drawn rather than pulled from a stock icon
// set. The reference app's iconography is custom and two-tone throughout, and
// a generic outline glyph next to Disney-specific copy is one of the fastest
// ways to read as a template. Six shapes cover every mode in the network.
//
// `body` is the line's own color; `tint` is a washed version used for glass,
// wheels, and secondary structure.

export function Glyph({ mode, body, tint }: { mode: TransportMode; body: string; tint: string }) {
  switch (mode) {
    case 'monorail_express':
    case 'monorail_resort':
    case 'monorail_epcot':
      return (
        <G>
          {/* beam */}
          <Rect x={4} y={35} width={40} height={5} rx={2.5} fill={tint} />
          {/* car body, rounded nose at the right */}
          <Path
            d="M10 12h20c6.6 0 12 4.9 12 11v6a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z"
            fill={body}
          />
          {/* windows */}
          <Rect x={11} y={16} width={9} height={7} rx={2} fill="#FFFFFF" opacity={0.92} />
          <Rect x={23} y={16} width={9} height={7} rx={2} fill="#FFFFFF" opacity={0.92} />
          <Path d="M35 16.4c3 1.3 5 4 5.4 6.6H35a1 1 0 0 1-1-1v-4.6c0-.8.4-1.3 1-1Z" fill="#FFFFFF" opacity={0.92} />
        </G>
      );

    case 'skyliner':
      return (
        <G>
          {/* cable */}
          <Path d="M3 9h42" stroke={tint} strokeWidth={3} strokeLinecap="round" />
          {/* hanger */}
          <Path d="M24 9v7" stroke={body} strokeWidth={3} strokeLinecap="round" />
          {/* cabin */}
          <Path
            d="M15 18c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v17a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5V18Z"
            fill={body}
          />
          <Rect x={18} y={20} width={12} height={11} rx={2.5} fill="#FFFFFF" opacity={0.92} />
        </G>
      );

    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue':
      return (
        <G>
          {/* hull */}
          <Path d="M6 28h36l-4.5 9a4 4 0 0 1-3.6 2.2H14.1A4 4 0 0 1 10.5 37L6 28Z" fill={body} />
          {/* deckhouse */}
          <Rect x={14} y={15} width={20} height={11} rx={2.5} fill={body} />
          <Rect x={17} y={18} width={5.5} height={5} rx={1.5} fill="#FFFFFF" opacity={0.92} />
          <Rect x={25} y={18} width={5.5} height={5} rx={1.5} fill="#FFFFFF" opacity={0.92} />
          {/* mast */}
          <Path d="M24 15V8" stroke={tint} strokeWidth={2.5} strokeLinecap="round" />
          {/* water */}
          <Path d="M4 43c3.2 0 3.2-2 6.4-2s3.2 2 6.4 2 3.2-2 6.4-2 3.2 2 6.4 2 3.2-2 6.4-2 3.2 2 6.4 2"
            stroke={tint} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </G>
      );

    case 'bus':
      return (
        <G>
          <Path d="M8 12h32a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z" fill={body} />
          <Rect x={8} y={16} width={13} height={8} rx={2} fill="#FFFFFF" opacity={0.92} />
          <Rect x={24} y={16} width={13} height={8} rx={2} fill="#FFFFFF" opacity={0.92} />
          <Circle cx={14} cy={38} r={4.5} fill={tint} />
          <Circle cx={34} cy={38} r={4.5} fill={tint} />
        </G>
      );

    case 'walk':
      return (
        <G>
          <Circle cx={26} cy={9} r={4.5} fill={body} />
          <Path
            d="M24.6 16.2c1.9-.5 3.8.4 4.6 2.1l2.6 5.4 5 2.3a2.2 2.2 0 0 1-1.8 4l-5.8-2.6a2.2 2.2 0 0 1-1.1-1.1l-.8-1.7-1.9 6.1 4.3 4.6c.4.4.6.9.6 1.5v6.3a2.3 2.3 0 0 1-4.6 0v-5.4l-5.6-6a2.3 2.3 0 0 1-.5-2.2l1.3-4.3-3 2.4-1.8 5a2.2 2.2 0 1 1-4.2-1.5l2-5.6c.2-.5.5-.9.9-1.2l7.2-5.6c.5-.4 1-.7 1.6-.8Z"
            fill={body}
          />
        </G>
      );

    case 'minnie_van':
      return (
        <G>
          <Path
            d="M6 30l3.4-9A6 6 0 0 1 15 17h18a6 6 0 0 1 5.6 4l3.4 9v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5Z"
            fill={body}
          />
          <Path d="M13.4 21.6 11 28h12v-6.4h-9.6ZM26 21.6V28h12l-2.4-6.4H26Z" fill="#FFFFFF" opacity={0.92} />
          <Circle cx={14} cy={37} r={4.5} fill={tint} />
          <Circle cx={34} cy={37} r={4.5} fill={tint} />
        </G>
      );

    default:
      return <Circle cx={24} cy={24} r={12} fill={body} />;
  }
}

/** Lighten a hex color toward white by `amount` (0-1). */
export function tintOf(hex: string, amount = 0.55): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function ModeGlyph({ mode, size = 32, tile }: ModeGlyphProps) {
  const body = transportColor(mode);
  const tint = tintOf(body);
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Glyph mode={mode} body={body} tint={tint} />
    </Svg>
  );

  if (!tile) return svg;

  // The tile used to be a flat gray square, which read as a placeholder where
  // the reference app carries a photograph. Tinting it by the mode's own
  // family — sky for the things that fly and ride, water for the boats,
  // greenery for the road — gives the row an image-shaped anchor without
  // pretending to be a photo.
  return (
    <View
      style={[
        styles.tile,
        { width: size + 34, height: size + 34, backgroundColor: tileBackground(mode) },
      ]}
    >
      {svg}
    </View>
  );
}

function tileBackground(mode: TransportMode): string {
  switch (mode) {
    case 'ferry_ttc_mk':
    case 'friendship_boat':
    case 'sassagoula_boat':
    case 'water_taxi_gold':
    case 'water_taxi_red':
    case 'water_taxi_green':
    case 'water_taxi_blue': return '#DCEBF7';
    case 'bus':
    case 'minnie_van':      return '#E6EFE3';
    case 'walk':            return '#EFEAE0';
    default:                return '#E4F0F9';
  }
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
});
