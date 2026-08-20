import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Route } from '../types';
import { Colors, StatusColors } from '../utils/theme';
import { lineForLeg } from '../data/lines';
import { useLiveStatus, ServiceStatus } from '../utils/liveStatus';
import TransportChip from './TransportChip';
import LiveArrival from './LiveArrival';

interface RouteCardProps {
  route: Route;
  index: number;
  isBest?: boolean;
  isScenic?: boolean;
  onPress: () => void;
  onSteps: () => void;
  timeOverride?: Date | null;
}

export default function RouteCard({
  route, index, isBest, isScenic, onPress, onSteps,
}: RouteCardProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const live = useLiveStatus();

  const isWater = route.tags.includes('water');
  const isBefore10 = route.tags.includes('before_10am_only') || route.tags.includes('time_restricted');
  const firstLeg = route.legs[0];

  // Worst live disruption across this route's legs
  let disruption: { status: ServiceStatus; name: string } | null = null;
  for (const leg of route.legs) {
    const line = lineForLeg(leg.mode, leg.from, leg.to);
    const st = line ? live[line.id] : null;
    if (st && st.status !== 'operating') {
      if (!disruption || st.status === 'down') {
        disruption = { status: st.status, name: line!.shortName };
      }
    }
  }

  const borderStyle = isBest
    ? { borderColor: Colors.primaryBlue, borderWidth: 1.5 }
    : isWater
    ? { borderColor: 'rgba(55,138,221,0.2)' }
    : {};

  const bgStyle = isWater
    ? { backgroundColor: 'rgba(55,138,221,0.03)' }
    : {};

  const timeStr = route.totalRideRange
    ? `${route.totalRideRange[0]}–${route.totalRideRange[1]}`
    : `${route.totalRideMinutes}`;

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.card, borderStyle, bgStyle]}
      >
        {/* Badge */}
        {isBest && (
          <View style={[styles.badge, styles.badgeBest]}>
            <Text style={styles.badgeBestText}>Fastest</Text>
          </View>
        )}
        {isScenic && !isBest && (
          <View style={[styles.badge, styles.badgeScenic]}>
            <Text style={styles.badgeScenicText}>Scenic</Text>
          </View>
        )}
        {isWater && !isScenic && !isBest && (
          <View style={[styles.badge, styles.badgeWater]}>
            <Text style={styles.badgeWaterText}>Water route</Text>
          </View>
        )}
        {isBefore10 && (
          <View style={[styles.badge, styles.badgeBefore10]}>
            <Text style={styles.badgeBefore10Text}>Before 10am route</Text>
          </View>
        )}
        {disruption && (
          <View style={[
            styles.badge,
            {
              backgroundColor: StatusColors[disruption.status].bg,
              borderWidth: 1,
              borderColor: StatusColors[disruption.status].border,
            },
          ]}>
            <Text style={[styles.badgeBestText, { color: StatusColors[disruption.status].text }]}>
              {disruption.status === 'down'
                ? `${disruption.name} temporarily down`
                : `${disruption.name} delays`}
            </Text>
          </View>
        )}

        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.routeName} numberOfLines={2}>{route.name}</Text>
          <View style={styles.timeBox}>
            <Text style={styles.timeNum}>{timeStr}</Text>
            <Text style={styles.timeLabel}>min</Text>
          </View>
        </View>

        {/* Transport chips */}
        <View style={styles.chipsRow}>
          {route.legs.map((leg, i) => (
            <React.Fragment key={i}>
              <TransportChip mode={leg.mode} />
              {i < route.legs.length - 1 && (
                <Text style={styles.arrow}> › </Text>
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          {firstLeg && <LiveArrival mode={firstLeg.mode} from={firstLeg.from} to={firstLeg.to} compact />}
          <TouchableOpacity onPress={onSteps} style={styles.stepsLink} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.stepsText}>Steps ›</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 5,
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgeBest: {
    backgroundColor: 'rgba(255,215,0,0.18)',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  badgeBestText: {
    color: Colors.warnText,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeScenic: {
    backgroundColor: Colors.waterBg,
    borderWidth: 1,
    borderColor: Colors.waterBorder,
  },
  badgeScenicText: {
    color: Colors.waterText,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeWater: {
    backgroundColor: Colors.lightBlueTint,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  badgeWaterText: {
    color: Colors.primaryBlue,
    fontSize: 11,
    fontWeight: '500',
  },
  badgeBefore10: {
    backgroundColor: Colors.warnBg,
    borderWidth: 1,
    borderColor: Colors.warnBorder,
  },
  badgeBefore10Text: {
    color: Colors.warnText,
    fontSize: 11,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginRight: 10,
  },
  timeBox: {
    alignItems: 'center',
    minWidth: 36,
  },
  timeNum: {
    fontSize: 22,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  timeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  arrow: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepsLink: {
    marginLeft: 'auto',
  },
  stepsText: {
    color: Colors.warnText,
    fontSize: 13,
    fontWeight: '500',
  },
});
