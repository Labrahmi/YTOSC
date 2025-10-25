import { describe, it, expect } from 'vitest';
import { calculateOutlierScore, calculateChannelOutlierScores, getMedianViewCount } from '../outlierScore';
import { VideoData } from '../types';

// Helper function to create test videos
function createVideos(count: number, viewCounts: (number | null)[]): VideoData[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `Video ${i}`,
    viewCount: viewCounts[i] ?? 1000 + i * 100,
    url: `https://youtube.com/watch?v=${i}`,
  }));
}

describe('calculateOutlierScore', () => {
  describe('Formula verification: video_views / median(10 neighbors)', () => {
    it('should calculate score using exactly 5 before + 5 after (target not included)', () => {
      // Create predictable dataset: all neighbors have 1000 views
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `Before${i}`, viewCount: 1000, url: `url${i}` })),
        { title: 'Target', viewCount: 2000, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `After${i}`, viewCount: 1000, url: `url${i+6}` })),
      ];
      
      // Formula: 2000 / median([1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000])
      // Median of 10 identical values = 1000
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBe(2);
    });

    it('should verify target video is excluded from median calculation', () => {
      // If target was included, median would be different
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i}`, viewCount: 100, url: `url${i}` })),
        { title: 'Target', viewCount: 1000000, url: 'target' }, // Very high
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i+6}`, viewCount: 100, url: `url${i+6}` })),
      ];
      
      // Median should be 100 (from 10 neighbors), NOT influenced by 1,000,000
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBe(10000); // 1,000,000 / 100
    });

    it('should calculate correct median for even-numbered list (average of middle two)', () => {
      // Create list where median is average of two middle values
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `Low${i}`, viewCount: 100, url: `url${i}` })),
        { title: 'Target', viewCount: 1000, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `High${i}`, viewCount: 200, url: `url${i+6}` })),
      ];
      
      // Neighbors: [100, 100, 100, 100, 100, 200, 200, 200, 200, 200]
      // Sorted median of 10 = (100 + 200) / 2 = 150
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeCloseTo(6.666666666666667, 2); // 1000 / 150
    });

    it('should handle odd distribution of views correctly', () => {
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 500, url: 'url0' },
        { title: 'V1', viewCount: 600, url: 'url1' },
        { title: 'V2', viewCount: 700, url: 'url2' },
        { title: 'V3', viewCount: 800, url: 'url3' },
        { title: 'V4', viewCount: 900, url: 'url4' },
        { title: 'Target', viewCount: 5000, url: 'target' },
        { title: 'V6', viewCount: 1000, url: 'url6' },
        { title: 'V7', viewCount: 1100, url: 'url7' },
        { title: 'V8', viewCount: 1200, url: 'url8' },
        { title: 'V9', viewCount: 1300, url: 'url9' },
        { title: 'V10', viewCount: 1400, url: 'url10' },
      ];
      
      // Neighbors: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400]
      // Median = (900 + 1000) / 2 = 950
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeCloseTo(5.263157894736842, 2); // 5000 / 950
    });
  });

  describe('Edge case: Insufficient videos (must maintain 10 total by balancing)', () => {
    it('should take 1 before + 9 after for 2nd video (index 1)', () => {
      // Explicit test: 2nd video should use 1 before + 9 after = 10 total
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 100, url: 'url0' },  // This will be the 1 before
        { title: 'Target', viewCount: 5000, url: 'target' },  // Index 1
        { title: 'V2', viewCount: 200, url: 'url2' },  // Start of 9 after
        { title: 'V3', viewCount: 200, url: 'url3' },
        { title: 'V4', viewCount: 200, url: 'url4' },
        { title: 'V5', viewCount: 200, url: 'url5' },
        { title: 'V6', viewCount: 200, url: 'url6' },
        { title: 'V7', viewCount: 200, url: 'url7' },
        { title: 'V8', viewCount: 200, url: 'url8' },
        { title: 'V9', viewCount: 200, url: 'url9' },
        { title: 'V10', viewCount: 200, url: 'url10' }, // End of 9 after
        { title: 'V11', viewCount: 200, url: 'url11' }, // Not included
      ];
      
      // Neighbors: [100] + [200 × 9] = [100, 200, 200, 200, 200, 200, 200, 200, 200, 200]
      // Median = (200 + 200) / 2 = 200
      const score = calculateOutlierScore(videos, 1);
      expect(score).toBe(25); // 5000 / 200
    });

    it('should take 9 before + 1 after for 2nd to last video', () => {
      // Explicit test: 2nd to last should use 9 before + 1 after = 10 total
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 100, url: 'url0' },  // Not included
        { title: 'V1', viewCount: 200, url: 'url1' },  // Start of 9 before
        { title: 'V2', viewCount: 200, url: 'url2' },
        { title: 'V3', viewCount: 200, url: 'url3' },
        { title: 'V4', viewCount: 200, url: 'url4' },
        { title: 'V5', viewCount: 200, url: 'url5' },
        { title: 'V6', viewCount: 200, url: 'url6' },
        { title: 'V7', viewCount: 200, url: 'url7' },
        { title: 'V8', viewCount: 200, url: 'url8' },
        { title: 'V9', viewCount: 200, url: 'url9' },  // End of 9 before
        { title: 'Target', viewCount: 5000, url: 'target' },  // Index 10 (2nd to last)
        { title: 'V11', viewCount: 300, url: 'url11' }, // This will be the 1 after
      ];
      
      // Neighbors: [200 × 9] + [300] = [200, 200, 200, 200, 200, 200, 200, 200, 200, 300]
      // Median = (200 + 200) / 2 = 200
      const score = calculateOutlierScore(videos, 10);
      expect(score).toBe(25); // 5000 / 200
    });

    it('should take 0 before + 10 after for first video (index 0)', () => {
      const videos: VideoData[] = [
        { title: 'Target', viewCount: 10000, url: 'target' },  // Index 0 (first)
        ...Array(10).fill(null).map((_, i) => ({ 
          title: `After${i}`, 
          viewCount: 1000, 
          url: `url${i+1}` 
        })),
        { title: 'Extra', viewCount: 1000, url: 'extra' }, // Not included
      ];
      
      // Neighbors: 10 videos after, all with 1000 views
      // Median = 1000
      const score = calculateOutlierScore(videos, 0);
      expect(score).toBe(10); // 10000 / 1000
    });

    it('should take 10 before + 0 after for last video', () => {
      const videos: VideoData[] = [
        { title: 'Extra', viewCount: 1000, url: 'extra' }, // Not included
        ...Array(10).fill(null).map((_, i) => ({ 
          title: `Before${i}`, 
          viewCount: 1000, 
          url: `url${i}` 
        })),
        { title: 'Target', viewCount: 10000, url: 'target' },  // Last video
      ];
      
      // Neighbors: 10 videos before, all with 1000 views
      // Median = 1000
      const score = calculateOutlierScore(videos, 11);
      expect(score).toBe(10); // 10000 / 1000
    });

    it('should take 3 before + 7 after when only 3 available before', () => {
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 100, url: 'url0' },
        { title: 'V1', viewCount: 100, url: 'url1' },
        { title: 'V2', viewCount: 100, url: 'url2' },
        { title: 'Target', viewCount: 5000, url: 'target' },  // Index 3
        ...Array(10).fill(null).map((_, i) => ({ 
          title: `After${i}`, 
          viewCount: 200, 
          url: `url${i+4}` 
        })),
      ];
      
      // Neighbors: [100, 100, 100] + [200 × 7] = 10 videos total
      // Sorted: [100, 100, 100, 200, 200, 200, 200, 200, 200, 200]
      // Median = (200 + 200) / 2 = 200
      const score = calculateOutlierScore(videos, 3);
      expect(score).toBe(25); // 5000 / 200
    });
  });

  describe('Edge case: Channels with fewer than 10 total videos', () => {
    it('should use all 6 available videos for channel with 7 videos', () => {
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 1000, url: 'url0' },
        { title: 'V1', viewCount: 1000, url: 'url1' },
        { title: 'V2', viewCount: 1000, url: 'url2' },
        { title: 'Target', viewCount: 2000, url: 'target' },  // Index 3
        { title: 'V4', viewCount: 1000, url: 'url4' },
        { title: 'V5', viewCount: 1000, url: 'url5' },
        { title: 'V6', viewCount: 1000, url: 'url6' },
      ];
      
      // Only 6 other videos available, use all of them
      // Median = 1000
      const score = calculateOutlierScore(videos, 3);
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should use 1 video for channel with 2 videos', () => {
      const videos: VideoData[] = [
        { title: 'Video 1', viewCount: 1000, url: 'url1' },
        { title: 'Target', viewCount: 2000, url: 'target' },
      ];
      
      // Only 1 other video available
      // Median = 1000
      const score = calculateOutlierScore(videos, 1);
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should use 3 videos for channel with 4 videos', () => {
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 500, url: 'url0' },
        { title: 'Target', viewCount: 2000, url: 'target' },
        { title: 'V2', viewCount: 600, url: 'url2' },
        { title: 'V3', viewCount: 700, url: 'url3' },
      ];
      
      // 3 other videos: [500, 600, 700]
      // Median = 600
      const score = calculateOutlierScore(videos, 1);
      expect(score).toBeCloseTo(3.333333, 2); // 2000 / 600
    });
  });

  describe('Edge case: Videos without views (null, 0, member-only, scheduled)', () => {
    it('should return null for member-only video (null views)', () => {
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i}`, viewCount: 1000, url: `url${i}` })),
        { title: 'Member-only', viewCount: null, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i+6}`, viewCount: 1000, url: `url${i+6}` })),
      ];
      
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeNull();
    });

    it('should return null for scheduled video (null views)', () => {
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i}`, viewCount: 1000, url: `url${i}` })),
        { title: 'Scheduled premiere', viewCount: null, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i+6}`, viewCount: 1000, url: `url${i+6}` })),
      ];
      
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeNull();
    });

    it('should return 0 for video with exactly 0 views', () => {
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i}`, viewCount: 1000, url: `url${i}` })),
        { title: 'Zero views', viewCount: 0, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i+6}`, viewCount: 1000, url: `url${i+6}` })),
      ];
      
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBe(0);
    });

    it('should return null when median is 0 (avoid division by zero)', () => {
      const videos: VideoData[] = [
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i}`, viewCount: 0, url: `url${i}` })),
        { title: 'Target', viewCount: 1000, url: 'target' },
        ...Array(5).fill(null).map((_, i) => ({ title: `V${i+6}`, viewCount: 0, url: `url${i+6}` })),
      ];
      
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeNull();
    });

    it('should skip null view videos when selecting neighbors', () => {
      // Mix of valid and null view videos
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 1000, url: 'url0' },
        { title: 'V1', viewCount: 1000, url: 'url1' },
        { title: 'Member-only 1', viewCount: null, url: 'url2' }, // Skip
        { title: 'Scheduled 1', viewCount: null, url: 'url3' }, // Skip
        { title: 'V4', viewCount: 1000, url: 'url4' },
        { title: 'V5', viewCount: 1000, url: 'url5' },
        { title: 'V6', viewCount: 1000, url: 'url6' },
        { title: 'Target', viewCount: 2000, url: 'target' },
        { title: 'V8', viewCount: 1000, url: 'url8' },
        { title: 'Member-only 2', viewCount: null, url: 'url9' }, // Skip
        { title: 'V10', viewCount: 1000, url: 'url10' },
        { title: 'V11', viewCount: 1000, url: 'url11' },
        { title: 'V12', viewCount: 1000, url: 'url12' },
        { title: 'V13', viewCount: 1000, url: 'url13' },
      ];
      
      // Should find 10 valid neighbors excluding null views
      const score = calculateOutlierScore(videos, 7);
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should return null when no other valid videos exist (only target has views)', () => {
      const videos: VideoData[] = [
        { title: 'Member 1', viewCount: null, url: 'url1' },
        { title: 'Member 2', viewCount: null, url: 'url2' },
        { title: 'Target', viewCount: 1000, url: 'target' },
        { title: 'Member 3', viewCount: null, url: 'url4' },
        { title: 'Member 4', viewCount: null, url: 'url5' },
      ];
      
      const score = calculateOutlierScore(videos, 2);
      expect(score).toBeNull();
    });

    it('should return null when only one video exists', () => {
      const videos: VideoData[] = [
        { title: 'Only video', viewCount: 1000, url: 'url1' },
      ];
      
      const score = calculateOutlierScore(videos, 0);
      expect(score).toBeNull();
    });

    it('should handle mix of 0 views and null views correctly', () => {
      const videos: VideoData[] = [
        { title: 'V0', viewCount: 1000, url: 'url0' },
        { title: 'V1', viewCount: 1000, url: 'url1' },
        { title: 'Zero', viewCount: 0, url: 'url2' }, // Include in neighbors
        { title: 'Null', viewCount: null, url: 'url3' }, // Exclude from neighbors
        { title: 'V4', viewCount: 1000, url: 'url4' },
        { title: 'Target', viewCount: 5000, url: 'target' },
        { title: 'V6', viewCount: 1000, url: 'url6' },
        { title: 'Null2', viewCount: null, url: 'url7' }, // Exclude
        { title: 'V8', viewCount: 1000, url: 'url8' },
        { title: 'V9', viewCount: 1000, url: 'url9' },
        { title: 'V10', viewCount: 1000, url: 'url10' },
        { title: 'V11', viewCount: 1000, url: 'url11' },
      ];
      
      // Should use videos with 0 views but exclude null views
      const score = calculateOutlierScore(videos, 5);
      expect(score).toBeGreaterThan(0);
    });
  });
});

describe('calculateChannelOutlierScores', () => {
  it('should calculate scores for all videos in channel', () => {
    const videos = createVideos(15, Array(15).fill(null).map((_, i) => 1000 + i * 100));
    const results = calculateChannelOutlierScores(videos);
    
    expect(results).toHaveLength(15);
    results.forEach(video => {
      expect(video).toHaveProperty('outlierScore');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('viewCount');
      expect(video).toHaveProperty('url');
    });
  });

  it('should preserve original video data', () => {
    const videos: VideoData[] = [
      { title: 'Video 1', viewCount: 1000, url: 'url1', thumbnailUrl: 'thumb1', channelName: 'Channel' },
      { title: 'Video 2', viewCount: 2000, url: 'url2', thumbnailUrl: 'thumb2', channelName: 'Channel' },
      { title: 'Video 3', viewCount: 1500, url: 'url3', thumbnailUrl: 'thumb3', channelName: 'Channel' },
    ];
    
    const results = calculateChannelOutlierScores(videos);
    
    expect(results[0].thumbnailUrl).toBe('thumb1');
    expect(results[0].channelName).toBe('Channel');
  });
});

describe('getMedianViewCount', () => {
  it('should calculate median for odd number of videos', () => {
    const videos: VideoData[] = [
      { title: 'V1', viewCount: 1000, url: 'url1' },
      { title: 'V2', viewCount: 2000, url: 'url2' },
      { title: 'V3', viewCount: 3000, url: 'url3' },
    ];
    
    const median = getMedianViewCount(videos);
    expect(median).toBe(2000);
  });

  it('should calculate median for even number of videos', () => {
    const videos: VideoData[] = [
      { title: 'V1', viewCount: 1000, url: 'url1' },
      { title: 'V2', viewCount: 2000, url: 'url2' },
      { title: 'V3', viewCount: 3000, url: 'url3' },
      { title: 'V4', viewCount: 4000, url: 'url4' },
    ];
    
    const median = getMedianViewCount(videos);
    expect(median).toBe(2500); // (2000 + 3000) / 2
  });

  it('should skip null and zero view counts', () => {
    const videos: VideoData[] = [
      { title: 'V1', viewCount: 1000, url: 'url1' },
      { title: 'V2', viewCount: null, url: 'url2' },
      { title: 'V3', viewCount: 0, url: 'url3' },
      { title: 'V4', viewCount: 3000, url: 'url4' },
    ];
    
    const median = getMedianViewCount(videos);
    expect(median).toBe(2000); // Only 1000 and 3000 are counted
  });
});

// Project-specific tests (to be expanded later)
describe('Project-specific scenarios', () => {
  it('should handle real-world scenario: viral video detection', () => {
    // Simulate a channel where one video went viral
    const videos: VideoData[] = [
      ...Array(5).fill(null).map((_, i) => ({ title: `Regular ${i}`, viewCount: 10000, url: `url${i}` })),
      { title: 'Viral Video', viewCount: 1000000, url: 'viral' }, // 100x more views
      ...Array(5).fill(null).map((_, i) => ({ title: `Regular ${i+6}`, viewCount: 10000, url: `url${i+6}` })),
    ];
    
    const score = calculateOutlierScore(videos, 5);
    expect(score).toBe(100); // 1,000,000 / 10,000 = 100
  });

  it('should handle real-world scenario: underperforming video detection', () => {
    // Simulate a channel where one video underperformed
    const videos: VideoData[] = [
      ...Array(5).fill(null).map((_, i) => ({ title: `Popular ${i}`, viewCount: 100000, url: `url${i}` })),
      { title: 'Flop Video', viewCount: 1000, url: 'flop' }, // 100x fewer views
      ...Array(5).fill(null).map((_, i) => ({ title: `Popular ${i+6}`, viewCount: 100000, url: `url${i+6}` })),
    ];
    
    const score = calculateOutlierScore(videos, 5);
    expect(score).toBe(0.01); // 1,000 / 100,000 = 0.01
  });

  it('should handle mixed content channel with varying view counts', () => {
    const videos: VideoData[] = [
      { title: 'Short 1', viewCount: 5000, url: 'url1' },
      { title: 'Long 1', viewCount: 50000, url: 'url2' },
      { title: 'Short 2', viewCount: 7000, url: 'url3' },
      { title: 'Long 2', viewCount: 45000, url: 'url4' },
      { title: 'Short 3', viewCount: 6000, url: 'url5' },
      { title: 'Target', viewCount: 30000, url: 'target' },
      { title: 'Short 4', viewCount: 5500, url: 'url7' },
      { title: 'Long 3', viewCount: 48000, url: 'url8' },
      { title: 'Short 5', viewCount: 6500, url: 'url9' },
      { title: 'Long 4', viewCount: 52000, url: 'url10' },
      { title: 'Short 6', viewCount: 7500, url: 'url11' },
    ];
    
    const score = calculateOutlierScore(videos, 5);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(10);
  });
});

