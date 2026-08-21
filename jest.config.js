/** Two suites, because they need two different worlds.
 *
 *  The route graph and the live-status engine are plain TypeScript with no
 *  React Native imports, so they run under ts-jest directly: no native
 *  transform pipeline, no simulator, and a full sweep of all 1,056
 *  destination pairs finishes in under a second.
 *
 *  The screens need the real React Native module graph, so they run under
 *  jest-expo. Keeping them apart means a component test can never slow the
 *  logic suite down, and the logic suite's `react-native` stub can never leak
 *  into a render — which is why that stub lives in src/testing/ rather than in
 *  a `__mocks__` directory, where Jest's automocking would hand it to the
 *  screen tests as well.
 */
module.exports = {
  projects: [
    {
      displayName: 'logic',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
      moduleNameMapper: {
        '^react-native$': '<rootDir>/src/testing/reactNativeStub.ts',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { diagnostics: { warnOnly: true } }],
      },
    },
    {
      displayName: 'screens',
      preset: 'jest-expo/ios',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.tsx'],
    },
  ],
};
