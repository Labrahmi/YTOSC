import { useState, useMemo } from 'react';
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
export function useFilters(videos: VideoWithScore[]): FilterState {
  const [activeFilter, setActiveFilter] = useState<FilterLevel>(null);

  const filteredVideos = useMemo(() => {
    if (activeFilter === null) {
      return videos;
    }

    return videos.filter(v => 
      v.outlierScore !== null && 
      v.outlierScore !== undefined && 
      v.outlierScore >= activeFilter
    );
  }, [videos, activeFilter]);

  const setFilter = (level: FilterLevel) => {
    setActiveFilter(level);
  };

  const resetFilter = () => {
    setActiveFilter(null);
  };

  return {
    activeFilter,
    setFilter,
    resetFilter,
    filteredVideos,
    filteredCount: filteredVideos.length,
  };
}

