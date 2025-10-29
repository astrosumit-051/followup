module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.(spec|e2e-spec)\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.{ts,js}'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@cordiq/database$': '<rootDir>/../../packages/database/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!jose)',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Performance optimizations to prevent memory exhaustion
  maxWorkers: '50%', // Use 50% of available CPU cores (prevents memory issues)
  workerIdleMemoryLimit: '512MB', // Kill workers using more than 512MB when idle

  // Test execution settings
  testTimeout: 30000, // 30 second timeout for async tests
  bail: false, // Continue running tests even if some fail

  // Memory leak detection
  detectLeaks: false, // Can be enabled for debugging but slows down tests
  detectOpenHandles: false, // Can be enabled to find async operations not properly closed
};
