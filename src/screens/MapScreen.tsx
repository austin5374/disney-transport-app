import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, LayoutChangeEvent,
  Animated, PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Ellipse, Text as SvgText, G } from 'react-native-svg';
import { TRANSIT_LINES, TransitLine } from '../data/lines';
import { useLiveStatus, STATUS_LABEL } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius, StatusColors, FontFamily } from '../utils/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppModal from '../components/AppModal';
import ModeGlyph from '../components/ModeGlyph';
import IconTabs, { IconTab } from '../components/ui/IconTabs';
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
  BW:   { x: 162, y: 352, label: 'Boardwalk',        kind: 'resort', labelDx: -12, labelDy: -2, anchor: 'end' },
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
const MAP_TABS: IconTab<MapGroup>[] = [
  { key: 'All',      label: 'All',      icon: 'apps-outline' },
  { key: 'Monorail', label: 'Monorail', renderIcon: () => <ModeGlyph mode="monorail_express" size={26} /> },
  { key: 'Skyliner', label: 'Skyliner', renderIcon: () => <ModeGlyph mode="skyliner" size={26} /> },
  { key: 'Boats',    label: 'Boats',    renderIcon: () => <ModeGlyph mode="ferry_ttc_mk" size={26} /> },
];

function formatEta(minutes: number): string {
  return minutes >= 60 ? `${Math.round(minutes / 60)} hr` : `${minutes} min`;
}

// SvgText does not inherit the app's font on web, so without an explicit
// family every label on this map rendered in Times New Roman. A serif face
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

// Where each line's live callout hangs
//
// The reference app's map is covered in white teardrop pins carrying a live
// number. This map had no live data on it at all — the arrival times existed
// two screens away on the status board. These anchors put them back where a
// guest is actually looking.
const LINE_MARKERS: Record<string, { x: number; y: number }> = {
  'mono-express':    { x: 80,  y: 92  },
  'mono-resort':     { x: 18,  y: 142 },
  'mono-epcot':      { x: 152, y: 232 },
  'sky-epcot':       { x: 264, y: 392 },
  'sky-hs':          { x: 178, y: 428 },
  'sky-pop':         { x: 278, y: 452 },
  'boat-ferry':      { x: 118, y: 112 },
  'boat-gold':       { x: 66,  y: 74  },
  'boat-red':        { x: 146, y: 44  },
  'boat-green':      { x: 172, y: 88  },
  'boat-blue':       { x: 216, y: 62  },
  'boat-friendship': { x: 146, y: 372 },
  'boat-sassagoula': { x: 300, y: 176 },
};

/** Above this many visible lines the map would carry more callout than map,
 *  so only the lines with something wrong keep theirs. */
const MAX_CALLOUTS = 6;

const MIN_SCALE = 1;
const MAX_SCALE = 3;

/** A white callout with the line's next departure, pointing at the line. */
function Callout({
  x, y, value, unit, tone,
}: { x: number; y: number; value: string; unit?: string; tone: string }) {
  const w = unit ? 44 : 52;
  const h = 30;
  return (
    <G>
      <Path
        d={`M${x} ${y} l-5 -7 h-${w / 2 - 5} a3 3 0 0 1 -3 -3 v-${h - 6} a3 3 0 0 1 3 -3 h${w} a3 3 0 0 1 3 3 v${h - 6} a3 3 0 0 1 -3 3 h-${w / 2 - 5} Z`}
        fill={Colors.sectionBg}
        stroke={Colors.dividerStrong}
        strokeWidth={1}
      />
      <SvgText
        x={x} y={unit ? y - 18 : y - 14}
        fontSize={13} fontFamily={FontFamily.bold}
        textAnchor="middle" fill={tone}
      >
        {value}
      </SvgText>
      {unit && (
        <SvgText
          x={x} y={y - 9}
          fontSize={8} fontFamily={FontFamily.semibold}
          textAnchor="middle" fill={Colors.textSecondary}
        >
          {unit}
        </SvgText>
      )}
    </G>
  );
}

export default function MapScreen() {
  const live = useLiveStatus();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  const [groupFilter, setGroupFilter] = useState<MapGroup>('All');
  const [listOpen, setListOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: 340, height: 480 });
  const [scale, setScale] = useState(MIN_SCALE);

  // Drag to pan. PanResponder rather than a gesture-handler recogniser
  // because it behaves identically under a mouse on the web build, which is
  // where most people will meet this map.
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panOffset = useRef({ x: 0, y: 0 });
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
        onPanResponderGrant: () => {
          pan.setOffset(panOffset.current);
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_e, g) => {
          panOffset.current = {
            x: panOffset.current.x + g.dx,
            y: panOffset.current.y + g.dy,
          };
          pan.flattenOffset();
        },
      }),
    [pan]
  );

  const recenter = () => {
    panOffset.current = { x: 0, y: 0 };
    pan.setValue({ x: 0, y: 0 });
    setScale(MIN_SCALE);
  };

  const changeGroupFilter = (g: MapGroup) => {
    setGroupFilter(g);
    setSelected(null);
    recenter();
  };

  const mapLines = TRANSIT_LINES.filter(l =>
    LINE_PATHS[l.id] && (groupFilter === 'All' || l.group === groupFilter)
  );
  const selectedLine = mapLines.find(l => l.id === selected) ?? null;
  const selectedStatus = selectedLine ? live[selectedLine.id] : null;

  // The diagram is drawn to fill the viewport's width, then scaled by the
  // zoom control. Its own aspect ratio never changes.
  const baseW = viewport.width;
  const baseH = baseW * (VIEW_HEIGHT / VIEW_WIDTH);

  const strokeFor = (line: TransitLine) => {
    if (!selected) return { opacity: 1, width: line.group === 'Boats' ? 2.5 : 3.5 };
    return selected === line.id
      ? { opacity: 1, width: 5 }
      : { opacity: 0.15, width: 2.5 };
  };

  const calloutLines = mapLines.filter(line => {
    if (!LINE_MARKERS[line.id]) return false;
    const st = live[line.id];
    if (!st) return false;
    // A fault always earns its callout. Being shut for the night does not:
    // that is the whole map at 2am, and the muted line already says it.
    if (st.status === 'down' || st.status === 'delayed') return true;
    return mapLines.length <= MAX_CALLOUTS;
  });

  const zoomBy = (delta: number) =>
    setScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((s + delta) * 10) / 10)));

  const moved = scale !== MIN_SCALE || panOffset.current.x !== 0 || panOffset.current.y !== 0;

  return (
    <View style={styles.screen}>
      {/* No title bar. The reference app's map tab opens straight onto its
          filter rail under the status bar, and a blue band with the words
          "Transit Map" on it is chrome explaining chrome. */}
      <View style={{ paddingTop: insets.top, backgroundColor: Colors.sectionBg }}>
        <IconTabs
          items={MAP_TABS}
          value={groupFilter}
          onChange={changeGroupFilter}
          accessibilityLabel="Filter map by mode"
        />
      </View>

      {/* Full-bleed and draggable. It used to be a fixed picture inside a
          scrolling page, which meant the only way to read a clipped label was
          to hope it wasn't clipped. */}
      <View
        style={styles.viewport}
        onLayout={(e: LayoutChangeEvent) =>
          setViewport({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
        {...responder.panHandlers}
      >
        <Animated.View
          style={{
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
          }}
        >
          <Svg width={baseW} height={baseH} viewBox={`${VIEW_MIN_X} 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
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
                    stroke={
                      st === 'down' ? Colors.statusDown
                        : st === 'closed' ? Colors.dividerStrong
                          : line.color
                    }
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

            {/* Live callouts, drawn last so nothing crosses them */}
            {calloutLines.map(line => {
              const m = LINE_MARKERS[line.id];
              const st = live[line.id];
              if (st.status === 'closed') {
                return <Callout key={line.id} x={m.x} y={m.y} value="Closed" tone={Colors.statusClosed} />;
              }
              if (st.status === 'down') {
                return <Callout key={line.id} x={m.x} y={m.y} value="Down" tone={Colors.statusDown} />;
              }
              if (line.headwayMinutes[1] <= 1) {
                return <Callout key={line.id} x={m.x} y={m.y} value="Now" tone={Colors.statusOperating} />;
              }
              const next = st.nextArrivals[0];
              const tone = st.status === 'delayed' ? Colors.statusDelayed : Colors.textPrimary;
              // "0 min" is not how anyone says it, here or anywhere else in
              // the app.
              if (next === 0) {
                return <Callout key={line.id} x={m.x} y={m.y} value="Now" tone={tone} />;
              }
              return (
                <Callout
                  key={line.id}
                  x={m.x} y={m.y}
                  value={next != null ? String(next) : '—'}
                  unit="min"
                  tone={tone}
                />
              );
            })}
          </Svg>
        </Animated.View>

        {/* Zoom, and a way back when the map has been dragged off-screen */}
        <View style={styles.zoomStack}>
          <TouchableOpacity
            style={[styles.zoomBtn, styles.zoomBtnTop]}
            onPress={() => zoomBy(0.4)}
            disabled={scale >= MAX_SCALE}
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
          >
            <Ionicons name="add" size={20} color={scale >= MAX_SCALE ? Colors.textPlaceholder : Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={() => zoomBy(-0.4)}
            disabled={scale <= MIN_SCALE}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
          >
            <Ionicons name="remove" size={20} color={scale <= MIN_SCALE ? Colors.textPlaceholder : Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {moved && (
          <TouchableOpacity
            style={styles.recenter}
            onPress={recenter}
            accessibilityRole="button"
            accessibilityLabel="Recenter the map"
          >
            <Ionicons name="scan-outline" size={18} color={Colors.primaryBlue} />
            <Text style={styles.recenterText}>Recenter</Text>
          </TouchableOpacity>
        )}

        {/* The reference app's floating list toggle, bottom right */}
        <TouchableOpacity
          style={styles.showList}
          onPress={() => setListOpen(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Show the line list"
        >
          <Ionicons name="list" size={20} color={Colors.textPrimary} />
          <Text style={styles.showListText}>Show List</Text>
        </TouchableOpacity>
      </View>

      {listOpen && (
        <AppModal transparent animationType="slide" onRequestClose={() => setListOpen(false)}>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setListOpen(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Lines</Text>
                <TouchableOpacity
                  onPress={() => setListOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close the line list"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.done}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {selectedLine && selectedStatus && (
                  <View style={styles.selectedBlock}>
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
                            : `Every ${selectedStatus.headwayMinutes[0]}-${selectedStatus.headwayMinutes[1]} min`)}
                      {selectedStatus.status === 'down' && selectedStatus.etaMinutes
                        ? ` · about ${formatEta(selectedStatus.etaMinutes)} to restore`
                        : ''}
                    </Text>
                    <Text style={styles.selectedHours}>Service: {selectedLine.serviceHours}</Text>
                  </View>
                )}

                {mapLines.map((line, i) => {
                  const st = live[line.id]?.status ?? 'operating';
                  const sc = StatusColors[st];
                  const active = selected === line.id;
                  return (
                    <View key={line.id}>
                      {i > 0 && <Divider />}
                      <TouchableOpacity
                        style={[styles.legendRow, active && styles.legendRowActive]}
                        onPress={() => { setSelected(active ? null : line.id); setListOpen(false); }}
                        activeOpacity={0.6}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <ModeGlyph mode={line.mode} size={24} />
                        <Text style={styles.legendName} numberOfLines={2}>{line.name}</Text>
                        <View style={[styles.legendPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                          <Text style={[styles.legendPillText, { color: sc.text }]}>{STATUS_LABEL[st]}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <Text style={styles.busNote}>
                  Bus routes are not drawn. Resort buses connect every resort to every park
                  and Disney Springs. See Transportation Status for bus service levels.
                </Text>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </AppModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.sectionBg,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.sectionBg,
  },
  zoomStack: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.sectionBg,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnTop: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  recenter: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.sectionBg,
  },
  recenterText: {
    ...Type.label,
    color: Colors.primaryBlue,
  },
  showList: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: Colors.sectionBg,
    shadowColor: '#0E2C4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  showListText: {
    ...Type.action,
    color: Colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,44,75,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: Colors.sectionBg,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: Spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
  done: {
    ...Type.action,
    color: Colors.primaryBlue,
  },
  selectedBlock: {
    padding: Spacing.lg,
    backgroundColor: Colors.primaryTint,
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
    padding: Spacing.lg,
  },
});
