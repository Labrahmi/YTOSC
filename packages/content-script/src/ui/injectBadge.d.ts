/**
 * Idempotent badge injection
 * Creates or updates score badges at the start of video titles
 */
import type { VideoRecord } from '../state/types';
/**
 * Inject global styles for badges (call once)
 */
export declare function injectBadgeStyles(): void;
/**
 * Ensure a badge exists and is up-to-date (idempotent)
 */
export declare function ensureBadge(record: VideoRecord): void;
/**
 * Remove badge from a record
 */
export declare function removeBadge(record: VideoRecord): void;
/**
 * Update badge for a record (if it exists)
 */
export declare function updateBadge(record: VideoRecord): void;
