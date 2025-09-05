# React Native Network Brotli - Development & Publishing Guide

This document contains all the commands and procedures used during the development and publishing of the react-native-network-brotli package.

## Table of Contents
- [Initial Setup](#initial-setup)
- [Development Commands](#development-commands)
- [Build System Configuration](#build-system-configuration)
- [Testing](#testing)
- [Publishing to npm](#publishing-to-npm)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Initial Setup

### Create React Native Library
```bash
# Create library using create-react-native-library
npx create-react-native-library react-native-network-brotli
# Select: Turbo module, Kotlin & Objective-C++
```

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install example dependencies
npm install --workspace=example
# or
cd example && npm install
```

## Development Commands

### Building the Library
```bash
# Build TypeScript and JavaScript modules
npm run prepare
# or directly
npx react-native-builder-bob build

# Clean previous builds
npm run clean
```

### Code Quality
```bash
# Type checking
npm run typecheck
# or
npx tsc --noEmit

# Linting
npm run lint
# or
npx eslint "**/*.{js,ts,tsx}"

# Auto-fix lint issues
npx eslint . --fix

# Format code with Prettier
npx prettier . --write

# Format specific files
npx prettier __tests__/index.test.ts example/src/App.tsx src/index.tsx src/NativeNetworkBrotli.ts --write
```

### Testing
```bash
# Run tests
npm test
# or
npx jest

# Run tests with coverage
npx jest --coverage

# Run specific test files
npx jest __tests__/index.test.ts
```

## Build System Configuration

### Android Gradle Setup

#### Library Build Configuration
```bash
# Navigate to android directory
cd android

# Build library directly (if gradlew exists)
./gradlew build

# Clean Android build
./gradlew clean
```

#### Example App Build
```bash
# Navigate to example android directory
cd example/android

# Build debug APK
./gradlew assembleDebug --no-daemon --console=plain

# Clean example build
./gradlew clean

# Check Gradle version
./gradlew --version
```

### Gradle Wrapper Setup
```bash
# Add Gradle wrapper to android directory
cd android
gradle wrapper --gradle-version 8.14.3
```

### Package Dependencies
```bash
# Check package versions
npm view @react-native/gradle-plugin versions --json

# Install missing ESLint plugins
npm i -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
npm i -D eslint-plugin-react@latest eslint-plugin-react-hooks@latest 
npm i -D eslint-plugin-react-native@latest eslint-plugin-jest@latest
npm i -D eslint-plugin-ft-flow@latest
```

## Publishing to npm

### Pre-publishing Checks
```bash
# Check npm login status
npm whoami

# Login to npm (if not logged in)
npm login

# Check if package name is available
npm view react-native-network-brotli

# Verify package contents before publishing
npm pack --dry-run
```

### Publishing Process
```bash
# Build the package
npm run prepare

# Publish to npm
npm publish

# Verify publication
npm view react-native-network-brotli
```

### Version Management
```bash
# Update version (using release-it if configured)
npm run release

# Manual version bump
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

## Git Commands Used

### Repository Management
```bash
# Check repository status
git status
git status --porcelain

# View changes
git diff
git diff HEAD

# Stage all changes
git add -A

# Commit with detailed message
git commit -F - << 'EOF'
feat: add native Brotli support with APIs; modernize Android build; update example and docs

[detailed commit message content]
EOF

# Commit bypassing hooks (if needed)
git commit --no-verify -m "commit message"

# View commit history
git log --oneline
```

## Troubleshooting

### Common Issues and Solutions

#### Android Gradle Plugin Issues
```bash
# Error: Plugin with id 'com.facebook.react' not found
# Solution: Remove the plugin and dependencies, use manual linking

# Check React Native versions and compatibility
npm view react-native@0.81.0

# View React Native internal gradle configuration
cat node_modules/react-native/gradle/libs.versions.toml
```

#### ESLint Configuration Issues
```bash
# Install missing ESLint dependencies
npm i -D @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
npm i -D eslint-plugin-react@latest eslint-plugin-react-hooks@latest
npm i -D eslint-plugin-react-native@latest eslint-plugin-jest@latest
npm i -D eslint-plugin-ft-flow@latest

# Check ESLint configuration
npx eslint --print-config src/index.tsx
```

#### Build Failures
```bash
# Clean all build artifacts
npm run clean

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean example builds
rm -rf example/node_modules example/android/build example/ios/build
cd example && npm install
```

#### TypeScript Issues
```bash
# Generate TypeScript types
npx tsc --declaration --emitDeclarationOnly --outDir lib/typescript

# Check TypeScript configuration
npx tsc --showConfig
```

## Project Structure

### Key Files Created/Modified
```
react-native-network-brotli/
├── __tests__/
│   └── index.test.ts                 # Comprehensive test suite
├── android/
│   ├── build.gradle                  # Library build configuration
│   ├── gradle.properties             # Gradle properties
│   ├── gradle/wrapper/               # Gradle wrapper files
│   ├── gradlew*                      # Gradle wrapper scripts
│   └── src/main/java/com/networkbrotli/
│       ├── NetworkBrotliModule.kt    # Main Android module
│       └── NetworkBrotliPackage.kt   # Package registration
├── ios/
│   ├── NetworkBrotli.h               # iOS header
│   └── NetworkBrotli.mm              # iOS implementation
├── example/
│   ├── android/
│   │   ├── app/build.gradle          # Example app build config
│   │   ├── build.gradle              # Project build config
│   │   └── settings.gradle           # Project settings
│   └── src/
│       └── App.tsx                   # Example app UI
├── src/
│   ├── index.tsx                     # Main library export
│   └── NativeNetworkBrotli.ts        # Native module interface
├── lib/                              # Built output (generated)
├── react-native.config.js            # Autolinking configuration
├── package.json                      # Package configuration
└── README.md                         # Documentation
```

## Environment Information

### Development Environment
- **Node.js**: v24.5.0
- **npm**: 11.5.2
- **React Native**: 0.81.0
- **Android Gradle Plugin**: 8.11.0
- **Gradle**: 8.14.3
- **Kotlin**: 2.1.20
- **Java**: 11
- **TypeScript**: 5.9.2

### Gradle Configuration
```gradle
// android/gradle.properties
NetworkBrotli_kotlinVersion=2.1.20
NetworkBrotli_minSdkVersion=24
NetworkBrotli_targetSdkVersion=36
NetworkBrotli_compileSdkVersion=36
```

### Package.json Scripts
```json
{
  "scripts": {
    "example": "yarn workspace react-native-network-brotli-example",
    "test": "jest",
    "typecheck": "tsc",
    "lint": "eslint \"**/*.{js,ts,tsx}\"",
    "clean": "del-cli android/build example/android/build example/android/app/build example/ios/build lib",
    "prepare": "bob build",
    "release": "release-it --only-version"
  }
}
```

## Links and References

### Published Package
- **npm Package**: https://www.npmjs.com/package/react-native-network-brotli
- **GitHub Repository**: https://github.com/MouliMohanN/react-native-network-brotli
- **Install Command**: `npm install react-native-network-brotli`

### Documentation
- React Native New Architecture: https://reactnative.dev/docs/the-new-architecture/landing-page
- TurboModules: https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules
- Gradle Plugin Documentation: https://developer.android.com/studio/releases/gradle-plugin

---

*This document serves as a comprehensive reference for maintaining and updating the react-native-network-brotli package.*
