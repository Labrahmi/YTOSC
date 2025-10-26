/**
 * Central store for content script state
 * Single source of truth for video data, filters, and UI state
 */

import type { StoreState, VideoRecord, VideoId, StoreListener, FilterState, UIState } from './types';

class Store {
  private state: StoreState;
  private listeners: Set<StoreListener>;

  constructor() {
    this.state = {
      list: [],
      byId: new Map(),
      filter: {
        active: false,
        targetVisibleCount: 20,
        currentVisibleCount: 0,
        isLoadingPaused: false,
      },
      ui: { mode: 'normal' },
    };
    this.listeners = new Set();
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<StoreState> {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Insert or update a video record
   * Maintains indexInChannel and byId map
   */
  upsert(record: VideoRecord): void {
    const existing = this.state.byId.get(record.videoId);
    
    if (existing) {
      // Update existing record
      Object.assign(existing, record);
    } else {
      // Insert new record
      this.state.list.push(record);
      this.state.byId.set(record.videoId, record);
    }

    this.notify();
  }

  /**
   * Update a record by ID with partial data
   */
  update(id: VideoId, patch: Partial<VideoRecord>): void {
    const record = this.state.byId.get(id);
    if (record) {
      Object.assign(record, patch);
      this.notify();
    }
  }

  /**
   * Replace entire list (for re-indexing or complete refresh)
   */
  replaceList(records: VideoRecord[]): void {
    this.state.list = records;
    this.state.byId = new Map(records.map(r => [r.videoId, r]));
    this.notify();
  }

  /**
   * Update filter state
   */
  setFilter(filter: FilterState): void {
    this.state.filter = filter;
    this.notify();
  }

  /**
   * Update UI state
   */
  setUIState(ui: UIState): void {
    this.state.ui = ui;
    this.notify();
  }

  /**
   * Clear all state (for channel navigation)
   */
  clear(): void {
    this.state = {
      list: [],
      byId: new Map(),
      filter: {
        active: false,
        targetVisibleCount: 20,
        currentVisibleCount: 0,
        isLoadingPaused: false,
      },
      ui: { mode: 'normal' },
    };
    this.notify();
  }

  /**
   * Get neighboring videos for a given video ID
   * Used for calculating outlier scores
   */
  getNeighbors(videoId: VideoId, count: number = 10): VideoRecord[] {
    const record = this.state.byId.get(videoId);
    if (!record) return [];

    const neighbors: VideoRecord[] = [];
    
    // Collect valid neighbors (with views)
    const validList = this.state.list.filter(r => r.views !== null);
    const targetIndexInValid = validList.findIndex(r => r.videoId === videoId);
    
    if (targetIndexInValid === -1) return [];

    // Prefer 5 before and 5 after, but adjust if at edges
    const idealBefore = Math.floor(count / 2);
    const idealAfter = Math.ceil(count / 2);
    
    let before = Math.min(idealBefore, targetIndexInValid);
    let after = Math.min(idealAfter, validList.length - targetIndexInValid - 1);
    
    // If not enough on one side, take more from the other
    const need = count - (before + after);
    if (need > 0) {
      if (before < idealBefore) {
        // Not enough before, take more after
        after = Math.min(validList.length - targetIndexInValid - 1, after + need);
      } else if (after < idealAfter) {
        // Not enough after, take more before
        before = Math.min(targetIndexInValid, before + need);
      }
    }

    // Collect neighbors
    for (let i = targetIndexInValid - before; i < targetIndexInValid; i++) {
      neighbors.push(validList[i]);
    }
    for (let i = targetIndexInValid + 1; i <= targetIndexInValid + after; i++) {
      if (i < validList.length) {
        neighbors.push(validList[i]);
      }
    }

    return neighbors;
  }

  /**
   * Get videos matching current filter threshold
   */
  getFilterMatches(): VideoRecord[] {
    if (!this.state.filter.active || !this.state.filter.threshold) {
      return this.state.list;
    }

    const medianScore = this.getMedianScore();
    const threshold = this.state.filter.threshold * medianScore;

    return this.state.list.filter(r => 
      r.score !== null && r.score > threshold
    );
  }

  /**
   * Count currently visible videos (not hidden by filter)
   */
  countVisibleVideos(): number {
    return this.state.list.filter(r => {
      if (!this.state.filter.active || !this.state.filter.threshold) {
        return true; // All visible when no filter
      }
      const medianScore = this.getMedianScore();
      const threshold = this.state.filter.threshold * medianScore;
      return r.score !== null && r.score > threshold;
    }).length;
  }

  /**
   * Update visible count in filter state
   */
  updateVisibleCount(count: number): void {
    this.state.filter.currentVisibleCount = count;
    this.notify();
  }

  /**
   * Set loading paused state
   */
  setLoadingPaused(paused: boolean): void {
    this.state.filter.isLoadingPaused = paused;
    this.notify();
  }

  /**
   * Get filtered videos sorted by score descending
   */
  getSortedMatchesDesc(): VideoRecord[] {
    const matches = this.getFilterMatches();
    return [...matches].sort((a, b) => {
      const scoreA = a.score ?? -Infinity;
      const scoreB = b.score ?? -Infinity;
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate median outlier score
   */
  getMedianScore(): number {
    const scores = this.state.list
      .map(r => r.score)
      .filter((s): s is number => s !== null && s > 0);

    if (scores.length === 0) return 0;

    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  /**
   * Get record by video ID
   */
  getById(id: VideoId): VideoRecord | undefined {
    return this.state.byId.get(id);
  }

  /**
   * Get all records
   */
  getAll(): VideoRecord[] {
    return this.state.list;
  }
}

// Singleton instance
export const store = new Store();

