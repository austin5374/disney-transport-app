import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { Colors } from '../utils/theme';
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
          open:  { animation: 'timing', config: { duration: 350 } },
          close: { animation: 'timing', config: { duration: 350 } },
        },
      }}
    >
      <Stack.Screen name="Search"  component={SearchScreen}  />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="Detail"  component={DetailScreen}  />
    </Stack.Navigator>
  );
}

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Status:  { active: 'pulse',            inactive: 'pulse-outline' },
  Map:     { active: 'map',              inactive: 'map-outline' },
  Planner: { active: 'navigate-circle',  inactive: 'navigate-circle-outline' },
  More:    { active: 'menu',             inactive: 'menu-outline' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.primaryBlue,
          tabBarInactiveTintColor: Colors.textPlaceholder,
          tabBarStyle: {
            borderTopColor: Colors.cardBorder,
            ...(Platform.OS === 'web' ? { height: 60, paddingBottom: 8 } : {}),
          },
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Status"  component={StatusScreen} />
        <Tab.Screen name="Map"     component={MapScreen} />
        <Tab.Screen name="Planner" component={PlannerStack} />
        <Tab.Screen name="More"    component={MoreScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
