module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: '../android/',
        javaPackageName: 'com.networkbrotli',
      },
      ios: {
        podspecPath: '../NetworkBrotli.podspec',
      },
    },
  },
};
