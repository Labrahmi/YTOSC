/**
 * Number utilities
 */
/**
 * Calculate median of an array of numbers
 */
export declare function median(numbers: number[]): number;
/**
 * Format number for display (with K, M, B suffixes)
 */
export declare function formatNumber(num: number): string;
/**
 * Format score for badge display
 * Always shows one decimal digit (e.g., 0.3x, 2.8x, 12.7x)
 */
export declare function formatScore(score: number): string;
/**
 * Get median view count from a list of videos with viewCount property
 * Filters out null/undefined/zero values before calculating
 */
export declare function getMedianViewCount<T extends {
    viewCount: number | null | undefined;
}>(videos: T[]): number;
