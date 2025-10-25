import { VideoData } from './types';
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
export declare function calculateOutlierScore(videos: VideoData[], targetIndex: number): number | null;
/**
 * Calculate outlier scores for all videos in a channel
 * Videos should be in chronological order (newest first, as they appear on YouTube)
 */
export declare function calculateChannelOutlierScores(videos: VideoData[]): {
    outlierScore: number | null;
    title: string;
    viewCount: number | null;
    url: string;
    thumbnailUrl?: string;
    channelName?: string;
}[];
/**
 * Get the median view count for a set of videos
 */
export declare function getMedianViewCount(videos: VideoData[]): number;
