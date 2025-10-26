/**
 * Outlier score calculation
 * Implements the median-of-neighbors algorithm with edge-case handling
 */

import { store } from '../state/store';
import type { VideoId } from '../state/types';
import { median } from '../utils/number';
import { logger } from '../utils/logger';

/**
 * Calculate outlier score for a specific video
 * score = video_views / median(10 neighbors, excluding self)
 */
export function calculateScore(videoId: VideoId): number | null {
  const record = store.getById(videoId);
  if (!record || record.views === null) {
    return null;
  }

  const neighbors = store.getNeighbors(videoId, 10);
  
  if (neighbors.length === 0) {
    // No neighbors available (channel has only 1 video)
    return null;
  }

  const neighborViews = neighbors
    .map(n => n.views)
    .filter((v): v is number => v !== null && v >= 0);

  if (neighborViews.length === 0) {
    // All neighbors have null views
    return null;
  }

  const medianViews = median(neighborViews);

  // Handle edge cases
  if (medianViews === 0) {
    // Median is 0, can't divide
    return null;
  }

  if (record.views === 0) {
    // Video has 0 views
    return 0;
  }

  const score = record.views / medianViews;
  
  // Sanity check
  if (!Number.isFinite(score) || score < 0) {
    logger.warn(`Invalid score calculated for ${videoId}: ${score}`);
    return null;
  }

  return score;
}

/**
 * Calculate scores for all videos in the store
 */
export function calculateAllScores(): void {
  const state = store.getState();
  const records = state.list;

  let calculated = 0;

  records.forEach(record => {
    const score = calculateScore(record.videoId);
    if (score !== null) {
      store.update(record.videoId, { score, status: 'scored' });
      calculated++;
    }
  });

  logger.log(`Calculated scores for ${calculated}/${records.length} videos`);
}

/**
 * Incrementally recompute scores for videos affected by a new insertion
 * Recomputes scores for [index-10, index+10] bounded range
 */
export function recomputeAffectedScores(index: number): void {
  const state = store.getState();
  const records = state.list;

  const start = Math.max(0, index - 10);
  const end = Math.min(records.length - 1, index + 10);

  let recomputed = 0;

  for (let i = start; i <= end; i++) {
    const record = records[i];
    if (record.views !== null) {
      const score = calculateScore(record.videoId);
      if (score !== null && score !== record.score) {
        store.update(record.videoId, { score, status: 'scored' });
        recomputed++;
      }
    }
  }

  if (recomputed > 0) {
    logger.log(`Recomputed ${recomputed} scores around index ${index}`);
  }
}

/**
 * Get median of all outlier scores (for filter thresholds)
 */
export function getMedianOutlierScore(): number {
  return store.getMedianScore();
}

