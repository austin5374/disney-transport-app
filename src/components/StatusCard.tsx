import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TransitLine } from '../data/lines';
import { LineStatus, STATUS_LABEL, CROWD_LABEL } from '../utils/liveStatus';
import { Colors, Type, Spacing, Radius, StatusColors, SECTION_GAP } from '../utils/theme';
import ModeGlyph from './ModeGlyph';
import OutlinedBox from './ui/OutlinedBox';

interface StatusCardProps {
  line: TransitLine;
  status: LineStatus;
}

function departureText(status: LineStatus, line: TransitLine): string {
  if (status.status === 'down') {
    return status.etaMinutes ? `About ${status.etaMinutes} min` : 'Unknown';
  }
  if (line.headwayMinutes[1] <= 1) {
    return status.status === 'delayed' ? 'Brief pauses' : 'Continuous';
  }
  if (status.nextArrivals.length === 0) {
    return `Every ${status.headwayMinutes[0]}-${status.headwayMinutes[1]} min`;
  }
  const [a, b] = status.nextArrivals;
  const first = a === 0 ? 'Now' : `${a} min`;
  return b != null ? `${first}, then ${b} min` : first;
}

function departureLabel(status: LineStatus): string {
  return status.status === 'down' ? 'Return To Service' : 'Next Departure';
}

export default function StatusCard({ line, status }: StatusCardProps) {
  const sc = StatusColors[status.status];
  const disrupted = status.status !== 'operating';
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // A line that is operating normally has nothing to signal. The previous
    // version ran an infinite loop on all 19 cards at once.
    if (!disrupted) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [disrupted, pulse]);

  return (
    <>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <View style={[styles.lineDot, { backgroundColor: line.color }]} />
              <Text style={styles.name} numberOfLines={2}>{line.name}</Text>
            </View>
            <Text style={styles.stations}>{line.stations.join(' · ')}</Text>
            <Text style={styles.hours}>{line.serviceHours}</Text>
          </View>
          <ModeGlyph mode={line.mode} size={34} tile />
        </View>

        <View style={[styles.pill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
          <Animated.View style={[styles.pillDot, { backgroundColor: sc.text, opacity: pulse }]} />
          <Text style={[styles.pillText, { color: sc.text }]}>{STATUS_LABEL[status.status]}</Text>
        </View>

        {status.trainsInService != null && !disrupted ? (
          <Text style={styles.note}>
            {status.trainsInService} monorail{status.trainsInService === 1 ? '' : 's'} running this beam
          </Text>
        ) : null}

        {status.detail ? (
          <Text style={[styles.detail, { color: sc.text }]}>{status.detail}</Text>
        ) : null}

        <OutlinedBox style={styles.box} color={disrupted ? sc.border : Colors.primaryBlue}>
          <View style={styles.boxLeft}>
            <Text style={styles.boxLabel}>{departureLabel(status)}</Text>
            <Text style={[styles.boxValue, disrupted && { color: sc.text }]}>
              {departureText(status, line)}
            </Text>
          </View>
          {!disrupted && (
            <View style={styles.crowdWrap}>
              {[0, 1, 2].map(i => {
                const on =
                  (status.crowd === 'light' && i === 0) ||
                  (status.crowd === 'moderate' && i <= 1) ||
                  status.crowd === 'heavy';
                return (
                  <View
                    key={i}
                    style={[styles.crowdBar, { height: 6 + i * 4 }, on && styles.crowdBarOn]}
                  />
                );
              })}
              <Text style={styles.crowdText}>{CROWD_LABEL[status.crowd]}</Text>
            </View>
          )}
        </OutlinedBox>
      </View>
      <View style={styles.gutter} />
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.sectionBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  gutter: {
    height: SECTION_GAP,
    backgroundColor: Colors.pageBg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  name: {
    ...Type.subtitle,
    flex: 1,
    color: Colors.textPrimary,
  },
  stations: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hours: {
    ...Type.caption,
    color: Colors.textPlaceholder,
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginTop: Spacing.md,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: Spacing.sm,
  },
  pillText: {
    ...Type.label,
  },
  note: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  detail: {
    ...Type.label,
    marginTop: Spacing.sm,
  },
  box: {
    marginTop: Spacing.lg,
  },
  boxLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  boxLabel: {
    ...Type.label,
    color: Colors.textPrimary,
  },
  boxValue: {
    ...Type.subtitle,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  crowdWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  crowdBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    marginRight: 2,
  },
  crowdBarOn: {
    backgroundColor: Colors.textSecondary,
  },
  crowdText: {
    ...Type.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    marginBottom: -2,
  },
});
