module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.dev.json' }],
  },
  testMatch: ['**/test/**/*.test.ts'],
};
