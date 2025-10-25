/**
 * Format number with K/M suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Get CSS class for score level
 */
export function getScoreClass(score: number | null): string {
  if (score === null || score === undefined) return '';
  if (score >= 10) return 'exceptional';
  if (score >= 5) return 'excellent';
  if (score >= 2) return 'good';
  return '';
}

/**
 * Calculate statistics for a set of videos
 */
export function calculateStats(videos: Array<{ outlierScore: number | null }>) {
  const count = videos.length;
  const avgScore = count > 0 
    ? videos.reduce((sum, v) => sum + (v.outlierScore || 0), 0) / count 
    : 0;
  const topScore = count > 0 
    ? Math.max(...videos.map(v => v.outlierScore || 0)) 
    : 0;

  return { count, avgScore, topScore };
}

