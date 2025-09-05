module.exports = {
  dependency: {
    platforms: {
      android: {
        packageInstance: 'new NetworkBrotliPackage()',
        packageName: 'com.networkbrotli',
      },
    },
  },
  project: {
    android: {
      packageName: 'com.networkbrotli',
    },
  },
};
