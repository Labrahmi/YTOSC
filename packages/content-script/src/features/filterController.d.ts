/**
 * Filter controller
 * Manages filtering by hiding/showing videos
 */
declare class FilterController {
    private currentThreshold;
    private scrollTriggerTimeout;
    private currentSort;
    /**
     * Apply filter with given threshold
     * Hides videos below threshold and triggers loading
     */
    applyFilter(threshold: 2 | 5 | 10): void;
    /**
     * Apply visibility to DOM based on current filter
     */
    applyVisibilityToDom(): void;
    /**
     * Count videos currently visible in DOM
     */
    private countDomVisibleVideos;
    /**
     * Trigger loading if we don't have enough visible videos
     */
    private triggerLoadingIfNeeded;
    /**
     * Scroll to bottom to trigger YouTube's loading mechanism
     */
    private scrollToTriggerLoad;
    /**
     * Apply sorting to videos
     */
    applySort(direction: 'ascending' | 'descending'): void;
    /**
     * Sort videos in the DOM by rearranging elements
     */
    private sortVideosInDom;
    /**
     * Reset filter to show all videos
     */
    reset(): void;
    /**
     * Toggle filter on/off
     */
    toggle(threshold: 2 | 5 | 10): void;
    /**
     * Get current filter threshold
     */
    getCurrentThreshold(): 2 | 5 | 10 | null;
    /**
     * Check if filter is active
     */
    isActive(): boolean;
    /**
     * Get current sort direction
     */
    getCurrentSort(): 'ascending' | 'descending' | null;
    /**
     * Reapply current filter (after new videos loaded)
     * Called when new videos are added to the page
     */
    reapply(): void;
}
export declare const filterController: FilterController;
export {};
