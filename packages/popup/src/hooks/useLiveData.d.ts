import type { VideoWithScore } from '@core/types';
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
