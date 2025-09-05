// Mock React Native with a factory function
jest.mock('react-native', () => {
  const mockNativeModule = {
    initialize: jest.fn(),
    isEnabled: jest.fn(),
    setEnabled: jest.fn(),
    getStats: jest.fn(),
    resetStats: jest.fn(),
  };

  return {
    NativeModules: {
      NetworkBrotli: mockNativeModule,
    },
    TurboModuleRegistry: {
      getEnforcing: jest.fn(() => mockNativeModule),
    },
  };
});

// Import after mocking
import ReactNativeNetworkBrotli, {
  initializeBrotli,
  isBrotliEnabled,
  setBrotliEnabled,
  getBrotliStats,
  resetBrotliStats,
  type BrotliStats,
} from '../src';

// Get the mock module for test manipulation
const mockNativeModule =
  require('react-native').TurboModuleRegistry.getEnforcing();

// Mock console methods to avoid noise in tests
const consoleSpy = {
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('ReactNativeNetworkBrotli', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.warn.mockClear();
    consoleSpy.error.mockClear();
    // Reset initialization state
    (ReactNativeNetworkBrotli as any)._initialized = false;
  });

  afterAll(() => {
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      mockNativeModule.initialize.mockResolvedValue(true);

      const result = await ReactNativeNetworkBrotli.initialize();

      expect(result).toBe(true);
      expect(mockNativeModule.initialize).toHaveBeenCalledTimes(1);
    });

    it('should return true if already initialized', async () => {
      mockNativeModule.initialize.mockResolvedValue(true);

      // First initialization
      await ReactNativeNetworkBrotli.initialize();

      // Second initialization should still return true but not call native module again
      const result = await ReactNativeNetworkBrotli.initialize();

      expect(result).toBe(true);
      expect(mockNativeModule.initialize).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should handle initialization failure gracefully', async () => {
      const error = new Error('Native initialization failed');
      mockNativeModule.initialize.mockRejectedValue(error);

      const result = await ReactNativeNetworkBrotli.initialize();

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to initialize Brotli support:',
        error
      );
    });
  });

  describe('isEnabled', () => {
    it('should return enabled status', async () => {
      mockNativeModule.isEnabled.mockResolvedValue(true);

      const result = await ReactNativeNetworkBrotli.isEnabled();

      expect(result).toBe(true);
      expect(mockNativeModule.isEnabled).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Native call failed');
      mockNativeModule.isEnabled.mockRejectedValue(error);

      const result = await ReactNativeNetworkBrotli.isEnabled();

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to check Brotli status:',
        error
      );
    });
  });

  describe('setEnabled', () => {
    it('should enable Brotli', async () => {
      mockNativeModule.setEnabled.mockResolvedValue(null);

      await ReactNativeNetworkBrotli.setEnabled(true);

      expect(mockNativeModule.setEnabled).toHaveBeenCalledWith(true);
    });

    it('should disable Brotli', async () => {
      mockNativeModule.setEnabled.mockResolvedValue(null);

      await ReactNativeNetworkBrotli.setEnabled(false);

      expect(mockNativeModule.setEnabled).toHaveBeenCalledWith(false);
    });

    it('should handle errors by throwing', async () => {
      const error = new Error('Native call failed');
      mockNativeModule.setEnabled.mockRejectedValue(error);

      await expect(ReactNativeNetworkBrotli.setEnabled(true)).rejects.toThrow(
        error
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to set Brotli enabled state:',
        error
      );
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const mockStats: BrotliStats = {
        totalRequests: 100,
        brotliRequests: 50,
        bytesDecompressed: 1000,
        compressionRatio: 0.5,
      };
      mockNativeModule.getStats.mockResolvedValue(mockStats);

      const result = await ReactNativeNetworkBrotli.getStats();

      expect(result).toEqual(mockStats);
      expect(mockNativeModule.getStats).toHaveBeenCalledTimes(1);
    });

    it('should return default stats on error', async () => {
      const error = new Error('Native call failed');
      mockNativeModule.getStats.mockRejectedValue(error);

      const result = await ReactNativeNetworkBrotli.getStats();

      expect(result).toEqual({
        totalRequests: 0,
        brotliRequests: 0,
        bytesDecompressed: 0,
        compressionRatio: 0,
      });
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to get Brotli stats:',
        error
      );
    });
  });

  describe('resetStats', () => {
    it('should reset statistics', async () => {
      mockNativeModule.resetStats.mockResolvedValue(null);

      await ReactNativeNetworkBrotli.resetStats();

      expect(mockNativeModule.resetStats).toHaveBeenCalledTimes(1);
    });

    it('should handle errors by throwing', async () => {
      const error = new Error('Native call failed');
      mockNativeModule.resetStats.mockRejectedValue(error);

      await expect(ReactNativeNetworkBrotli.resetStats()).rejects.toThrow(
        error
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to reset Brotli stats:',
        error
      );
    });
  });

  describe('convenience functions', () => {
    it('should call the class methods correctly', async () => {
      mockNativeModule.initialize.mockResolvedValue(true);
      mockNativeModule.isEnabled.mockResolvedValue(false);
      mockNativeModule.setEnabled.mockResolvedValue(null);
      mockNativeModule.getStats.mockResolvedValue({
        totalRequests: 10,
        brotliRequests: 5,
        bytesDecompressed: 500,
        compressionRatio: 0.5,
      });
      mockNativeModule.resetStats.mockResolvedValue(null);

      // Test all convenience functions
      await expect(initializeBrotli()).resolves.toBe(true);
      await expect(isBrotliEnabled()).resolves.toBe(false);
      await expect(setBrotliEnabled(true)).resolves.toBeUndefined();
      await expect(getBrotliStats()).resolves.toMatchObject({
        totalRequests: 10,
        brotliRequests: 5,
        bytesDecompressed: 500,
        compressionRatio: 0.5,
      });
      await expect(resetBrotliStats()).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle various error types', async () => {
      // Test with different error types
      const stringError = 'String error';
      const objectError = { message: 'Object error' };
      const nullError = null;

      mockNativeModule.initialize.mockRejectedValue(stringError);
      await expect(ReactNativeNetworkBrotli.initialize()).resolves.toBe(false);

      mockNativeModule.initialize.mockRejectedValue(objectError);
      await expect(ReactNativeNetworkBrotli.initialize()).resolves.toBe(false);

      mockNativeModule.initialize.mockRejectedValue(nullError);
      await expect(ReactNativeNetworkBrotli.initialize()).resolves.toBe(false);
    });
  });

  describe('BrotliStats type', () => {
    it('should have correct typescript interface', () => {
      const stats: BrotliStats = {
        totalRequests: 100,
        brotliRequests: 50,
        bytesDecompressed: 1000,
        compressionRatio: 0.5,
      };

      // TypeScript compilation will fail if the interface is incorrect
      expect(typeof stats.totalRequests).toBe('number');
      expect(typeof stats.brotliRequests).toBe('number');
      expect(typeof stats.bytesDecompressed).toBe('number');
      expect(typeof stats.compressionRatio).toBe('number');
    });
  });
});

// Integration-style tests
describe('ReactNativeNetworkBrotli Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform a complete workflow', async () => {
    // Setup mocks for a complete workflow
    mockNativeModule.initialize.mockResolvedValue(true);
    mockNativeModule.isEnabled.mockResolvedValue(true);
    mockNativeModule.setEnabled.mockResolvedValue(null);
    mockNativeModule.getStats.mockResolvedValue({
      totalRequests: 0,
      brotliRequests: 0,
      bytesDecompressed: 0,
      compressionRatio: 0,
    });
    mockNativeModule.resetStats.mockResolvedValue(null);

    // Initialize
    const initialized = await ReactNativeNetworkBrotli.initialize();
    expect(initialized).toBe(true);

    // Check status
    const enabled = await ReactNativeNetworkBrotli.isEnabled();
    expect(enabled).toBe(true);

    // Get initial stats
    const initialStats = await ReactNativeNetworkBrotli.getStats();
    expect(initialStats.totalRequests).toBe(0);

    // Disable Brotli
    await ReactNativeNetworkBrotli.setEnabled(false);
    expect(mockNativeModule.setEnabled).toHaveBeenCalledWith(false);

    // Re-enable Brotli
    await ReactNativeNetworkBrotli.setEnabled(true);
    expect(mockNativeModule.setEnabled).toHaveBeenCalledWith(true);

    // Reset stats
    await ReactNativeNetworkBrotli.resetStats();
    expect(mockNativeModule.resetStats).toHaveBeenCalledTimes(1);
  });

  it('should handle mixed success and failure scenarios', async () => {
    // Some operations succeed, others fail
    mockNativeModule.initialize.mockResolvedValue(true);
    mockNativeModule.isEnabled.mockRejectedValue(new Error('Check failed'));
    mockNativeModule.setEnabled.mockResolvedValue(null);
    mockNativeModule.getStats.mockRejectedValue(new Error('Stats failed'));
    mockNativeModule.resetStats.mockResolvedValue(null);

    // Should succeed
    await expect(ReactNativeNetworkBrotli.initialize()).resolves.toBe(true);

    // Should fail gracefully
    await expect(ReactNativeNetworkBrotli.isEnabled()).resolves.toBe(false);

    // Should succeed
    await expect(
      ReactNativeNetworkBrotli.setEnabled(true)
    ).resolves.toBeUndefined();

    // Should return default stats
    const stats = await ReactNativeNetworkBrotli.getStats();
    expect(stats).toEqual({
      totalRequests: 0,
      brotliRequests: 0,
      bytesDecompressed: 0,
      compressionRatio: 0,
    });

    // Should succeed
    await expect(
      ReactNativeNetworkBrotli.resetStats()
    ).resolves.toBeUndefined();
  });
});
