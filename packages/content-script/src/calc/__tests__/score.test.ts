import { describe, it, expect, beforeEach } from 'vitest';
import { calculateScore, calculateAllScores, getMedianOutlierScore } from '../score';
import { store } from '../../state/store';
import type { VideoRecord } from '../../state/types';

/**
 * Test suite for outlier score calculation
 * Migrated from packages/core/src/__tests__/outlierScore.test.ts
 * 
 * Tests the active store-based implementation
 */

// Helper function to create test video records
function createTestRecord(
  videoId: string,
  views: number | null,
  index: number
): VideoRecord {
  const mockCard = document.createElement('div');
  const mockTitle = document.createElement('a');
  
  return {
    videoId,
    url: `https://youtube.com/watch?v=${videoId}`,
    title: `Video ${videoId}`,
    views,
    score: null,
    indexInChannel: index,
    status: 'parsed',
    dom: {
      card: mockCard,
      titleEl: mockTitle,
    },
  };
}

// Setup and teardown
beforeEach(() => {
  store.clear();
});

describe('calculateScore', () => {
  describe('Formula verification: video_views / median(10 neighbors)', () => {
    it('should calculate score using exactly 5 before + 5 after (target not included)', () => {
      // Create predictable dataset: all neighbors have 1000 views
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`before${i}`, 1000, i)),
        createTestRecord('target', 2000, 5),
        ...Array(5).fill(null).map((_, i) => createTestRecord(`after${i}`, 1000, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Formula: 2000 / median([1000 × 10]) = 2000 / 1000 = 2
      const score = calculateScore('target');
      expect(score).toBe(2);
    });

    it('should verify target video is excluded from median calculation', () => {
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i}`, 100, i)),
        createTestRecord('target', 1000000, 5), // Very high
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i+6}`, 100, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Median should be 100 (from 10 neighbors), NOT influenced by 1,000,000
      const score = calculateScore('target');
      expect(score).toBe(10000); // 1,000,000 / 100
    });

    it('should calculate correct median for even-numbered list (average of middle two)', () => {
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`low${i}`, 100, i)),
        createTestRecord('target', 1000, 5),
        ...Array(5).fill(null).map((_, i) => createTestRecord(`high${i}`, 200, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Neighbors: [100×5, 200×5]
      // Median = (100 + 200) / 2 = 150
      const score = calculateScore('target');
      expect(score).toBeCloseTo(6.666666666666667, 2); // 1000 / 150
    });
  });

  describe('Edge case: Insufficient videos (must maintain 10 total by balancing)', () => {
    it('should take 1 before + 9 after for 2nd video (index 1)', () => {
      const videos: VideoRecord[] = [
        createTestRecord('v0', 100, 0),  // 1 before
        createTestRecord('target', 5000, 1),
        ...Array(9).fill(null).map((_, i) => createTestRecord(`v${i+2}`, 200, i + 2)), // 9 after
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Neighbors: [100] + [200 × 9]
      // Median = 200
      const score = calculateScore('target');
      expect(score).toBe(25); // 5000 / 200
    });

    it('should take 9 before + 1 after for 2nd to last video', () => {
      const videos: VideoRecord[] = [
        ...Array(9).fill(null).map((_, i) => createTestRecord(`v${i}`, 200, i)), // 9 before
        createTestRecord('target', 5000, 9),
        createTestRecord('v10', 300, 10), // 1 after
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Neighbors: [200 × 9] + [300]
      // Median = 200
      const score = calculateScore('target');
      expect(score).toBe(25); // 5000 / 200
    });

    it('should take 0 before + 10 after for first video (index 0)', () => {
      const videos: VideoRecord[] = [
        createTestRecord('target', 10000, 0),
        ...Array(10).fill(null).map((_, i) => createTestRecord(`after${i}`, 1000, i + 1)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBe(10); // 10000 / 1000
    });

    it('should take 10 before + 0 after for last video', () => {
      const videos: VideoRecord[] = [
        ...Array(10).fill(null).map((_, i) => createTestRecord(`before${i}`, 1000, i)),
        createTestRecord('target', 10000, 10),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBe(10); // 10000 / 1000
    });
  });

  describe('Edge case: Channels with fewer than 10 total videos', () => {
    it('should use all 6 available videos for channel with 7 videos', () => {
      const videos: VideoRecord[] = [
        ...Array(3).fill(null).map((_, i) => createTestRecord(`v${i}`, 1000, i)),
        createTestRecord('target', 2000, 3),
        ...Array(3).fill(null).map((_, i) => createTestRecord(`v${i+4}`, 1000, i + 4)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should use 1 video for channel with 2 videos', () => {
      const videos: VideoRecord[] = [
        createTestRecord('v1', 1000, 0),
        createTestRecord('target', 2000, 1),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should use 3 videos for channel with 4 videos', () => {
      const videos: VideoRecord[] = [
        createTestRecord('v0', 500, 0),
        createTestRecord('target', 2000, 1),
        createTestRecord('v2', 600, 2),
        createTestRecord('v3', 700, 3),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBeCloseTo(3.333333, 2); // 2000 / 600
    });
  });

  describe('Edge case: Videos without views (null, 0, member-only, scheduled)', () => {
    it('should return null for member-only video (null views)', () => {
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i}`, 1000, i)),
        createTestRecord('target', null, 5),
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i+6}`, 1000, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBeNull();
    });

    it('should return 0 for video with exactly 0 views', () => {
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i}`, 1000, i)),
        createTestRecord('target', 0, 5),
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i+6}`, 1000, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBe(0);
    });

    it('should return null when median is 0 (avoid division by zero)', () => {
      const videos: VideoRecord[] = [
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i}`, 0, i)),
        createTestRecord('target', 1000, 5),
        ...Array(5).fill(null).map((_, i) => createTestRecord(`v${i+6}`, 0, i + 6)),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBeNull();
    });

    it('should skip null view videos when selecting neighbors', () => {
      const videos: VideoRecord[] = [
        createTestRecord('v0', 1000, 0),
        createTestRecord('v1', 1000, 1),
        createTestRecord('null1', null, 2), // Skip
        createTestRecord('null2', null, 3), // Skip
        createTestRecord('v4', 1000, 4),
        createTestRecord('v5', 1000, 5),
        createTestRecord('v6', 1000, 6),
        createTestRecord('target', 2000, 7),
        createTestRecord('v8', 1000, 8),
        createTestRecord('null3', null, 9), // Skip
        createTestRecord('v10', 1000, 10),
        createTestRecord('v11', 1000, 11),
        createTestRecord('v12', 1000, 12),
        createTestRecord('v13', 1000, 13),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      // Should find 10 valid neighbors excluding null views
      const score = calculateScore('target');
      expect(score).toBe(2); // 2000 / 1000
    });

    it('should return null when no other valid videos exist', () => {
      const videos: VideoRecord[] = [
        createTestRecord('null1', null, 0),
        createTestRecord('null2', null, 1),
        createTestRecord('target', 1000, 2),
        createTestRecord('null3', null, 3),
        createTestRecord('null4', null, 4),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('target');
      expect(score).toBeNull();
    });

    it('should return null when only one video exists', () => {
      const videos: VideoRecord[] = [
        createTestRecord('only', 1000, 0),
      ];
      
      videos.forEach(v => store.upsert(v));
      
      const score = calculateScore('only');
      expect(score).toBeNull();
    });
  });
});

describe('calculateAllScores', () => {
  it('should calculate scores for all videos in store', () => {
    const videos: VideoRecord[] = Array(15)
      .fill(null)
      .map((_, i) => createTestRecord(`v${i}`, 1000 + i * 100, i));
    
    videos.forEach(v => store.upsert(v));
    
    calculateAllScores();
    
    const state = store.getState();
    const scored = state.list.filter(r => r.score !== null);
    
    expect(scored.length).toBeGreaterThan(0);
    expect(state.list.length).toBe(15);
  });
});

describe('getMedianOutlierScore', () => {
  it('should calculate median score from all videos', () => {
    const videos: VideoRecord[] = [
      createTestRecord('v0', 1000, 0),
      createTestRecord('v1', 2000, 1),
      createTestRecord('v2', 3000, 2),
    ];
    
    videos.forEach(v => {
      store.upsert(v);
      const score = calculateScore(v.videoId);
      if (score !== null) {
        store.update(v.videoId, { score });
      }
    });
    
    const medianScore = getMedianOutlierScore();
    expect(medianScore).toBeGreaterThan(0);
  });
});

// Project-specific scenarios
describe('Project-specific scenarios', () => {
  it('should handle real-world scenario: viral video detection', () => {
    // Simulate a channel where one video went viral
    const videos: VideoRecord[] = [
      ...Array(5).fill(null).map((_, i) => createTestRecord(`regular${i}`, 10000, i)),
      createTestRecord('viral', 1000000, 5), // 100x more views
      ...Array(5).fill(null).map((_, i) => createTestRecord(`regular${i+6}`, 10000, i + 6)),
    ];
    
    videos.forEach(v => store.upsert(v));
    
    const score = calculateScore('viral');
    expect(score).toBe(100); // 1,000,000 / 10,000 = 100
  });

  it('should handle real-world scenario: underperforming video detection', () => {
    // Simulate a channel where one video underperformed
    const videos: VideoRecord[] = [
      ...Array(5).fill(null).map((_, i) => createTestRecord(`popular${i}`, 100000, i)),
      createTestRecord('flop', 1000, 5), // 100x fewer views
      ...Array(5).fill(null).map((_, i) => createTestRecord(`popular${i+6}`, 100000, i + 6)),
    ];
    
    videos.forEach(v => store.upsert(v));
    
    const score = calculateScore('flop');
    expect(score).toBe(0.01); // 1,000 / 100,000 = 0.01
  });

  it('should handle mixed content channel with varying view counts', () => {
    const videos: VideoRecord[] = [
      createTestRecord('short1', 5000, 0),
      createTestRecord('long1', 50000, 1),
      createTestRecord('short2', 7000, 2),
      createTestRecord('long2', 45000, 3),
      createTestRecord('short3', 6000, 4),
      createTestRecord('target', 30000, 5),
      createTestRecord('short4', 5500, 6),
      createTestRecord('long3', 48000, 7),
      createTestRecord('short5', 6500, 8),
      createTestRecord('long4', 52000, 9),
      createTestRecord('short6', 7500, 10),
    ];
    
    videos.forEach(v => store.upsert(v));
    
    const score = calculateScore('target');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(10);
  });
});

