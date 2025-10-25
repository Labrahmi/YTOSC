import { VideoData } from './types';

// Calculate the median of an array of numbers
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

// Get neighboring videos for outlier calculation (target: 10 total, balancing before/after as needed)
function getNeighboringVideos(videos: VideoData[], targetIndex: number): VideoData[] {
  const validVideos = videos.filter((v) => v.viewCount !== null && v.viewCount !== undefined);
  const targetVideo = videos[targetIndex];
  const targetIndexInValid = validVideos.findIndex((v) => v.url === targetVideo.url);
  
  if (targetIndexInValid === -1) return [];
  
  const totalValidVideos = validVideos.length;
  const availableNeighbors = totalValidVideos - 1;
  
  if (availableNeighbors === 0) return [];
  
  const { before, after } = calculateNeighborDistribution(
    targetIndexInValid,
    totalValidVideos,
    availableNeighbors
  );
  
  const beforeVideos = validVideos.slice(targetIndexInValid - before, targetIndexInValid);
  const afterVideos = validVideos.slice(targetIndexInValid + 1, targetIndexInValid + 1 + after);
  
  return [...beforeVideos, ...afterVideos];
}

// Calculate how many videos to take before and after the target video
function calculateNeighborDistribution(
  targetIndex: number,
  totalVideos: number,
  availableNeighbors: number
): { before: number; after: number } {
  const TARGET_NEIGHBORS = 10;
  const IDEAL_BEFORE = 5;
  const IDEAL_AFTER = 5;
  
  const desiredTotal = Math.min(TARGET_NEIGHBORS, availableNeighbors);
  const maxBefore = targetIndex;
  const maxAfter = totalVideos - targetIndex - 1;
  
  // Ideal case: at least 5 videos available on both sides
  if (maxBefore >= IDEAL_BEFORE && maxAfter >= IDEAL_AFTER) {
    return { before: IDEAL_BEFORE, after: IDEAL_AFTER };
  }
  
  // Not enough before: take all before + fill remaining from after
  if (maxBefore < IDEAL_BEFORE) {
    return {
      before: maxBefore,
      after: Math.min(maxAfter, desiredTotal - maxBefore)
    };
  }
  
  // Not enough after: take all after + fill remaining from before
  return {
    before: Math.min(maxBefore, desiredTotal - maxAfter),
    after: maxAfter
  };
}

// Calculate outlier score: video_views / median(neighboring videos)
export function calculateOutlierScore(
  videos: VideoData[],
  targetIndex: number
): number | null {
  const targetVideo = videos[targetIndex];
  
  if (targetVideo.viewCount === null || targetVideo.viewCount === undefined) return null;
  
  const neighbors = getNeighboringVideos(videos, targetIndex);
  if (neighbors.length === 0) return null;
  
  const neighborViews = neighbors.map((v) => v.viewCount).filter((v) => v !== null && v !== undefined) as number[];
  const median = calculateMedian(neighborViews);
  
  if (median === 0) return null;
  if (targetVideo.viewCount === 0) return 0;
  
  return targetVideo.viewCount / median;
}

// Calculate outlier scores for all videos in a channel
export function calculateChannelOutlierScores(videos: VideoData[]) {
  return videos.map((video, index) => ({
    ...video,
    outlierScore: calculateOutlierScore(videos, index),
  }));
}

// Get the median view count for a set of videos
export function getMedianViewCount(videos: VideoData[]): number {
  const viewCounts = videos
    .map((v) => v.viewCount)
    .filter((v) => v !== null && v !== undefined && v > 0) as number[];
  return calculateMedian(viewCounts);
}
