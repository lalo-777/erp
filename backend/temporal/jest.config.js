/**
 * Configuracion de Jest para pruebas del backend
 * Ejecutar: npm test o npx jest --config temporal/jest.config.js
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/temporal'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'temporal/coverage',
  setupFilesAfterEnv: ['<rootDir>/temporal/setup.ts'],
  testTimeout: 10000,
  verbose: true,
};
