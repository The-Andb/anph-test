/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@the-andb/core/(.*)$': '<rootDir>/../../andb-core/src/$1',
    '^@the-andb/cli/(.*)$': '<rootDir>/../../andb-cli/src/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node']
};
