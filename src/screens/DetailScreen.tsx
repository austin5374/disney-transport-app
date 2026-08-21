import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors, Type, Spacing } from '../utils/theme';
import { journeyMinutes, waitMinutesFor, modeLabel } from '../utils/routing';
import AppHeader from '../components/AppHeader';
import JourneyDiagram from '../components/JourneyDiagram';
import StepCard from '../components/StepCard';
import InfoSheet from '../components/InfoSheet';
import Section from '../components/ui/Section';
import ActionRow from '../components/ui/ActionRow';
import StatBlock from '../components/ui/StatBlock';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Detail'>;
  route: RouteProp<RootStackParamList, 'Detail'>;
};

export default function DetailScreen({ navigation, route: navRoute }: Props) {
  const { routeData, from, to } = navRoute.params;
  const [info, setInfo] = useState<{ title: string; message: string } | null>(null);

  const ride = routeData.legs.reduce((s, l) => s + l.rideMinutes, 0);
  const walk = routeData.legs.reduce((s, l) => s + (l.walkMinutes ?? 0), 0);
  const wait = waitMinutesFor(routeData);
  const total = journeyMinutes(routeData);
  const transfers = routeData.legs.filter(l => l.mode !== 'walk').length - 1;
  const modes = Array.from(new Set(routeData.legs.map(l => modeLabel(l.mode)))).join(', ');

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={routeData.name}
        subtitle={`${from.label} to ${to.label}`}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Three-up action row, the shape the reference app opens every
            detail page with. */}
        <Section flush>
          <ActionRow
            items={[
              {
                icon: 'map-outline',
                label: 'Find on Map',
                onPress: () => navigation.getParent()?.navigate('Map' as never),
              },
              {
                icon: 'alert-circle-outline',
                label: 'Line Status',
                onPress: () => navigation.getParent()?.navigate('Status' as never),
              },
              {
                icon: 'bookmark-outline',
                label: 'Save Trip',
                onPress: () => setInfo({
                  title: 'Saved trips',
                  message: 'Saving a trip for later is not available in this build.',
                }),
              },
            ]}
          />
        </Section>

        <Section flush>
          <JourneyDiagram route={routeData} />
        </Section>

        {/* Centered label-over-value stack with hairline rules. The total is
            broken out into its parts so the headline number and the steps
            visibly reconcile. */}
        <Section>
          <StatBlock label="Total Journey" value={`${total} min`} />
          <StatBlock label="Typical Wait" value={wait > 0 ? `${wait} min` : 'None'} />
          <StatBlock label="Time Aboard" value={`${ride} min`} />
          {walk > 0 && <StatBlock label="Walking" value={`${walk} min`} />}
          <StatBlock label="Transfers" value={transfers > 0 ? String(transfers) : 'None'} />
          <StatBlock label="Transportation" value={modes} last />
        </Section>

        {routeData.notes ? (
          <Section eyebrow="Good To Know">
            <Text style={styles.notes}>{routeData.notes}</Text>
          </Section>
        ) : null}

        <View style={styles.stepsHeader}>
          <Text style={styles.stepsTitle}>Step By Step</Text>
        </View>

        {routeData.legs.map((leg, i) => (
          <StepCard
            key={`${leg.from}-${leg.to}-${i}`}
            leg={leg}
            stepNum={i + 1}
            totalSteps={routeData.legs.length}
          />
        ))}
      </ScrollView>

      <InfoSheet
        visible={info !== null}
        title={info?.title ?? ''}
        message={info?.message ?? ''}
        onClose={() => setInfo(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  scroll: {
    paddingBottom: Spacing.xl,
  },
  notes: {
    ...Type.body,
    color: Colors.textSecondary,
  },
  stepsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  stepsTitle: {
    ...Type.eyebrow,
    color: Colors.textSecondary,
  },
});
