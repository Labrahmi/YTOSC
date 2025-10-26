/**
 * Sorted overlay host
 * Non-invasive sorted view that doesn't modify YouTube's DOM
 */
import type { VideoRecord } from '../state/types';
/**
 * Create and show sorted overlay
 */
export declare function showSortedOverlay(records: VideoRecord[]): void;
/**
 * Hide sorted overlay and restore original grid
 */
export declare function hideSortedOverlay(): void;
