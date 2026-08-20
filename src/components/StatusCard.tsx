import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TransitLine } from '../data/lines';
import { LineStatus, STATUS_LABEL, CROWD_LABEL } from '../utils/liveStatus';
import { Colors, StatusColors } from '../utils/theme';

interface StatusCardProps {
  line: TransitLine;
  status: LineStatus;
}

function arrivalsText(line: TransitLine, status: LineStatus): string {
  if (status.status === 'down') {
    return status.etaMinutes
      ? `Est. return to service: ${status.etaMinutes} min`
      : 'Return to service time not yet available';
  }
  if (line.headwayMinutes[1] <= 1) {
    return status.status === 'delayed' ? 'Boarding with brief pauses' : 'Boarding continuously';
  }
  if (status.nextArrivals.length === 0) return `Every ${line.headwayMinutes[0]}–${line.headwayMinutes[1]} min`;
  const [a, b] = status.nextArrivals;
  const first = a === 0 ? 'Arriving now' : `Next in ${a} min`;
  return b != null ? `${first} · then ${b} min` : first;
}

export default function StatusCard({ line, status }: StatusCardProps) {
  const sc = StatusColors[status.status];
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.card}>
      <View style={[styles.lineStripe, { backgroundColor: line.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{line.name}</Text>
          <View style={[styles.pill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
            <Animated.View style={[styles.pillDot, { backgroundColor: sc.text, opacity: pulse }]} />
            <Text style={[styles.pillText, { color: sc.text }]}>{STATUS_LABEL[status.status]}</Text>
          </View>
        </View>

        <Text style={styles.stations} numberOfLines={1}>
          {line.stations.join(' · ')}
        </Text>

        {status.detail ? (
          <Text style={[styles.detail, { color: sc.text }]} numberOfLines={2}>
            {status.detail}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <Text style={[
            styles.arrivals,
            status.status === 'down' ? { color: sc.text } : null,
          ]}>
            {arrivalsText(line, status)}
          </Text>
          {status.status !== 'down' && (
            <View style={styles.crowdWrap}>
              {[0, 1, 2].map(i => (
                <View
                  key={i}
                  style={[
                    styles.crowdBar,
                    { height: 5 + i * 3 },
                    (status.crowd === 'light' && i === 0) ||
                    (status.crowd === 'moderate' && i <= 1) ||
                    status.crowd === 'heavy'
                      ? styles.crowdBarOn
                      : null,
                  ]}
                />
              ))}
              <Text style={styles.crowdText}>{CROWD_LABEL[status.crowd]}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 4,
    overflow: 'hidden',
  },
  lineStripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stations: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  arrivals: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.liveGreen,
  },
  crowdWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  crowdBar: {
    width: 3.5,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    marginRight: 2,
  },
  crowdBarOn: {
    backgroundColor: Colors.textSecondary,
  },
  crowdText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginBottom: -1,
  },
});
