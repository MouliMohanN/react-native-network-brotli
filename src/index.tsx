import NetworkBrotli from './NativeNetworkBrotli';

export function multiply(a: number, b: number): number {
  return NetworkBrotli.multiply(a, b);
}
