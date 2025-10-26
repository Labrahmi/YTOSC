/**
 * Central store for content script state
 * Single source of truth for video data, filters, and UI state
 */
import type { StoreState, VideoRecord, VideoId, StoreListener, FilterState, UIState } from './types';
declare class Store {
    private state;
    private listeners;
    constructor();
    /**
     * Get current state (read-only)
     */
    getState(): Readonly<StoreState>;
    /**
     * Subscribe to state changes
     */
    subscribe(listener: StoreListener): () => void;
    /**
     * Notify all listeners of state change
     */
    private notify;
    /**
     * Insert or update a video record
     * Maintains indexInChannel and byId map
     */
    upsert(record: VideoRecord): void;
    /**
     * Update a record by ID with partial data
     */
    update(id: VideoId, patch: Partial<VideoRecord>): void;
    /**
     * Replace entire list (for re-indexing or complete refresh)
     */
    replaceList(records: VideoRecord[]): void;
    /**
     * Update filter state
     */
    setFilter(filter: FilterState): void;
    /**
     * Update UI state
     */
    setUIState(ui: UIState): void;
    /**
     * Clear all state (for channel navigation)
     */
    clear(): void;
    /**
     * Get neighboring videos for a given video ID
     * Used for calculating outlier scores
     */
    getNeighbors(videoId: VideoId, count?: number): VideoRecord[];
    /**
     * Get videos matching current filter threshold
     */
    getFilterMatches(): VideoRecord[];
    /**
     * Count currently visible videos (not hidden by filter)
     */
    countVisibleVideos(): number;
    /**
     * Update visible count in filter state
     */
    updateVisibleCount(count: number): void;
    /**
     * Set loading paused state
     */
    setLoadingPaused(paused: boolean): void;
    /**
     * Get filtered videos sorted by score descending
     */
    getSortedMatchesDesc(): VideoRecord[];
    /**
     * Calculate median outlier score
     */
    getMedianScore(): number;
    /**
     * Get record by video ID
     */
    getById(id: VideoId): VideoRecord | undefined;
    /**
     * Get all records
     */
    getAll(): VideoRecord[];
}
export declare const store: Store;
export {};
