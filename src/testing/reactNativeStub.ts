// Minimal stand-in so utils that read Platform / AppState can be unit tested
// without pulling in the whole React Native runtime.
export const Platform = { OS: 'web' as const, select: (o: Record<string, unknown>) => o.web };
export const AppState = {
  addEventListener: () => ({ remove: () => {} }),
  currentState: 'active',
};
