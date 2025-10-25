import { useState, useEffect, useCallback } from 'react';
import type { VideoWithScore } from '@core/types';

/**
 * Fallback mock data for development mode when Chrome API is not available
 */
async function getMockData() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    videos: [
      { title: 'How I Built My Studio Setup', viewCount: 125000, url: 'https://youtube.com/watch?v=1', outlierScore: 12.4 },
      { title: '100 Days of YouTube Shorts Challenge', viewCount: 89000, url: 'https://youtube.com/watch?v=2', outlierScore: 8.9 },
      { title: 'Ultimate Lighting Tutorial for Creators', viewCount: 61000, url: 'https://youtube.com/watch?v=3', outlierScore: 6.1 },
      { title: 'My Favorite Gear for Content Creation', viewCount: 52000, url: 'https://youtube.com/watch?v=4', outlierScore: 5.2 },
      { title: 'Behind the Scenes of My Viral Video', viewCount: 48000, url: 'https://youtube.com/watch?v=5', outlierScore: 4.8 },
      { title: 'Camera Settings Guide for Beginners', viewCount: 37000, url: 'https://youtube.com/watch?v=6', outlierScore: 3.7 },
      { title: 'My Editing Workflow Revealed', viewCount: 32000, url: 'https://youtube.com/watch?v=7', outlierScore: 3.2 },
      { title: 'Q&A Session - Ask Me Anything', viewCount: 29000, url: 'https://youtube.com/watch?v=8', outlierScore: 2.9 },
      { title: 'Studio Tour 2024', viewCount: 24000, url: 'https://youtube.com/watch?v=9', outlierScore: 2.4 },
      { title: 'Monthly Vlog - October', viewCount: 21000, url: 'https://youtube.com/watch?v=10', outlierScore: 2.1 },
      { title: 'Audio Setup Tips and Tricks', viewCount: 18000, url: 'https://youtube.com/watch?v=11', outlierScore: 1.8 },
      { title: 'Color Grading Tutorial', viewCount: 15000, url: 'https://youtube.com/watch?v=12', outlierScore: 1.5 },
      { title: 'Thumbnail Design Secrets', viewCount: 13000, url: 'https://youtube.com/watch?v=13', outlierScore: 1.3 },
      { title: 'How to Script Your Videos', viewCount: 11000, url: 'https://youtube.com/watch?v=14', outlierScore: 1.1 },
      { title: 'Best Time to Upload on YouTube', viewCount: 10000, url: 'https://youtube.com/watch?v=15', outlierScore: 1.0 },
      { title: 'My Daily Routine as a Creator', viewCount: 9500, url: 'https://youtube.com/watch?v=16', outlierScore: 0.95 },
      { title: 'SEO Tips for YouTube Growth', viewCount: 8800, url: 'https://youtube.com/watch?v=17', outlierScore: 0.88 },
      { title: 'How I Plan My Content', viewCount: 8200, url: 'https://youtube.com/watch?v=18', outlierScore: 0.82 },
      { title: 'Dealing with Burnout', viewCount: 7500, url: 'https://youtube.com/watch?v=19', outlierScore: 0.75 },
      { title: 'YouTube Analytics Explained', viewCount: 7000, url: 'https://youtube.com/watch?v=20', outlierScore: 0.70 },
    ],
    medianViews: 10000,
  };
}

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
export function useLiveData() {
  const [data, setData] = useState<LiveData>({
    videos: [],
    totalVideos: 0,
    medianViews: 0,
    topScore: 0,
    avgScore: 0,
    excellentCount: 0,
    exceptionalCount: 0,
    goodCount: 0,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if Chrome API is available (not available in dev mode without extension)
      if (typeof chrome === 'undefined' || !chrome?.tabs?.query) {
        // Use fallback mock data for development
        const mockResponse = await getMockData();
        processResponseData(mockResponse);
        return;
      }

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Check if it's a YouTube channel page
      if (!tab.url?.includes('youtube.com/')) {
        throw new Error('Not a YouTube page');
      }

      // Request data from content script
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CHANNEL_DATA' });

      if (!response || !response.videos) {
        throw new Error('No data available. Please visit a YouTube channel page.');
      }

      processResponseData(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, []);

  const processResponseData = (response: { videos: VideoWithScore[], medianViews: number }) => {
    // Calculate statistics
    const videos: VideoWithScore[] = response.videos;
    const videosWithScores = videos.filter(v => v.outlierScore !== null && v.outlierScore !== undefined);
    const scores = videosWithScores.map(v => v.outlierScore!);

    const avgScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    const excellentCount = videosWithScores.filter(v => v.outlierScore! >= 5 && v.outlierScore! < 10).length;
    const exceptionalCount = videosWithScores.filter(v => v.outlierScore! >= 10).length;
    const goodCount = videosWithScores.filter(v => v.outlierScore! >= 2 && v.outlierScore! < 5).length;

    setData({
      videos: videosWithScores.sort((a, b) => (b.outlierScore || 0) - (a.outlierScore || 0)),
      totalVideos: videos.length,
      medianViews: response.medianViews || 0,
      topScore,
      avgScore,
      excellentCount,
      exceptionalCount,
      goodCount,
      isLoading: false,
      error: null,
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, refresh: fetchData };
}

