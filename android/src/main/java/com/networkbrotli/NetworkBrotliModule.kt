package com.networkbrotli

import com.facebook.fbreact.specs.NativeNetworkBrotliSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

@ReactModule(name = NetworkBrotliModule.NAME)
class NetworkBrotliModule(reactContext: ReactApplicationContext) :
  NativeNetworkBrotliSpec(reactContext) {

  companion object {
    const val NAME = "NetworkBrotli"
    private var isInitialized = AtomicBoolean(false)
    private var isEnabled = AtomicBoolean(true)

    // Statistics
    private var totalRequests = AtomicInteger(0)
    private var brotliRequests = AtomicInteger(0)
    private var bytesDecompressed = AtomicLong(0)

    private val brotliInterceptor = BrotliInterceptor()
  }

  override fun getName(): String = NAME

  override fun initialize(promise: Promise) {
    try {
      if (isInitialized.get()) {
        promise.resolve(true)
        return
      }

      // Add Brotli interceptor to OkHttp client
      val client = OkHttpClientProvider.getOkHttpClient()
      val newClient = client.newBuilder()
        .addInterceptor(brotliInterceptor)
        .build()

      // Note: In a real implementation, you would need to properly replace the OkHttp client
      // This is a simplified approach and may require additional configuration

      isInitialized.set(true)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", "Failed to initialize Brotli support: ${e.message}", e)
    }
  }

  override fun isEnabled(promise: Promise) {
    promise.resolve(isEnabled.get())
  }

  override fun setEnabled(enabled: Boolean, promise: Promise) {
    try {
      isEnabled.set(enabled)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("SET_ENABLED_ERROR", "Failed to set enabled state: ${e.message}", e)
    }
  }

  override fun getStats(promise: Promise) {
    try {
      val stats = WritableNativeMap()
      stats.putInt("totalRequests", totalRequests.get())
      stats.putInt("brotliRequests", brotliRequests.get())
      stats.putDouble("bytesDecompressed", bytesDecompressed.get().toDouble())

      val compressionRatio = if (totalRequests.get() > 0) {
        brotliRequests.get().toDouble() / totalRequests.get().toDouble()
      } else {
        0.0
      }
      stats.putDouble("compressionRatio", compressionRatio)

      promise.resolve(stats)
    } catch (e: Exception) {
      promise.reject("GET_STATS_ERROR", "Failed to get stats: ${e.message}", e)
    }
  }

  override fun resetStats(promise: Promise) {
    try {
      totalRequests.set(0)
      brotliRequests.set(0)
      bytesDecompressed.set(0)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("RESET_STATS_ERROR", "Failed to reset stats: ${e.message}", e)
    }
  }

  private class BrotliInterceptor : Interceptor {

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
      val request = chain.request()
      val response = chain.proceed(request)

      // Increment total requests counter
      totalRequests.incrementAndGet()

      if (!isEnabled.get()) {
        return response
      }

      // Check if response is Brotli compressed
      val contentEncoding = response.header("Content-Encoding")
      if (contentEncoding != null && contentEncoding.equals("br", ignoreCase = true)) {
        brotliRequests.incrementAndGet()

        val responseBody = response.body
        if (responseBody != null) {
          // In a real implementation, you would use a proper Brotli decoder here
          // For this stub, we'll simulate the decompression
          val originalSize = responseBody.contentLength()
          if (originalSize > 0) {
            bytesDecompressed.addAndGet(originalSize)
          }

          // TODO: Implement actual Brotli decompression
          // This would require adding the Brotli library dependency
          // For now, we'll return the original response
        }
      }

      return response
    }
  }
}
