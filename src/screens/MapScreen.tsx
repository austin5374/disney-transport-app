import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse, Text as SvgText, G } from 'react-native-svg';
import { TRANSIT_LINES, TransitLine } from '../data/lines';
import { useLiveStatus, STATUS_LABEL } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius, StatusColors, FontFamily } from '../utils/theme';
import AppHeader from '../components/AppHeader';
import Section from '../components/ui/Section';
import Divider from '../components/ui/Divider';

// Schematic property map (not to scale, like any transit diagram).
//
// The viewBox carries ~60 units of gutter on the left and right beyond the
// node coordinate space. Without it, west-side labels ("Grand Floridian") are
// clipped by the SVG edge and east-side labels ("Disney Springs") run past
// the phone's own frame.
const VIEW_MIN_X = -62;
const VIEW_WIDTH = 496;
const VIEW_HEIGHT = 560;

type NodeKind = 'park' | 'resort' | 'hub' | 'place';
interface MapNode {
  x: number; y: number; label: string; kind: NodeKind;
  abbrev?: string;
  labelDx?: number; labelDy?: number; anchor?: 'start' | 'middle' | 'end';
}

// Label placement is hand-tuned for the crowded clusters. Left as defaults,
// eight labels overlap a node or a line.
const NODES: Record<string, MapNode> = {
  MK:   { x: 100, y: 62,  label: 'Magic Kingdom',    kind: 'park', abbrev: 'MK', labelDy: -20 },
  CON:  { x: 152, y: 88,  label: 'Contemporary',     kind: 'resort', labelDx: 12, labelDy: 4,   anchor: 'start' },
  WL:   { x: 190, y: 52,  label: 'Wilderness Lodge', kind: 'resort', labelDx: 0,  labelDy: -14, anchor: 'middle' },
  FW:   { x: 236, y: 74,  label: 'Fort Wilderness',  kind: 'resort', labelDx: 12, labelDy: 4,   anchor: 'start' },
  GF:   { x: 52,  y: 92,  label: 'Grand Floridian',  kind: 'resort', labelDx: -12, labelDy: -2, anchor: 'end' },
  POLY: { x: 58,  y: 136, label: 'Polynesian',       kind: 'resort', labelDx: -12, labelDy: 4,  anchor: 'end' },
  TTC:  { x: 100, y: 152, label: 'TTC',              kind: 'hub',    labelDx: -14, labelDy: 4,  anchor: 'end' },
  EP:   { x: 208, y: 296, label: 'EPCOT',            kind: 'park', abbrev: 'EP', labelDy: -20 },
  IG:   { x: 196, y: 330, label: 'Intl Gateway',     kind: 'place',  labelDx: 12, labelDy: -2,  anchor: 'start' },
  BW:   { x: 162, y: 352, label: 'BoardWalk',        kind: 'resort', labelDx: -12, labelDy: -2, anchor: 'end' },
  YBC:  { x: 214, y: 356, label: 'Yacht & Beach',    kind: 'resort', labelDx: 0,  labelDy: 20,  anchor: 'middle' },
  SD:   { x: 168, y: 380, label: 'Swan / Dolphin',   kind: 'resort', labelDx: -12, labelDy: 4,  anchor: 'end' },
  HS:   { x: 118, y: 424, label: 'Hollywood Studios', kind: 'park', abbrev: 'HS', labelDy: -20 },
  RIV:  { x: 258, y: 366, label: 'Riviera',          kind: 'resort', labelDx: 12, labelDy: 4,   anchor: 'start' },
  CBR:  { x: 244, y: 420, label: 'Caribbean Beach',  kind: 'hub',    labelDx: 14, labelDy: 4,   anchor: 'start' },
  POP:  { x: 296, y: 470, label: 'Pop / Art of Anim.', kind: 'resort', labelDx: 0, labelDy: 20, anchor: 'middle' },
  AK:   { x: 66,  y: 480, label: 'Animal Kingdom',   kind: 'park', abbrev: 'AK', labelDy: -20 },
  DS:   { x: 314, y: 250, label: 'Disney Springs',   kind: 'park', abbrev: 'DS', labelDy: 26 },
  SS:   { x: 318, y: 208, label: 'Saratoga Springs', kind: 'resort', labelDx: -12, labelDy: 5,  anchor: 'end' },
  OKW:  { x: 284, y: 192, label: 'Old Key West',     kind: 'resort', labelDx: -12, labelDy: -2, anchor: 'end' },
  POR:  { x: 300, y: 158, label: 'Port Orleans Riv.', kind: 'resort', labelDx: 12, labelDy: -2, anchor: 'start' },
  POFQ: { x: 282, y: 128, label: 'Port Orleans FQ',  kind: 'resort', labelDx: -12, labelDy: -2, anchor: 'end' },
};

const n = (id: string) => NODES[id];
const pt = (id: string) => `${n(id).x},${n(id).y}`;

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

type MapGroup = 'All' | 'Monorail' | 'Skyliner' | 'Boats';
const MAP_GROUPS: { key: MapGroup; label: string }[] = [
  { key: 'All',      label: 'All' },
  { key: 'Monorail', label: 'Monorail' },
  { key: 'Skyliner', label: 'Skyliner' },
  { key: 'Boats',    label: 'Boats' },
];

function formatEta(minutes: number): string {
  return minutes >= 60 ? `${Math.round(minutes / 60)} hr` : `${minutes} min`;
}

// SvgText does not inherit the app's font on web, so without an explicit
// family every label on this map rendered in Times New Roman — a serif face
// in the middle of an otherwise sans-serif app.
function MapLabel({
  x, y, anchor, size, weight, fill, children,
}: {
  x: number; y: number; anchor: 'start' | 'middle' | 'end';
  size: number; weight: 'bold' | 'semibold'; fill: string; children: string;
}) {
  const family = weight === 'bold' ? FontFamily.bold : FontFamily.semibold;
  return (
    <>
      {/* Halo drawn under the glyphs so a label crossing a line stays legible */}
      <SvgText
        x={x} y={y} fontSize={size} fontFamily={family} textAnchor={anchor}
        stroke={Colors.sectionBg} strokeWidth={3.5} strokeLinejoin="round" fill="none"
      >
        {children}
      </SvgText>
      <SvgText x={x} y={y} fontSize={size} fontFamily={family} textAnchor={anchor} fill={fill}>
        {children}
      </SvgText>
    </>
  );
}

export default function MapScreen() {
  const { width } = useWindowDimensions();
  const live = useLiveStatus();
  const [selected, setSelected] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<MapGroup>('All');

  const changeGroupFilter = (g: MapGroup) => {
    setGroupFilter(g);
    setSelected(null);
  };

  const mapW = Math.min(width, 520) - Spacing.lg * 2;
  const mapH = mapW * (VIEW_HEIGHT / VIEW_WIDTH);
  const mapLines = TRANSIT_LINES.filter(l =>
    LINE_PATHS[l.id] && (groupFilter === 'All' || l.group === groupFilter)
  );
  const selectedLine = mapLines.find(l => l.id === selected) ?? null;
  const selectedStatus = selectedLine ? live[selectedLine.id] : null;

  const strokeFor = (line: TransitLine) => {
    if (!selected) return { opacity: 1, width: line.group === 'Boats' ? 2.5 : 3.5 };
    return selected === line.id
      ? { opacity: 1, width: 5 }
      : { opacity: 0.15, width: 2.5 };
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Transit Map" subtitle="Schematic, not to scale" />

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {MAP_GROUPS.map(g => {
            const active = groupFilter === g.key;
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => changeGroupFilter(g.key)}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Section flush>
          <View style={styles.mapWrap}>
            <Svg width={mapW} height={mapH} viewBox={`${VIEW_MIN_X} 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
              {/* Water */}
              <Ellipse cx={102} cy={108} rx={44} ry={38} fill={Colors.mapWater} stroke={Colors.mapWaterStroke} strokeWidth={1} />
              <Ellipse cx={205} cy={80}  rx={52} ry={30} fill={Colors.mapWater} stroke={Colors.mapWaterStroke} strokeWidth={1} />
              <Ellipse cx={190} cy={358} rx={38} ry={24} fill={Colors.mapWater} stroke={Colors.mapWaterStroke} strokeWidth={1} />
              <Ellipse cx={300} cy={195} rx={26} ry={52} fill={Colors.mapWater} stroke={Colors.mapWaterStroke} strokeWidth={1} />

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
                      strokeLinejoin="round"
                    />
                  </G>
                );
              })}

              {/* Nodes */}
              {Object.entries(NODES).map(([id, node]) => {
                const labelX = node.x + (node.labelDx ?? 0);
                const labelY = node.y + (node.labelDy ?? -12);
                return (
                  <G key={id}>
                    {node.kind === 'park' ? (
                      <>
                        <Rect
                          x={node.x - 12} y={node.y - 12} width={24} height={24} rx={7}
                          fill={Colors.primaryBlue} stroke={Colors.sectionBg} strokeWidth={2}
                        />
                        {node.abbrev && (
                          <SvgText
                            x={node.x} y={node.y + 4}
                            fontSize={10} fontFamily={FontFamily.bold}
                            fill={Colors.textOnDark} textAnchor="middle"
                          >
                            {node.abbrev}
                          </SvgText>
                        )}
                      </>
                    ) : node.kind === 'hub' ? (
                      <>
                        <Circle cx={node.x} cy={node.y} r={8} fill={Colors.sectionBg} stroke={Colors.textPrimary} strokeWidth={2.5} />
                        <Circle cx={node.x} cy={node.y} r={3} fill={Colors.textPrimary} />
                      </>
                    ) : (
                      <Circle cx={node.x} cy={node.y} r={4.5} fill={Colors.sectionBg} stroke={Colors.textSecondary} strokeWidth={2} />
                    )}
                    <MapLabel
                      x={labelX}
                      y={labelY}
                      anchor={node.anchor ?? 'middle'}
                      size={node.kind === 'park' ? 12 : 10}
                      weight={node.kind === 'park' ? 'bold' : 'semibold'}
                      fill={node.kind === 'park' ? Colors.textPrimary : Colors.textSecondary}
                    >
                      {node.label}
                    </MapLabel>
                  </G>
                );
              })}
            </Svg>
          </View>
        </Section>

        {selectedLine && selectedStatus && (
          <Section eyebrow="Selected Line">
            <Text style={styles.selectedName}>{selectedLine.name}</Text>
            <View style={[
              styles.selectedPill,
              {
                backgroundColor: StatusColors[selectedStatus.status].bg,
                borderColor: StatusColors[selectedStatus.status].border,
              },
            ]}>
              <Text style={[styles.selectedPillText, { color: StatusColors[selectedStatus.status].text }]}>
                {STATUS_LABEL[selectedStatus.status]}
              </Text>
            </View>
            <Text style={styles.selectedDetail}>
              {selectedStatus.detail ??
                (selectedStatus.headwayMinutes[1] <= 1
                  ? 'Boarding continuously'
                  : selectedStatus.nextArrivals.length
                    ? `Next departure in ${selectedStatus.nextArrivals[0]} min`
                    : `Every ${selectedStatus.headwayMinutes[0]}–${selectedStatus.headwayMinutes[1]} min`)}
              {selectedStatus.status === 'down' && selectedStatus.etaMinutes
                ? ` · about ${formatEta(selectedStatus.etaMinutes)} to restore`
                : ''}
            </Text>
            <Text style={styles.selectedHours}>Service: {selectedLine.serviceHours}</Text>
            {selectedStatus.trainsInService != null && (
              <Text style={styles.selectedHours}>
                {selectedStatus.trainsInService} monorails running this beam
              </Text>
            )}
          </Section>
        )}

        <Section eyebrow="Lines" flush>
          {mapLines.map((line, i) => {
            const st = live[line.id]?.status ?? 'operating';
            const sc = StatusColors[st];
            const active = selected === line.id;
            return (
              <View key={line.id}>
                {i > 0 && <Divider />}
                <TouchableOpacity
                  style={[styles.legendRow, active && styles.legendRowActive]}
                  onPress={() => setSelected(active ? null : line.id)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.legendSwatch, { backgroundColor: line.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{line.name}</Text>
                  <View style={[styles.legendPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[styles.legendPillText, { color: sc.text }]}>{STATUS_LABEL[st]}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </Section>

        <Section last>
          <Text style={styles.busNote}>
            Bus routes are not drawn. Resort buses connect every resort to every park and
            Disney Springs. See Transportation Status for bus service levels.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  filterBar: {
    backgroundColor: Colors.sectionBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.dividerStrong,
    backgroundColor: Colors.sectionBg,
  },
  chipActive: {
    backgroundColor: Colors.primaryBlue,
    borderColor: Colors.primaryBlue,
  },
  chipText: {
    ...Type.label,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textOnDark,
  },
  scroll: {
    paddingBottom: Spacing.xl,
  },
  mapWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  selectedName: {
    ...Type.subtitle,
    color: Colors.textPrimary,
  },
  selectedPill: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginTop: Spacing.sm,
  },
  selectedPillText: {
    ...Type.label,
  },
  selectedDetail: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  selectedHours: {
    ...Type.caption,
    color: Colors.textPlaceholder,
    marginTop: Spacing.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  legendRowActive: {
    backgroundColor: Colors.primaryTint,
  },
  legendSwatch: {
    width: 14,
    height: 5,
    borderRadius: 3,
  },
  legendName: {
    ...Type.bodySmall,
    flex: 1,
    color: Colors.textPrimary,
  },
  legendPill: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  legendPillText: {
    ...Type.caption,
    fontFamily: Type.label.fontFamily,
  },
  busNote: {
    ...Type.caption,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
