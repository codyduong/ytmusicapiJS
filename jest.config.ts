/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/*.test.ts'],
    },
    {
      displayName: 'browser',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/browser/*.test.ts'],
    },
  ],
};
