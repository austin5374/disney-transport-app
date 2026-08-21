import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
// Imported one weight at a time. Pulling them from the package root drags the
// whole Nunito Sans family into the bundle — sixteen faces, italics included,
// at about 113KB each — for the three this app actually sets type in. That was
// 1.8MB of fonts shipped to use 340KB of them.
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Colors, Type, Gradients } from './src/utils/theme';
import { useChromeTint } from './src/utils/frameChrome';
import { MODAL_HOST_ID } from './src/components/AppModal';

// iPhone 15 Pro's logical width. The frame was 460 for a while, which made
// every line break inside it wider than it is on a real phone.
const FRAME_WIDTH = 393;
const FRAME_MAX_HEIGHT = 852;
// Below this, treat it as a real mobile viewport and skip the desktop frame.
const FRAME_MIN_VIEWPORT = 720;

const STATUS_BAR_HEIGHT = 44;
const HOME_BAR_HEIGHT = 22;

const FRAME_INSETS = { top: STATUS_BAR_HEIGHT, bottom: 0, left: 0, right: 0 };

// A scrollbar track running down the inside of the phone is the single
// element that gives away that the frame is a div. Native platforms never
// see this rule; on web every scroller in the app is a phone scroller.
function useHiddenScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'app-scrollbar-reset';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent =
      '*::-webkit-scrollbar{width:0;height:0;display:none}' +
      '*{scrollbar-width:none;-ms-overflow-style:none}';
    document.head.appendChild(el);
  }, []);
}

// The HTML splash holds the screen until the app can paint over it. Fading it
// out on first render is what makes the boot read as one continuous sequence
// rather than as three unrelated screens.
//
// The ceiling matters as much as the trigger: if a font ever fails to resolve,
// a splash that waits for it is a permanently blue app.
const SPLASH_MAX_MS = 1800;

function useDismissBootSplash(ready: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const boot = document.getElementById('boot');
    if (!boot) return;

    let removeTimer: ReturnType<typeof setTimeout>;
    const dismiss = () => {
      boot.classList.add('boot-out');
      removeTimer = setTimeout(() => boot.remove(), 320);
    };

    if (ready) {
      dismiss();
      return () => clearTimeout(removeTimer);
    }
    const ceiling = setTimeout(dismiss, SPLASH_MAX_MS);
    return () => { clearTimeout(ceiling); clearTimeout(removeTimer); };
  }, [ready]);
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // Tick on the minute boundary rather than every second: the readout only
    // shows hours and minutes.
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** The status bar every screenshot of the reference app carries at the top.
 *  Without one, the frame reads as a web page in a rounded rectangle.
 *
 *  It floats over the screen rather than sitting above it, so the planner's
 *  banner gradient runs behind it exactly as it does on a phone. Screens keep
 *  clear of it by way of the safe-area inset the frame publishes below. */
function FakeStatusBar() {
  const tint = useChromeTint();
  const now = useClock();
  const onDark = tint === 'light';
  const fg = onDark ? Colors.textOnDark : Colors.tabActive;
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');

  return (
    <View
      style={styles.statusBar}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.statusLeft}>
        <Text style={[styles.statusTime, { color: fg }]}>{time}</Text>
        <Ionicons name="navigate" size={13} color={fg} />
      </View>
      <View style={styles.statusRight}>
        {[5, 7, 9, 11].map((h, i) => (
          <View
            key={h}
            style={[styles.signalBar, { height: h, backgroundColor: fg, opacity: i === 3 ? 0.35 : 1 }]}
          />
        ))}
        <Ionicons name="wifi" size={15} color={fg} style={styles.statusIcon} />
        <Ionicons name="battery-half" size={20} color={fg} style={styles.statusIcon} />
      </View>
    </View>
  );
}

function HomeIndicator() {
  return <View style={styles.homeBar}><View style={styles.homeBarPill} /></View>;
}

// On web, a bare mobile layout stretched across a desktop window reads as
// unfinished: a phone-width column glued to the corner of an empty page. This
// centers the app in a fixed, phone-proportioned frame on wide viewports
// only, complete with the status bar and home indicator a real device draws.
// Phones and narrow browser windows are untouched.
//
// The frame's own View always carries nativeID={MODAL_HOST_ID} (even when
// unframed) so AppModal has a DOM node to portal into that's clipped to the
// app's own bounds instead of the whole browser window. See AppModal.tsx.
function WebFrame({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  useHiddenScrollbars();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const framed = width >= FRAME_MIN_VIEWPORT;

  if (!framed) {
    return (
      <View nativeID={MODAL_HOST_ID} style={styles.unframed}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={Gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.webBackdrop}
    >
      <View style={[styles.webFrame, { height: Math.min(height - 64, FRAME_MAX_HEIGHT) }]}>
        {/* Modals portal into the host, appending after everything already
            inside it, so the status bar has to sit outside that node to stay
            on top of a bottom sheet the way a real one does. */}
        <View nativeID={MODAL_HOST_ID} style={styles.frameHost}>
          {/* Publishing the status bar's height as a safe-area inset is what
              lets every screen keep clear of it without any of them knowing
              the frame exists. `useSafeAreaInsets()` reports 0 on web, so
              without this the bar would sit on the first row of content. */}
          <SafeAreaInsetsContext.Provider value={FRAME_INSETS}>
            <View style={styles.frameBody}>{children}</View>
          </SafeAreaInsetsContext.Provider>
          <HomeIndicator />
        </View>
        <FakeStatusBar />
      </View>
    </LinearGradient>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });
  useDismissBootSplash(fontsLoaded);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* Rendered immediately rather than held behind `fontsLoaded`. Gating
          the whole tree on three font files bought a flicker-free first frame
          at the cost of seconds of blank screen — and on hotel wifi that is
          the entire first impression. The HTML splash covers the swap. */}
      <WebFrame>
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
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
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: Colors.sectionBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.28,
    shadowRadius: 48,
    elevation: 12,
  },
  frameHost: {
    position: 'relative',
    flex: 1,
  },
  frameBody: {
    flex: 1,
    overflow: 'hidden',
  },
  unframed: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusTime: {
    ...Type.label,
    fontSize: 15,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
  statusIcon: {
    marginLeft: 4,
  },
  homeBar: {
    height: HOME_BAR_HEIGHT,
    backgroundColor: Colors.sectionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBarPill: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.tabActive,
    opacity: 0.9,
  },
});
