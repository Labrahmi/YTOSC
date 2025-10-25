/**
 * Format number with K/M suffixes
 */
export declare function formatNumber(num: number): string;
/**
 * Get CSS class for score level
 */
export declare function getScoreClass(score: number | null): string;
/**
 * Calculate statistics for a set of videos
 */
export declare function calculateStats(videos: Array<{
    outlierScore: number | null;
}>): {
    count: number;
    avgScore: number;
    topScore: number;
};
