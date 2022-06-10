module.exports = async () => {
    return {
        verbose: true,
        testTimeout: 20000,
        globalSetup: './tests/config/testSetup.js',
        globalTeardown: './tests/config/testTeardown.js'
    };
  };