import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AppNavigator from './src/navigation/AppNavigator';
import { Gradients } from './src/utils/theme';

const FRAME_WIDTH = 460;
const FRAME_MAX_HEIGHT = 900;
// Below this, treat it as a real mobile viewport and skip the desktop frame.
const FRAME_MIN_VIEWPORT = 720;

// On web, a bare mobile layout stretched across a desktop window reads as
// unfinished — a phone-width column glued to the corner of an empty page.
// This centers the app in a fixed, phone-proportioned frame on wide
// viewports only; phones and narrow browser windows are untouched.
function WebFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < FRAME_MIN_VIEWPORT) {
    return <>{children}</>;
  }

  return (
    <LinearGradient
      colors={Gradients.sky}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.webBackdrop}
    >
      <View style={[styles.webFrame, { height: Math.min(height - 64, FRAME_MAX_HEIGHT) }]}>
        {children}
      </View>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <WebFrame>
        <AppNavigator />
      </WebFrame>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webFrame: {
    width: FRAME_WIDTH,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 48,
    elevation: 12,
  },
});
