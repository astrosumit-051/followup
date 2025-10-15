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
    '^@relationhub/database$': '<rootDir>/../../packages/database/src',
  },
  transformIgnorePatterns: [
    'node_modules/(?!jose)',
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
