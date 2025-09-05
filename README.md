# react-native-network-brotli

Enable transparent Brotli (br) support for React Native networking (fetch / XMLHttpRequest).

**React Native Network Brotli** brings **native Brotli (`br`) compression support** to React Native networking.  
Out of the box, React Native’s `fetch` and `XMLHttpRequest` don’t handle Brotli-encoded responses. This library patches the native network stack on both **Android (OkHttp)** and **iOS (NSURLProtocol)** so Brotli-compressed responses are automatically decoded before reaching your JavaScript code.

✅ **Features**

- 🔹 **Transparent integration** – works with `fetch` / `XMLHttpRequest`, no code changes needed
- 🔹 **Cross-platform** – Android (OkHttp with BrotliInterceptor) + iOS (NSURLProtocol + Brotli C lib)
- 🔹 **Native performance** – faster than WASM/JS Brotli decoding
- 🔹 **Zero config** – auto-registers on startup
- 🔹 **Easy install** – single dependency via npm + CocoaPods + Gradle

⚡ **Why use it?**  
If your backend sends Brotli (`Content-Encoding: br`) to save bandwidth, this library ensures your React Native app can read the responses natively — just like modern browsers do. No need to reconfigure your server for gzip-only responses or manually decode in JS.

## Installation

```sh
npm install react-native-network-brotli
```

### iOS Setup

After installing the package, you need to install the iOS dependencies:

```sh
cd ios && pod install
```

### Android Setup

No additional setup required for Android. The library will be automatically linked.

## Usage

### Basic Usage

The library automatically enables Brotli support when imported. No additional configuration is required for basic usage:

```javascript
import 'react-native-network-brotli';

// Now all fetch requests and XMLHttpRequest will automatically handle Brotli compression
fetch('https://your-api.com/data')
  .then((response) => response.json())
  .then((data) => console.log(data));
```

### Advanced Usage

For more control over Brotli behavior, you can use the provided API:

```javascript
import ReactNativeNetworkBrotli, {
  getBrotliStats,
  setBrotliEnabled,
  isBrotliEnabled,
} from 'react-native-network-brotli';

// Check if Brotli is enabled
const enabled = await isBrotliEnabled();
console.log('Brotli enabled:', enabled);

// Disable Brotli temporarily
if (enabled) {
  await setBrotliEnabled(false);
  console.log('Brotli disabled');
}

// Re-enable Brotli
await setBrotliEnabled(true);
console.log('Brotli re-enabled');

// Get usage statistics
const stats = await getBrotliStats();
console.log('Brotli Statistics:', {
  totalRequests: stats.totalRequests,
  brotliRequests: stats.brotliRequests,
  bytesDecompressed: stats.bytesDecompressed,
  compressionRatio: stats.compressionRatio,
});
```

### Class-based API

```javascript
import ReactNativeNetworkBrotli from 'react-native-network-brotli';

// Initialize manually (optional, as it's done automatically)
const initialized = await ReactNativeNetworkBrotli.initialize();

// Check status
const isEnabled = await ReactNativeNetworkBrotli.isEnabled();

// Toggle Brotli support
if (isEnabled) {
  await ReactNativeNetworkBrotli.setEnabled(false);
  console.log('Brotli disabled');
} else {
  await ReactNativeNetworkBrotli.setEnabled(true);
  console.log('Brotli enabled');
}

// Get and reset statistics
const stats = await ReactNativeNetworkBrotli.getStats();
console.log('Current stats:', stats);

await ReactNativeNetworkBrotli.resetStats();
console.log('Stats reset');
```

### TypeScript Support

The library includes full TypeScript definitions:

```typescript
import ReactNativeNetworkBrotli, {
  BrotliStats,
} from 'react-native-network-brotli';

// Type-safe statistics
const stats: BrotliStats = await ReactNativeNetworkBrotli.getStats();

// The BrotliStats interface includes:
interface BrotliStats {
  totalRequests: number; // Total network requests made
  brotliRequests: number; // Requests that used Brotli compression
  bytesDecompressed: number; // Total bytes decompressed
  compressionRatio: number; // Average compression ratio
}
```

### Error Handling

The library includes comprehensive error handling:

```javascript
import { setBrotliEnabled } from 'react-native-network-brotli';

try {
  await setBrotliEnabled(true);
  console.log('Brotli enabled successfully');
} catch (error) {
  console.error('Failed to enable Brotli:', error);
  // Handle error appropriately
}
```

## How it Works

This library works by:

1. **Android (OkHttp)**: Registers a custom interceptor that automatically handles `Content-Encoding: br` responses using the native Brotli decoder.

2. **iOS (NSURLProtocol)**: Implements a custom URL protocol that intercepts network requests and automatically decompresses Brotli-encoded responses.

3. **Transparent Integration**: Once installed, all `fetch()` calls and `XMLHttpRequest` instances automatically benefit from Brotli decompression without any code changes.

4. **Native Performance**: Decompression happens at the native layer, providing better performance compared to JavaScript-based solutions.

## API Reference

### Functions

#### `initializeBrotli(): Promise<boolean>`

Initializes Brotli support. Called automatically on import.

#### `isBrotliEnabled(): Promise<boolean>`

Checks if Brotli support is currently enabled.

#### `setBrotliEnabled(enabled: boolean): Promise<void>`

Enables or disables Brotli support.

#### `getBrotliStats(): Promise<BrotliStats>`

Returns usage statistics for Brotli decompression.

#### `resetBrotliStats(): Promise<void>`

Resets all usage statistics.

### Class Methods

All functions above are also available as static methods on the `ReactNativeNetworkBrotli` class:

- `ReactNativeNetworkBrotli.initialize()`
- `ReactNativeNetworkBrotli.isEnabled()`
- `ReactNativeNetworkBrotli.setEnabled(enabled)`
- `ReactNativeNetworkBrotli.getStats()`
- `ReactNativeNetworkBrotli.resetStats()`

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
