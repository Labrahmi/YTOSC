/**
 * Analytics and statistics utilities
 */

import { formatNumber } from './dom';
import { SCORE_THRESHOLDS } from '../constants';

/**
 * Calculate percentile rank
 */
export function calculatePercentile(score: number, allScores: number[]): number {
  const sorted = [...allScores].sort((a, b) => a - b);
  const index = sorted.findIndex(s => s >= score);
  return ((index + 1) / sorted.length) * 100;
}

/**
 * Determine performance level based on score
 */
export function getPerformanceLevel(score: number): {
  level: string;
  color: string;
} {
  if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) {
    return { level: 'Exceptional', color: '#F44336' };
  } else if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return { level: 'Excellent', color: '#FF9800' };
  } else if (score >= SCORE_THRESHOLDS.GOOD) {
    return { level: 'Good', color: '#FFEB3B' };
  } else {
    return { level: 'Average', color: '#9E9E9E' };
  }
}

/**
 * Generate analysis text based on performance
 */
export function getAnalysisText(
  score: number,
  median: number,
  views: number
): string {
  const difference = views - median;
  const percentDiff = ((score - 1) * 100).toFixed(0);
  
  if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) {
    return `🔥 This video is an exceptional outlier! It has ${formatNumber(views)} views, which is ${score.toFixed(1)}x the channel median of ${formatNumber(median)}. This represents a ${percentDiff}% increase over typical performance—truly viral content!`;
  } else if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return `⭐ This video is performing excellently! With ${formatNumber(views)} views compared to the median of ${formatNumber(median)}, it's ${percentDiff}% above average. This content clearly resonated with your audience.`;
  } else if (score >= SCORE_THRESHOLDS.GOOD) {
    return `✨ This video is performing well above average at ${score.toFixed(1)}x the median. It has ${formatNumber(difference)} more views than typical, showing ${percentDiff}% better engagement.`;
  } else if (score >= 1) {
    return `📈 This video is performing around average for your channel, with ${formatNumber(views)} views compared to the median of ${formatNumber(median)}.`;
  } else {
    return `📊 This video is performing below average with ${formatNumber(views)} views (${percentDiff}% of median). This could indicate the content, title, or thumbnail needs optimization.`;
  }
}

