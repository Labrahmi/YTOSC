/**
 * @deprecated This is a reference implementation kept for testing purposes only.
 * The active implementation is in packages/content-script/src/calc/score.ts
 * which integrates with the state store for better performance.
 *
 * This file is maintained to:
 * - Serve as algorithm documentation
 * - Provide comprehensive test coverage
 * - Act as a reference for the algorithm logic
 */
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
