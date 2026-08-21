import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Colors, Gradients } from './src/utils/theme';
import { MODAL_HOST_ID } from './src/components/AppModal';

const FRAME_WIDTH = 460;
const FRAME_MAX_HEIGHT = 900;
// Below this, treat it as a real mobile viewport and skip the desktop frame.
const FRAME_MIN_VIEWPORT = 720;

// On web, a bare mobile layout stretched across a desktop window reads as
// unfinished. A phone-width column glued to the corner of an empty page.
// This centers the app in a fixed, phone-proportioned frame on wide
// viewports only; phones and narrow browser windows are untouched.
//
// The frame's own View always carries nativeID={MODAL_HOST_ID} (even when
// unframed) so AppModal has a DOM node to portal into that's clipped to the
// app's own bounds instead of the whole browser window. See AppModal.tsx.
function WebFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const framed = width >= FRAME_MIN_VIEWPORT;

  const content = (
    <View
      nativeID={MODAL_HOST_ID}
      style={framed ? [styles.webFrame, { height: Math.min(height - 64, FRAME_MAX_HEIGHT) }] : styles.unframed}
    >
      {children}
    </View>
  );

  if (!framed) return content;

  return (
    <LinearGradient
      colors={Gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.webBackdrop}
    >
      {content}
    </LinearGradient>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <WebFrame>
        {fontsLoaded ? (
          <ErrorBoundary>
            <AppNavigator />
          </ErrorBoundary>
        ) : (
          // Every text style in the app names a bundled font explicitly, so
          // rendering before the fonts resolve would flash the system face on
          // first paint and then reflow. A brief neutral hold is quieter.
          <View style={styles.booting}>
            <ActivityIndicator color={Colors.primaryBlue} />
          </View>
        )}
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
    position: 'relative',
    width: FRAME_WIDTH,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: Colors.sectionBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 48,
    elevation: 12,
  },
  unframed: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  booting: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.pageBg,
  },
});
