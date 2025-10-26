/**
 * Outlier score calculation
 * Implements the median-of-neighbors algorithm with edge-case handling
 */
import type { VideoId } from '../state/types';
/**
 * Calculate outlier score for a specific video
 * score = video_views / median(10 neighbors, excluding self)
 */
export declare function calculateScore(videoId: VideoId): number | null;
/**
 * Calculate scores for all videos in the store
 */
export declare function calculateAllScores(): void;
/**
 * Incrementally recompute scores for videos affected by a new insertion
 * Recomputes scores for [index-10, index+10] bounded range
 */
export declare function recomputeAffectedScores(index: number): void;
/**
 * Get median of all outlier scores (for filter thresholds)
 */
export declare function getMedianOutlierScore(): number;
