/**
 * DOM Observer for detecting new video cards
 * Batches processing to avoid excessive computations
 */
type CardProcessor = (cards: HTMLElement[]) => void;
export declare class DOMObserver {
    private observer;
    private seenCards;
    private processedIds;
    private processor;
    private pendingCallback;
    private isProcessing;
    constructor(processor: CardProcessor);
    /**
     * Start observing the grid container
     */
    start(): void;
    /**
     * Stop observing
     */
    stop(): void;
    /**
     * Clear all state (for channel navigation)
     */
    clear(): void;
    /**
     * Process cards that are already in the DOM
     */
    private processExistingCards;
    /**
     * Handle mutations
     */
    private handleMutations;
    /**
     * Process mutations in idle time
     */
    private processMutations;
    /**
     * Filter out cards we've already seen
     */
    private filterNewCards;
    /**
     * Process a batch of new cards
     */
    private processBatch;
    /**
     * Force re-process all cards (useful after filter changes)
     */
    reprocessAll(): void;
}
export {};
