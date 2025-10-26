/**
 * Debounce utility for batching rapid function calls
 */
export declare function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Request idle callback with fallback to setTimeout
 */
export declare function requestIdleCallback(callback: () => void, options?: {
    timeout?: number;
}): number;
/**
 * Cancel idle callback with fallback to clearTimeout
 */
export declare function cancelIdleCallback(id: number): void;
