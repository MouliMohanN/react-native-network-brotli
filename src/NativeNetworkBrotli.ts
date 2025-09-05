import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface BrotliStats {
  totalRequests: number;
  brotliRequests: number;
  bytesDecompressed: number;
  compressionRatio: number;
}

export interface Spec extends TurboModule {
  /**
   * Initialize Brotli support for network requests
   * This is called automatically when the library is imported
   */
  initialize(): Promise<boolean>;

  /**
   * Check if Brotli support is currently enabled
   */
  isEnabled(): Promise<boolean>;

  /**
   * Enable or disable Brotli compression support
   */
  setEnabled(enabled: boolean): Promise<void>;

  /**
   * Get statistics about Brotli usage
   */
  getStats(): Promise<BrotliStats>;

  /**
   * Reset usage statistics
   */
  resetStats(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NetworkBrotli');
