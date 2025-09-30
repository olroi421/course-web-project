module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
};
