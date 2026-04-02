import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors } from '../utils/theme';
import { ALL_ROUTES } from '../data/routes';
import AppHeader from '../components/AppHeader';
import JourneyDiagram from '../components/JourneyDiagram';
import StepCard from '../components/StepCard';
import BottomNav from '../components/BottomNav';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Detail'>;
  route: RouteProp<RootStackParamList, 'Detail'>;
};

export default function DetailScreen({ navigation, route: navRoute }: Props) {
  const { routeId, from, to, timeOverride } = navRoute.params;
  const timeDate = timeOverride ? new Date(timeOverride) : undefined;

  const routeData = useMemo(
    () => ALL_ROUTES.find(r => r.id === routeId),
    [routeId]
  );

  if (!routeData) {
    return (
      <View style={styles.screen}>
        <AppHeader showBack onBack={() => navigation.goBack()} title="Route not found" />
      </View>
    );
  }

  const timeStr = routeData.totalRideRange
    ? `${routeData.totalRideRange[0]}–${routeData.totalRideRange[1]} min`
    : `${routeData.totalRideMinutes} min`;

  // For MVP: step 2 is "current", step 1 is "done" if multi-leg, all others upcoming
  const currentStep = routeData.legs.length > 1 ? 1 : 0;

  const getStepState = (i: number): 'done' | 'current' | 'upcoming' => {
    if (i < currentStep) return 'done';
    if (i === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={routeData.name}
        subtitle={`${from.label} → ${to.label} · ${timeStr}`}
        timeOverride={timeDate ?? null}
        onResetTime={() => {}}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.round((currentStep / routeData.legs.length) * 100)}%` }]} />
        </View>

        {/* Journey diagram */}
        <JourneyDiagram route={routeData} />

        {/* Step-by-step cards */}
        <Text style={styles.sectionTitle}>Step-by-step</Text>

        {routeData.legs.map((leg, i) => (
          <StepCard
            key={i}
            leg={leg}
            stepNum={i + 1}
            totalSteps={routeData.legs.length}
            state={getStepState(i)}
          />
        ))}

        {/* Notes */}
        {routeData.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>ℹ️ {routeData.notes}</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav activeTab={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  scroll: {
    paddingBottom: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.cardBorder,
    marginTop: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryBlue,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  notesCard: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    backgroundColor: Colors.lightBlueTint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.blueBorder,
  },
  notesText: {
    fontSize: 12,
    color: Colors.primaryBlue,
    lineHeight: 18,
  },
});
