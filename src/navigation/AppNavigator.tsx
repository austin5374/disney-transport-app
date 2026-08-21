import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RootStackParamList } from '../types';
import { Colors, Brand } from '../utils/theme';
import StatusScreen from '../screens/StatusScreen';
import MapScreen from '../screens/MapScreen';
import MoreScreen from '../screens/MoreScreen';
import SearchScreen from '../screens/SearchScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function PlannerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => ({
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
          open:  { animation: 'timing', config: { duration: 280 } },
          close: { animation: 'timing', config: { duration: 280 } },
        },
      }}
    >
      <Stack.Screen name="Search"  component={SearchScreen}  />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Detail"  component={DetailScreen}  />
    </Stack.Navigator>
  );
}

// Five icon-only slots with a raised center action, matching the reference
// app's tab bar silhouette. The old bar carried four labeled tabs and used an
// EKG "pulse" glyph for service status — a dashboard metaphor, not one a
// guest would read.
const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Planner: { active: 'home',           inactive: 'home-outline' },
  Map:     { active: 'location',       inactive: 'location-outline' },
  NewTrip: { active: 'add-circle',     inactive: 'add-circle-outline' },
  Status:  { active: 'alert-circle',   inactive: 'alert-circle-outline' },
  More:    { active: 'menu',           inactive: 'menu-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Planner: 'Home',
  Map:     'Transit map',
  NewTrip: 'Start a new trip',
  Status:  'Transportation status',
  More:    'More',
};

// The center slot is an action, not a destination — it resets the planner and
// sends you back to a blank form.
function NewTripPlaceholder() {
  return <View style={styles.placeholder} />;
}

const screenOptions = ({ route }: { route: { name: string } }): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: false,
  tabBarActiveTintColor: Colors.primaryBlue,
  tabBarInactiveTintColor: Colors.textPlaceholder,
  tabBarAccessibilityLabel: TAB_LABELS[route.name],
  tabBarStyle: {
    backgroundColor: Colors.sectionBg,
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabBarIcon: ({ focused, color }) => {
    const icons = TAB_ICONS[route.name];
    const isCenter = route.name === 'NewTrip';
    return (
      <Ionicons
        name={focused && !isCenter ? icons.active : icons.inactive}
        size={isCenter ? 32 : 26}
        color={isCenter ? Colors.primaryBlue : color}
      />
    );
  },
});

export default function AppNavigator() {
  return (
    <NavigationContainer
      // Without this the browser tab title becomes the raw route name, so the
      // window chrome reads "Search", then "Results", then "Detail".
      documentTitle={{
        formatter: () => `${Brand.name} — ${Brand.tagline}`,
      }}
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
                screen: 'Search',
                params: { reset: Date.now() },
              });
            },
          })}
        />
        <Tab.Screen name="Status"  component={StatusScreen} />
        <Tab.Screen name="More"    component={MoreScreen} />
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
