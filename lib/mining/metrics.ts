/**
 * Measure execution time of a function
 */
export const measureTime = async <T>(
  fn: () => T | Promise<T>
): Promise<{ result: T; time: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, time: end - start };
};

/**
 * Get memory usage if available (browser only)
 */
export const getMemoryUsage = (): number | undefined => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const mem = (performance as { memory?: { usedJSHeapSize?: number } }).memory;
    return mem?.usedJSHeapSize;
  }
  return undefined;
};

/**
 * Format time in milliseconds to readable string
 */
export const formatTime = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Format memory bytes to readable string
 */
export const formatMemory = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};

