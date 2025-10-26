/**
 * Number utilities
 */

/**
 * Calculate median of an array of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Format number for display (with K, M, B suffixes)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format score for badge display
 * Always shows one decimal digit (e.g., 0.3x, 2.8x, 12.7x)
 */
export function formatScore(score: number): string {
  return score.toFixed(1) + 'x';
}

/**
 * Get median view count from a list of videos with viewCount property
 * Filters out null/undefined/zero values before calculating
 */
export function getMedianViewCount<T extends { viewCount: number | null | undefined }>(videos: T[]): number {
  const viewCounts = videos
    .map((v) => v.viewCount)
    .filter((v): v is number => v !== null && v !== undefined && v > 0);
  
  return median(viewCounts);
}

