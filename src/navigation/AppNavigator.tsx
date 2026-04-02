import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import SearchScreen from '../screens/SearchScreen';
import ResultsScreen from '../screens/ResultsScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
