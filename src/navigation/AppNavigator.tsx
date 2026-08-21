import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootStackParamList, MoreStackParamList } from '../types';
import { Colors, Brand } from '../utils/theme';
import { setChromeTintForRoute, deepestRouteName } from '../utils/frameChrome';
import StatusScreen from '../screens/StatusScreen';
import MapScreen from '../screens/MapScreen';
import MoreScreen from '../screens/MoreScreen';
import AboutScreen from '../screens/AboutScreen';
import SavedTripsScreen from '../screens/SavedTripsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlannerScreen from '../screens/PlannerScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator<RootStackParamList>();
const More = createStackNavigator<MoreStackParamList>();
const Tab = createBottomTabNavigator();

const slideFromRight = {
  headerShown: false as const,
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      transform: [{
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width, 0],
        }),
      }],
    },
  }),
  transitionSpec: {
    open:  { animation: 'timing' as const, config: { duration: 280 } },
    close: { animation: 'timing' as const, config: { duration: 280 } },
  },
};

function PlannerStack() {
  return (
    <Stack.Navigator screenOptions={slideFromRight}>
      <Stack.Screen name="Plan"    component={PlannerScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Detail"  component={DetailScreen}  />
    </Stack.Navigator>
  );
}

// Transportation status lives under the ☰ hub, where the reference app keeps
// its secondary destinations, rather than occupying a tab slot the reference
// gives to search.
function MoreStack() {
  return (
    <More.Navigator screenOptions={slideFromRight}>
      <More.Screen name="MoreHome" component={MoreScreen} />
      <More.Screen name="Status"     component={StatusScreen} />
      <More.Screen name="SavedTrips" component={SavedTripsScreen} />
      <More.Screen name="About"      component={AboutScreen} />
    </More.Navigator>
  );
}

// Five slots with a raised center action: Home · Map · ⊕ · Search · More.
// That order is the reference app's, and it is muscle memory for anyone who
// has used it. The old bar put an exclamation-mark glyph in the search
// position, which reads as the wrong app and as a permanent error state.
const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Planner: { active: 'home',    inactive: 'home-outline' },
  Map:     { active: 'location', inactive: 'location-outline' },
  NewTrip: { active: 'add-circle-outline', inactive: 'add-circle-outline' },
  Search:  { active: 'search',  inactive: 'search-outline' },
  More:    { active: 'menu',    inactive: 'menu-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Planner: 'Home',
  Map:     'Transit map',
  NewTrip: 'Start a new trip',
  Search:  'Search',
  More:    'More',
};

// The center slot is an action, not a destination. It resets the planner and
// sends you back to a blank form.
function NewTripPlaceholder() {
  return <View style={styles.placeholder} />;
}

// Every screen gets a URL
//
// The app was a single-route SPA: every screen was "/", so a trip could not be
// shared and the browser's back button left the app instead of stepping back a
// screen. Route params are destination ids precisely so they can live in a
// path, and the OG tags that were already set up finally have distinct pages
// to preview.
const linking = {
  prefixes: [Linking.createURL('/'), 'https://disney-transport-app.vercel.app'],
  config: {
    screens: {
      Planner: {
        path: '',
        screens: {
          Plan: '',
          Results: 'trip/:fromId/:toId',
          Detail: 'trip/:fromId/:toId/:routeId',
        },
      },
      Map: 'map',
      Search: 'search',
      More: {
        path: 'more',
        screens: {
          MoreHome: '',
          Status: 'status',
          SavedTrips: 'saved',
          About: 'about',
        },
      },
    },
  },
};

const screenOptions = ({ route }: { route: { name: string } }): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: false,
  // The reference app fills the selected glyph in near-black navy and leaves
  // the rest mid-gray. Painting the active tab in the interactive blue made
  // the bar read as though a tab were permanently highlighted.
  tabBarActiveTintColor: Colors.tabActive,
  tabBarInactiveTintColor: Colors.tabInactive,
  tabBarAccessibilityLabel: TAB_LABELS[route.name],
  tabBarStyle: {
    backgroundColor: Colors.sectionBg,
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    height: 58,
    paddingTop: 6,
    paddingBottom: 6,
  },
  tabBarIcon: ({ focused, color }) => {
    const icons = TAB_ICONS[route.name];
    // The ⊕ never lights up: it performs an action rather than selecting a
    // destination, so a selected state would be a lie.
    const isCenter = route.name === 'NewTrip';
    return (
      <Ionicons
        name={focused && !isCenter ? icons.active : icons.inactive}
        size={isCenter ? 30 : 25}
        color={isCenter ? Colors.tabInactive : color}
      />
    );
  },
});

export default function AppNavigator() {
  return (
    <NavigationContainer
      linking={linking}
      // Without this the browser tab title becomes the raw route name, so the
      // window chrome reads "Plan", then "Results", then "Detail".
      documentTitle={{ formatter: () => Brand.title }}
      // The desktop frame draws a status bar whose contents have to invert
      // over the planner's blue banner. One line here, no prop drilling.
      onStateChange={state => setChromeTintForRoute(deepestRouteName(state))}
    >
      <Tab.Navigator initialRouteName="Planner" screenOptions={screenOptions}>
        <Tab.Screen name="Planner" component={PlannerStack} />
        <Tab.Screen name="Map"     component={MapScreen} />
        <Tab.Screen
          name="NewTrip"
          component={NewTripPlaceholder}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('Planner', {
                screen: 'Plan',
                params: { reset: Date.now() },
              });
            },
          })}
        />
        <Tab.Screen name="Search"  component={SearchScreen} />
        <Tab.Screen name="More"    component={MoreStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
});
