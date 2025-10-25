import type { VideoWithScore } from '@core/types';
export type FilterLevel = 2 | 5 | 10 | null;
export interface FilterState {
    activeFilter: FilterLevel;
    setFilter: (level: FilterLevel) => void;
    resetFilter: () => void;
    filteredVideos: VideoWithScore[];
    filteredCount: number;
}
/**
 * Hook to manage video filtering by outlier score threshold
 */
export declare function useFilters(videos: VideoWithScore[]): FilterState;
