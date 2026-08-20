import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Ellipse, Text as SvgText, G } from 'react-native-svg';
import { TRANSIT_LINES, TransitLine } from '../data/lines';
import { useLiveStatus, STATUS_LABEL } from '../utils/liveStatus';
import { Colors, StatusColors, Brand, Gradients } from '../utils/theme';

// Schematic property map (not to scale, like any transit diagram).
// Coordinates live in a 360 × 560 viewBox.

const NODES: Record<string, { x: number; y: number; label: string; kind: 'park' | 'resort' | 'hub' | 'place' }> = {
  MK:   { x: 100, y: 62,  label: 'Magic Kingdom',    kind: 'park' },
  CON:  { x: 152, y: 88,  label: 'Contemporary',     kind: 'resort' },
  WL:   { x: 190, y: 52,  label: 'Wilderness Lodge', kind: 'resort' },
  FW:   { x: 236, y: 74,  label: 'Fort Wilderness',  kind: 'resort' },
  GF:   { x: 52,  y: 92,  label: 'Grand Floridian',  kind: 'resort' },
  POLY: { x: 58,  y: 136, label: 'Polynesian',       kind: 'resort' },
  TTC:  { x: 100, y: 152, label: 'TTC',              kind: 'hub' },
  EP:   { x: 208, y: 296, label: 'EPCOT',            kind: 'park' },
  IG:   { x: 196, y: 330, label: 'Intl Gateway',     kind: 'place' },
  BW:   { x: 162, y: 352, label: 'BoardWalk',        kind: 'resort' },
  YBC:  { x: 214, y: 352, label: 'Yacht & Beach',    kind: 'resort' },
  SD:   { x: 168, y: 380, label: 'Swan / Dolphin',   kind: 'resort' },
  HS:   { x: 118, y: 424, label: 'Hollywood Studios', kind: 'park' },
  RIV:  { x: 258, y: 366, label: 'Riviera',          kind: 'resort' },
  CBR:  { x: 244, y: 420, label: 'Caribbean Beach',  kind: 'hub' },
  POP:  { x: 296, y: 470, label: 'Pop / Art of Anim.', kind: 'resort' },
  AK:   { x: 42,  y: 480, label: 'Animal Kingdom',   kind: 'park' },
  DS:   { x: 314, y: 250, label: 'Disney Springs',   kind: 'park' },
  SS:   { x: 318, y: 208, label: 'Saratoga Springs', kind: 'resort' },
  OKW:  { x: 284, y: 192, label: 'Old Key West',     kind: 'resort' },
  POR:  { x: 300, y: 158, label: 'Port Orleans Riv.', kind: 'resort' },
  POFQ: { x: 282, y: 128, label: 'Port Orleans FQ',  kind: 'resort' },
};

const n = (id: string) => NODES[id];
const pt = (id: string) => `${n(id).x},${n(id).y}`;

// Paths per transit line (drawn under nodes)
const LINE_PATHS: Record<string, { d: string; dashed?: boolean }> = {
  'mono-express':  { d: `M ${pt('TTC')} C 70,130 70,90 ${pt('MK')}` },
  'mono-resort':   { d: `M ${pt('TTC')} L ${pt('POLY')} L ${pt('GF')} L ${pt('MK')} L ${pt('CON')} C 150,130 120,150 ${pt('TTC')}` },
  'mono-epcot':    { d: `M ${pt('TTC')} C 130,220 170,240 ${pt('EP')}` },
  'sky-epcot':     { d: `M ${pt('CBR')} L ${pt('RIV')} L ${pt('IG')}` },
  'sky-hs':        { d: `M ${pt('CBR')} L ${pt('HS')}` },
  'sky-pop':       { d: `M ${pt('CBR')} L ${pt('POP')}` },
  'boat-ferry':    { d: `M ${pt('TTC')} C 115,120 105,95 ${pt('MK')}`, dashed: true },
  'boat-gold':     { d: `M ${pt('MK')} C 70,70 55,75 ${pt('GF')} L ${pt('POLY')}`, dashed: true },
  'boat-red':      { d: `M ${pt('MK')} C 140,50 165,45 ${pt('WL')}`, dashed: true },
  'boat-green':    { d: `M ${pt('MK')} C 160,80 200,85 ${pt('FW')}`, dashed: true },
  'boat-blue':     { d: `M ${pt('WL')} C 215,60 225,65 ${pt('FW')} C 200,95 175,95 ${pt('CON')}`, dashed: true },
  'boat-friendship': { d: `M ${pt('IG')} L ${pt('BW')} L ${pt('SD')} C 190,368 205,362 ${pt('YBC')} M ${pt('SD')} C 140,400 128,410 ${pt('HS')}`, dashed: true },
  'boat-sassagoula': { d: `M ${pt('POFQ')} L ${pt('POR')} L ${pt('OKW')} L ${pt('SS')} L ${pt('DS')}`, dashed: true },
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const live = useLiveStatus();
  const [selected, setSelected] = useState<string | null>(null);

  const mapW = Math.min(width, 520);
  const mapH = mapW * (560 / 360);
  const mapLines = TRANSIT_LINES.filter(l => LINE_PATHS[l.id]);
  const selectedLine = mapLines.find(l => l.id === selected) ?? null;
  const selectedStatus = selectedLine ? live[selectedLine.id] : null;

  const strokeFor = (line: TransitLine) => {
    if (!selected) return { opacity: 1, width: line.group === 'Skyliner' || line.group === 'Monorail' ? 3.5 : 2.5 };
    return selected === line.id
      ? { opacity: 1, width: 5 }
      : { opacity: 0.18, width: 2.5 };
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={Gradients.sky} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.brand}>{Brand.name}</Text>
        <Text style={styles.headerTitle}>Transit Map</Text>
        <Text style={styles.headerSub}>Schematic, not to scale · buses serve all locations</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.mapCard}>
          <Svg width={mapW - 24} height={mapH - 24} viewBox="0 0 360 560">
            {/* Water */}
            <Ellipse cx={102} cy={108} rx={44} ry={38} fill="#DCEBF7" />
            <Ellipse cx={205} cy={80} rx={52} ry={30} fill="#DCEBF7" />
            <Ellipse cx={190} cy={358} rx={38} ry={24} fill="#DCEBF7" />
            <Ellipse cx={300} cy={195} rx={26} ry={52} fill="#DCEBF7" />

            {/* Transit lines */}
            {mapLines.map(line => {
              const p = LINE_PATHS[line.id];
              const s = strokeFor(line);
              const st = live[line.id]?.status ?? 'operating';
              return (
                <G key={line.id} opacity={s.opacity}>
                  <Path
                    d={p.d}
                    stroke={st === 'down' ? Colors.statusDown : line.color}
                    strokeWidth={s.width}
                    strokeDasharray={p.dashed ? '5,5' : st === 'down' ? '3,4' : undefined}
                    fill="none"
                    strokeLinecap="round"
                  />
                </G>
              );
            })}

            {/* Nodes */}
            {Object.entries(NODES).map(([id, node]) => (
              <G key={id}>
                {node.kind === 'park' ? (
                  <Rect
                    x={node.x - 9} y={node.y - 9} width={18} height={18} rx={5}
                    fill={Colors.primaryBlue}
                  />
                ) : node.kind === 'hub' ? (
                  <>
                    <Circle cx={node.x} cy={node.y} r={8} fill="#fff" stroke={Colors.textPrimary} strokeWidth={2.5} />
                    <Circle cx={node.x} cy={node.y} r={3} fill={Colors.textPrimary} />
                  </>
                ) : (
                  <Circle cx={node.x} cy={node.y} r={4.5} fill="#fff" stroke={Colors.textSecondary} strokeWidth={2} />
                )}
                <SvgText
                  x={node.x}
                  y={node.y - (node.kind === 'park' ? 14 : 10)}
                  fontSize={node.kind === 'park' ? 10 : 8.5}
                  fontWeight={node.kind === 'park' ? '700' : '500'}
                  fill={node.kind === 'park' ? Colors.textPrimary : Colors.textSecondary}
                  textAnchor="middle"
                >
                  {node.label}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>

        {/* Selected line status */}
        {selectedLine && selectedStatus && (
          <View style={[styles.selectedCard, { borderColor: StatusColors[selectedStatus.status].border, backgroundColor: StatusColors[selectedStatus.status].bg }]}>
            <Text style={[styles.selectedName, { color: StatusColors[selectedStatus.status].text }]}>
              {selectedLine.name} · {STATUS_LABEL[selectedStatus.status]}
            </Text>
            <Text style={styles.selectedDetail}>
              {selectedStatus.detail ??
                (selectedStatus.headwayMinutes[1] <= 1
                  ? 'Boarding continuously'
                  : selectedStatus.nextArrivals.length
                    ? `Next departure in ${selectedStatus.nextArrivals[0]} min`
                    : `Every ${selectedStatus.headwayMinutes[0]}–${selectedStatus.headwayMinutes[1]} min`)}
              {selectedStatus.status === 'down' && selectedStatus.etaMinutes ? ` · est. ${selectedStatus.etaMinutes} min` : ''}
            </Text>
            <Text style={styles.selectedHours}>Service: {selectedLine.serviceHours}</Text>
            {selectedStatus.trainsInService != null && (
              <Text style={styles.selectedHours}>{selectedStatus.trainsInService} monorails running this beam</Text>
            )}
          </View>
        )}

        {/* Legend */}
        <Text style={styles.legendTitle}>Lines</Text>
        {mapLines.map(line => {
          const st = live[line.id]?.status ?? 'operating';
          const sc = StatusColors[st];
          const active = selected === line.id;
          return (
            <TouchableOpacity
              key={line.id}
              style={[styles.legendRow, active && styles.legendRowActive]}
              onPress={() => setSelected(active ? null : line.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.legendSwatch, { backgroundColor: line.color }]} />
              <Text style={styles.legendName} numberOfLines={1}>{line.name}</Text>
              <View style={[styles.legendPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                <Text style={[styles.legendPillText, { color: sc.text }]}>{STATUS_LABEL[st]}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.busNote}>
          Bus routes are not drawn. Resort buses connect every resort to every park and Disney Springs.
          See the Status tab for bus service levels.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  brand: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12.5,
    marginTop: 3,
  },
  mapCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    margin: 16,
    marginBottom: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  selectedName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  selectedDetail: {
    fontSize: 12.5,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  selectedHours: {
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 3,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  legendRowActive: {
    borderColor: Colors.primaryBlue,
    borderWidth: 1.5,
  },
  legendSwatch: {
    width: 14,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  legendName: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  legendPill: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  legendPillText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  busNote: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginHorizontal: 20,
    marginTop: 10,
    lineHeight: 17,
  },
});
