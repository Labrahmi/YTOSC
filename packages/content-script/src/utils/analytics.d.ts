/**
 * Analytics and statistics utilities
 */
/**
 * Calculate percentile rank
 */
export declare function calculatePercentile(score: number, allScores: number[]): number;
/**
 * Determine performance level based on score
 */
export declare function getPerformanceLevel(score: number): {
    level: string;
    color: string;
};
/**
 * Generate analysis text based on performance
 */
export declare function getAnalysisText(score: number, median: number, views: number): string;
