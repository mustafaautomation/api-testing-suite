import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,
  setupFiles: ['dotenv/config'],
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'API Test Report',
        outputPath: 'reports/test-report.html',
        includeConsoleLog: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'junit.xml',
      },
    ],
  ],
  coverageDirectory: 'reports/coverage',
  collectCoverageFrom: ['src/**/*.ts'],
};

export default config;
