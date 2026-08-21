import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Colors, Type, Spacing } from '../utils/theme';
import { getActiveRoutes, journeyMinutes, waitMinutesFor } from '../utils/routing';
import { DESTINATION_MAP } from '../data/destinations';
import { useLiveStatusAt } from '../utils/liveStatus';
import { useIsTripSaved, toggleSavedTrip } from '../utils/savedTrips';
import { goToMap, goToStatus } from '../utils/navigateTab';
import AppHeader from '../components/AppHeader';
import JourneyDiagram from '../components/JourneyDiagram';
import ModeScene from '../components/ModeScene';
import StepCard from '../components/StepCard';
import Section from '../components/ui/Section';
import ActionRow from '../components/ui/ActionRow';
import StatBlock from '../components/ui/StatBlock';
import StatRow from '../components/ui/StatRow';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Detail'>;
  route: RouteProp<RootStackParamList, 'Detail'>;
};

export default function DetailScreen({ navigation, route: navRoute }: Props) {
  const { fromId, toId, routeId, timeOverride } = navRoute.params;
  const at = timeOverride ? new Date(timeOverride).getTime() : null;
  const live = useLiveStatusAt(at);
  const saved = useIsTripSaved(fromId, toId);

  const from = DESTINATION_MAP[fromId];
  const to = DESTINATION_MAP[toId];
  // Recomputed rather than carried through navigation. A route is a function
  // of the network and the hour, so a snapshot taken on the previous screen
  // could be stale by the time it is read, and could not survive a link.
  const routeData = useMemo(
    () => (from && to
      ? getActiveRoutes(fromId, toId, at ? new Date(at) : undefined).find(r => r.id === routeId)
      : undefined),
    [from, to, fromId, toId, routeId, at]
  );

  if (!from || !to || !routeData) {
    return (
      <View style={styles.screen}>
        <AppHeader showBack onBack={() => navigation.goBack()} title="Route Not Available" />
        <Section>
          <Text style={styles.missingTitle}>This route isn't running</Text>
          <Text style={styles.notes}>
            Either the link points somewhere we don't recognise, or the service it
            described has ended for the day. Go back and we'll show you what is running.
          </Text>
        </Section>
      </View>
    );
  }

  const ride = routeData.legs.reduce((s, l) => s + l.rideMinutes, 0);
  const walk = routeData.legs.reduce((s, l) => s + (l.walkMinutes ?? 0), 0);
  const wait = waitMinutesFor(routeData, live);
  const total = journeyMinutes(routeData, live);
  const transfers = routeData.legs.filter(l => l.mode !== 'walk').length - 1;
  // The hero shows what you actually board, so a leading walk to the stop is
  // not the picture anyone wants.
  const heroMode = (routeData.legs.find(l => l.mode !== 'walk') ?? routeData.legs[0]).mode;

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        onBack={() => navigation.goBack()}
        title={routeData.name}
        subtitle={`${from.label} to ${to.label}`}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Every detail page in the reference app opens on an image. This one
            is drawn rather than photographed — see ModeScene — but it does the
            same job: it tells you what you are about to ride before you read
            a word. */}
        <ModeScene mode={heroMode} height={168} />

        {/* The action row the reference app opens every detail page with.
            Every item here navigates somewhere real; a control whose only
            behaviour is to announce that it does nothing is worse than no
            control at all. */}
        <Section flush>
          <ActionRow
            items={[
              {
                icon: 'map-outline',
                label: 'Find on Map',
                onPress: () => goToMap(navigation.getParent()),
              },
              {
                icon: 'alert-circle-outline',
                label: 'Line Status',
                onPress: () => goToStatus(navigation.getParent()),
              },
              {
                icon: saved ? 'bookmark' : 'bookmark-outline',
                label: saved ? 'Saved' : 'Save Trip',
                onPress: () => toggleSavedTrip(from.id, to.id),
              },
            ]}
          />
        </Section>

        <Section flush>
          <JourneyDiagram route={routeData} />
        </Section>

        {/* One headline number in the reference's centered label-over-value
            treatment, with its parts underneath as a single row so the total
            and the steps visibly reconcile without six screens of scrolling.
            "Transportation" is gone: the chips on the previous screen and the
            steps below both already say which vehicles this trip uses. */}
        <Section>
          <StatBlock label="Total Journey" value={`${total} min`} last />
          <StatRow
            items={[
              { label: 'Wait', value: wait > 0 ? `${wait} min` : 'None' },
              { label: 'Aboard', value: `${ride} min` },
              { label: 'Walking', value: walk > 0 ? `${walk} min` : 'None' },
              { label: transfers === 1 ? 'Transfer' : 'Transfers', value: String(Math.max(0, transfers)) },
            ]}
          />
        </Section>

        {routeData.notes ? (
          <Section header="Good to Know">
            <Text style={styles.notes}>{routeData.notes}</Text>
          </Section>
        ) : null}

        <View style={styles.stepsHeader}>
          <Text style={styles.stepsTitle}>Step by Step</Text>
        </View>

        {routeData.legs.map((leg, i) => (
          <StepCard
            key={`${leg.from}-${leg.to}-${i}`}
            leg={leg}
            stepNum={i + 1}
            totalSteps={routeData.legs.length}
            live={live}
            at={at ?? undefined}
          />
        ))}
      </ScrollView>
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
  missingTitle: {
    ...Type.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  stepsTitle: {
    ...Type.title,
    color: Colors.textPrimary,
  },
});
