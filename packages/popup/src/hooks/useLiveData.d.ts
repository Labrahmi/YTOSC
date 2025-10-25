import type { VideoWithScore } from '@core/types';
/**
 * Fallback mock data for development mode when Chrome API is not available
 */
declare function getMockData(): Promise<{
    videos: {
        title: string;
        viewCount: number;
        url: string;
        outlierScore: number;
    }[];
    medianViews: number;
}>;
export interface LiveData {
    videos: VideoWithScore[];
    totalVideos: number;
    medianViews: number;
    topScore: number;
    avgScore: number;
    excellentCount: number;
    exceptionalCount: number;
    goodCount: number;
    isLoading: boolean;
    error: string | null;
}
/**
 * Hook to fetch and manage live data from the current YouTube tab
 */
export declare function useLiveData(): {
    data: LiveData;
    refresh: () => Promise<void>;
};
export {};
