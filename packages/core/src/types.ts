/**
 * Core type definitions for the YouTube Outlier Score Calculator
 */

export interface VideoData {
  title: string;
  viewCount: number | null; // null for member-only, scheduled, or unavailable videos
  url: string;
  thumbnailUrl?: string;
  channelName?: string;
}

export interface VideoWithScore extends VideoData {
  outlierScore: number | null;
}

export interface ChannelStats {
  videos: VideoData[];
  medianViews: number;
  totalVideos: number;
}

export type FilterLevel = 2 | 5 | 10 | null;

export interface FilterMessage {
  type: 'SET_FILTER' | 'RESET_FILTER' | 'GET_STATS';
  threshold?: FilterLevel;
}

export interface StatsResponse {
  type: 'STATS';
  totalVideos: number;
  videosWithScores: number;
  medianViews: number;
}
