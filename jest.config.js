module.exports = {
  verbose: true,
  testEnvironment: 'node',
  setupFiles: ['./jest/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  preset: 'ts-jest',
  testRegex: '.*(\\.test|tests).*\\.(ts|js)$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/__helpers__/',
    '/build/',
  ],
  collectCoverage: true,
  reporters: [
    'default',
  ],
  maxWorkers: 1
};
