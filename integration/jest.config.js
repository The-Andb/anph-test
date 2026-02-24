/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: 'integration/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@the-andb/core$': '<rootDir>/../andb-core/src',
    '^@the-andb/core/(.*)$': '<rootDir>/../andb-core/src/$1',
  },
  testEnvironment: 'node',
  testTimeout: 60000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/setup/integration.setup.ts'],
};
