import { VideoData } from './types';

/**
 * Calculate the median of an array of numbers
 */
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

/**
 * Get neighboring videos for outlier score calculation
 * Takes 5 videos before and 5 after the target index
 * If not enough videos on one side, takes more from the other side
 * Excludes videos with undefined view counts (null/undefined)
 * 
 * @param videos - All videos in chronological order (newest first)
 * @param targetIndex - Index of the video to calculate score for
 * @returns Array of neighboring videos (max 10, excluding target video)
 */
function getNeighboringVideos(videos: VideoData[], targetIndex: number): VideoData[] {
  // Filter out videos with undefined/null view counts (member-only, scheduled, etc.)
  const validVideos = videos.filter((v) => v.viewCount !== null && v.viewCount !== undefined);
  
  // Find the target video in the filtered list
  const targetVideo = videos[targetIndex];
  const targetIndexInValid = validVideos.findIndex((v) => v.url === targetVideo.url);
  
  if (targetIndexInValid === -1) {
    // Target video itself has no view count
    return [];
  }
  
  const totalValid = validVideos.length;
  
  // We want 10 neighbors total (excluding the target)
  const desiredNeighbors = Math.min(10, totalValid - 1);
  
  if (desiredNeighbors <= 0) {
    return [];
  }
  
  // Ideally 5 before and 5 after
  let before = Math.min(5, targetIndexInValid);
  let after = Math.min(5, totalValid - targetIndexInValid - 1);
  
  // Adjust if we don't have enough on one side
  const totalNeeded = desiredNeighbors;
  const totalAvailable = before + after;
  
  if (totalAvailable < totalNeeded) {
    // Use all available
    before = targetIndexInValid;
    after = totalValid - targetIndexInValid - 1;
  } else {
    // We have enough, but may need to balance
    if (before + after < totalNeeded) {
      // Shouldn't happen, but handle it
      before = targetIndexInValid;
      after = totalValid - targetIndexInValid - 1;
    } else if (before < 5) {
      // Not enough before, take more after
      after = Math.min(totalNeeded - before, totalValid - targetIndexInValid - 1);
    } else if (after < 5) {
      // Not enough after, take more before
      before = Math.min(totalNeeded - after, targetIndexInValid);
    }
  }
  
  const startIndex = targetIndexInValid - before;
  const endIndex = targetIndexInValid + after + 1; // +1 because we'll exclude target
  
  const neighbors = validVideos.slice(startIndex, endIndex);
  
  // Remove the target video from neighbors
  return neighbors.filter((v) => v.url !== targetVideo.url);
}

/**
 * Calculate the outlier score for a video at a specific index
 * 
 * Formula: video_views / median(5 videos before + 5 videos after)
 * 
 * Edge cases:
 * - If there are not enough neighbors, use what's available
 * - If median is 0, return null
 * - If video has no views (null/undefined), return null
 */
export function calculateOutlierScore(
  videos: VideoData[],
  targetIndex: number
): number | null {
  const targetVideo = videos[targetIndex];
  
  // Video has no view count (member-only, scheduled, etc.)
  if (targetVideo.viewCount === null || targetVideo.viewCount === undefined) {
    return null;
  }
  
  const neighbors = getNeighboringVideos(videos, targetIndex);
  
  // No neighbors available
  if (neighbors.length === 0) {
    return null;
  }
  
  const neighborViews = neighbors.map((v) => v.viewCount).filter((v) => v !== null && v !== undefined) as number[];
  const median = calculateMedian(neighborViews);
  
  // Edge case: median is 0
  if (median === 0) {
    return null;
  }
  
  // Edge case: video has 0 views
  if (targetVideo.viewCount === 0) {
    return 0;
  }
  
  return targetVideo.viewCount / median;
}

/**
 * Calculate outlier scores for all videos in a channel
 * Videos should be in chronological order (newest first, as they appear on YouTube)
 */
export function calculateChannelOutlierScores(videos: VideoData[]) {
  return videos.map((video, index) => ({
    ...video,
    outlierScore: calculateOutlierScore(videos, index),
  }));
}

/**
 * Get the median view count for a set of videos
 */
export function getMedianViewCount(videos: VideoData[]): number {
  const viewCounts = videos
    .map((v) => v.viewCount)
    .filter((v) => v !== null && v !== undefined && v > 0) as number[];
  return calculateMedian(viewCounts);
}
