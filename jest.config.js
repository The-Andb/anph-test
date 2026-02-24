const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  rootDir: '..', // Set rootDir to monorepo root
  testMatch: [
    '<rootDir>/andb-test/unit/**/*.spec.ts',
    '<rootDir>/andb-test/integration/**/*.spec.ts',
    '<rootDir>/andb-test/e2e/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleNameMapper: {
    '^@the-andb/core$': '<rootDir>/andb-core/src',
    '^@the-andb/core/(.*)$': '<rootDir>/andb-core/src/$1',
    '^@the-andb/cli/(.*)$': '<rootDir>/andb-cli/src/$1'
  },
  moduleDirectories: ['node_modules', path.resolve(__dirname, '../node_modules')],
  collectCoverage: true,
  coverageDirectory: 'andb-test/coverage/aio',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  collectCoverageFrom: [
    '<rootDir>/andb-core/src/modules/**/*.ts',
    '<rootDir>/andb-cli/src/commands/**/*.ts',
    '!<rootDir>/**/*.spec.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/andb-test/setup/integration.setup.ts'],
  testTimeout: 60000,
  verbose: true,
};
