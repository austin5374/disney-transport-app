// Screen tests run against the real React Native module graph, so the pieces
// that reach outside it have to be stood in for.

// A memory-backed AsyncStorage. The real one is a native module; the point of
// these tests is what the screens render, not where the bytes land.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (key: string) => store.get(key) ?? null,
      setItem: async (key: string, value: string) => { store.set(key, value); },
      removeItem: async (key: string) => { store.delete(key); },
      clear: async () => { store.clear(); },
    },
  };
});

// Ionicons drags in expo-font, expo-asset and expo-constants, none of which
// have a native module under Jest. These tests are about what the screens say,
// not which glyph sits beside it.
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name?: string }) =>
      React.createElement(View, { accessibilityLabel: name, testID: `icon-${name}` }),
  };
});

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 0, longitude: 0 } })),
  Accuracy: { Balanced: 3 },
}));

// The banner's gradient is a native view; everything drawn on top of it is
// plain SVG and renders fine.
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

// react-native-svg's touch mixin reaches for RN's long-removed Touchable
// module, which throws the moment the library is imported under Jest. The
// drawn art is not what a screen test is asserting, so every element becomes a
// plain view that keeps its props for the tree.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (displayName: string) => {
    const C = ({ children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
      React.createElement(View, rest, children);
    C.displayName = displayName;
    return C;
  };
  const names = [
    'Svg', 'Circle', 'Ellipse', 'G', 'Text', 'TSpan', 'TextPath', 'Path',
    'Polygon', 'Polyline', 'Line', 'Rect', 'Use', 'Image', 'Symbol', 'Defs',
    'LinearGradient', 'RadialGradient', 'Stop', 'ClipPath', 'Pattern', 'Mask',
  ];
  const mod: Record<string, unknown> = { __esModule: true, default: stub('Svg') };
  for (const name of names) mod[name] = stub(name);
  return mod;
});

// The safe-area provider reads a native module for the notch. Zero insets is
// the right answer in a test, and the frame's own inset override is exercised
// in the browser, not here.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaView: View,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 393, height: 852 }),
    initialWindowMetrics: { insets, frame: { x: 0, y: 0, width: 393, height: 852 } },
  };
});

jest.mock('expo-linking', () => ({
  createURL: (path: string) => `wdwtransport://${path}`,
}));
