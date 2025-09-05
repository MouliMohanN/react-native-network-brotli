import NetworkBrotli from './NativeNetworkBrotli';
export type { BrotliStats } from './NativeNetworkBrotli';

/**
 * React Native Network Brotli
 *
 * Enables transparent Brotli (br) compression support for React Native networking.
 * This library automatically intercepts network requests and handles Brotli decompression
 * at the native level for better performance.
 */
export class ReactNativeNetworkBrotli {
  private static _initialized = false;

  /**
   * Initialize Brotli support for network requests.
   * This is called automatically when the library is imported.
   *
   * @returns Promise that resolves to true if initialization was successful
   */
  static async initialize(): Promise<boolean> {
    if (this._initialized) {
      return true;
    }
    try {
      const result = await NetworkBrotli.initialize();
      if (result) {
        this._initialized = true;
      }
      return result;
    } catch (error) {
      console.warn('Failed to initialize Brotli support:', error);
      return false;
    }
  }

  /**
   * Check if Brotli support is currently enabled
   *
   * @returns Promise that resolves to the current enabled state
   */
  static async isEnabled(): Promise<boolean> {
    try {
      return await NetworkBrotli.isEnabled();
    } catch (error) {
      console.warn('Failed to check Brotli status:', error);
      return false;
    }
  }

  /**
   * Enable or disable Brotli compression support
   *
   * @param enabled - Whether to enable Brotli support
   */
  static async setEnabled(enabled: boolean): Promise<void> {
    try {
      await NetworkBrotli.setEnabled(enabled);
    } catch (error) {
      console.warn('Failed to set Brotli enabled state:', error);
      throw error;
    }
  }

  /**
   * Get statistics about Brotli usage
   *
   * @returns Promise that resolves to usage statistics
   */
  static async getStats(): Promise<
    import('./NativeNetworkBrotli').BrotliStats
  > {
    try {
      return await NetworkBrotli.getStats();
    } catch (error) {
      console.warn('Failed to get Brotli stats:', error);
      return {
        totalRequests: 0,
        brotliRequests: 0,
        bytesDecompressed: 0,
        compressionRatio: 0,
      };
    }
  }

  /**
   * Reset usage statistics
   */
  static async resetStats(): Promise<void> {
    try {
      await NetworkBrotli.resetStats();
    } catch (error) {
      console.warn('Failed to reset Brotli stats:', error);
      throw error;
    }
  }
}

// Auto-initialize when the library is imported
ReactNativeNetworkBrotli.initialize().catch((error) => {
  console.warn('Auto-initialization of Brotli support failed:', error);
});

// Export convenience functions for backward compatibility
export const initializeBrotli = () => ReactNativeNetworkBrotli.initialize();
export const isBrotliEnabled = () => ReactNativeNetworkBrotli.isEnabled();
export const setBrotliEnabled = (enabled: boolean) =>
  ReactNativeNetworkBrotli.setEnabled(enabled);
export const getBrotliStats = () => ReactNativeNetworkBrotli.getStats();
export const resetBrotliStats = () => ReactNativeNetworkBrotli.resetStats();

// Default export
export default ReactNativeNetworkBrotli;
