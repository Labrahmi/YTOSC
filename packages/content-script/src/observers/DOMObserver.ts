/**
 * DOM Observer for detecting new video cards
 * Batches processing to avoid excessive computations
 */

import { findGridContainer, findCardNodes } from '../parsers/youtubeSelectors';
import { debounce, requestIdleCallback, cancelIdleCallback } from '../utils/debounce';
import { logger } from '../utils/logger';

type CardProcessor = (cards: HTMLElement[]) => void;

export class DOMObserver {
  private observer: MutationObserver | null = null;
  private seenCards = new WeakSet<HTMLElement>();
  private processedIds = new Set<string>();
  private processor: CardProcessor;
  private pendingCallback: number | null = null;
  private isProcessing = false;

  constructor(processor: CardProcessor) {
    this.processor = processor;
  }

  /**
   * Start observing the grid container
   */
  start(): void {
    const container = findGridContainer();
    if (!container) {
      logger.warn('Grid container not found, cannot start observer');
      return;
    }

    // Process existing cards immediately
    this.processExistingCards();

    // Set up mutation observer
    this.observer = new MutationObserver(
      debounce(() => this.handleMutations(), 300)
    );

    this.observer.observe(container, {
      childList: true,
      subtree: true,
    });

    logger.success('DOM observer started');
  }

  /**
   * Stop observing
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.pendingCallback !== null) {
      cancelIdleCallback(this.pendingCallback);
      this.pendingCallback = null;
    }
    logger.log('DOM observer stopped');
  }

  /**
   * Clear all state (for channel navigation)
   */
  clear(): void {
    this.seenCards = new WeakSet();
    this.processedIds.clear();
    this.isProcessing = false;
    if (this.pendingCallback !== null) {
      cancelIdleCallback(this.pendingCallback);
      this.pendingCallback = null;
    }
  }

  /**
   * Process cards that are already in the DOM
   */
  private processExistingCards(): void {
    const cards = findCardNodes();
    const newCards = this.filterNewCards(cards);
    
    if (newCards.length > 0) {
      logger.log(`Processing ${newCards.length} existing cards`);
      this.processBatch(newCards);
    }
  }

  /**
   * Handle mutations
   */
  private handleMutations(): void {
    if (this.isProcessing) {
      // Already processing, will pick up new cards on next cycle
      return;
    }

    // Use requestIdleCallback to batch processing
    if (this.pendingCallback !== null) {
      cancelIdleCallback(this.pendingCallback);
    }

    this.pendingCallback = requestIdleCallback(() => {
      this.pendingCallback = null;
      this.processMutations();
    }, { timeout: 2000 });
  }

  /**
   * Process mutations in idle time
   */
  private processMutations(): void {
    const cards = findCardNodes();
    const newCards = this.filterNewCards(cards);

    if (newCards.length > 0) {
      logger.log(`Found ${newCards.length} new cards`);
      this.processBatch(newCards);
    }
  }

  /**
   * Filter out cards we've already seen
   */
  private filterNewCards(cards: HTMLElement[]): HTMLElement[] {
    const newCards: HTMLElement[] = [];

    for (const card of cards) {
      // Skip if already seen via WeakSet
      if (this.seenCards.has(card)) continue;

      // Skip if already processed via data attribute
      const videoId = card.dataset.ytoscId;
      if (videoId && this.processedIds.has(videoId)) continue;

      newCards.push(card);
    }

    return newCards;
  }

  /**
   * Process a batch of new cards
   */
  private processBatch(cards: HTMLElement[]): void {
    this.isProcessing = true;

    try {
      // Mark cards as seen
      cards.forEach(card => this.seenCards.add(card));

      // Process cards
      this.processor(cards);

      // Update processed IDs
      cards.forEach(card => {
        const videoId = card.dataset.ytoscId;
        if (videoId) {
          this.processedIds.add(videoId);
        }
      });
    } catch (error) {
      logger.error('Error processing batch', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force re-process all cards (useful after filter changes)
   */
  reprocessAll(): void {
    const cards = findCardNodes();
    logger.log(`Reprocessing ${cards.length} cards`);
    this.processBatch(cards);
  }
}

