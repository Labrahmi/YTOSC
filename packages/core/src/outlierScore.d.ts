import { VideoData } from './types';
export declare function calculateOutlierScore(videos: VideoData[], targetIndex: number): number | null;
export declare function calculateChannelOutlierScores(videos: VideoData[]): {
    outlierScore: number | null;
    title: string;
    viewCount: number | null;
    url: string;
    thumbnailUrl?: string;
    channelName?: string;
}[];
export declare function getMedianViewCount(videos: VideoData[]): number;
