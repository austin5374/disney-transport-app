/** Logic-only test setup.
 *
 *  The route graph and the routing engine are plain TypeScript with no React
 *  Native imports, so they run under ts-jest directly — no jest-expo, no
 *  native transform pipeline, no simulator. `react-native` is stubbed for the
 *  live-status tests, which touch Platform and AppState but nothing else.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: { warnOnly: true } }],
  },
};
