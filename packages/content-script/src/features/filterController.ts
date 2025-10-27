/**
 * Filter controller
 * Manages filtering by hiding/showing videos
 */

import { store } from '../state/store';
import { setActiveChip } from '../ui/filterBar';
import { showLoadingOverlay, updateLoadingMessage, hideLoadingOverlay } from '../ui/loadingOverlay';
import { logger } from '../utils/logger';
import { LOADING_CONFIG } from '../config';

class FilterController {
  private currentThreshold: 2 | 5 | 10 | null = null;
  private scrollTriggerTimeout: number | null = null;
  private currentSort: 'ascending' | 'descending' | null = null;

  // Loading timeout and progress tracking
  private loadingStartTime: number = 0;
  private lastVideoCount: number = 0;
  private consecutiveNoProgressChecks: number = 0;
  private loadingCheckInterval: number | null = null;
  
  // Constants for loading behavior (from central config)
  private readonly MAX_LOADING_TIME = LOADING_CONFIG.MAX_LOADING_TIME_MS;
  private readonly NO_PROGRESS_THRESHOLD = LOADING_CONFIG.NO_PROGRESS_THRESHOLD; // Max consecutive checks without progress
  private readonly PROGRESS_CHECK_INTERVAL = LOADING_CONFIG.PROGRESS_CHECK_INTERVAL_MS; // Check every 3 seconds

  /**
   * Apply filter with given threshold
   * Hides videos below threshold and triggers loading
   */
  applyFilter(threshold: 2 | 5 | 10): void {
    const medianScore = store.getMedianScore();
    
    if (medianScore <= 0) {
      logger.warn('Cannot apply filter: median score is 0');
      return;
    }

    this.currentThreshold = threshold;

    // Update store state
    const state = store.getState();
    store.setFilter({
      active: true,
      threshold,
      targetVisibleCount: state.filter.targetVisibleCount,
      currentVisibleCount: 0,
      isLoadingPaused: false,
    });
    store.setUIState({ mode: 'filtered' });

    // Apply visibility to DOM
    this.applyVisibilityToDom();

    // Update UI
    setActiveChip(`gt${threshold}`);

    // Count visible and trigger loading if needed
    const visibleCount = this.countDomVisibleVideos();
    store.updateVisibleCount(visibleCount);

    logger.log(
      `Filter applied: >${threshold}x (${(threshold * medianScore).toFixed(2)}) | ` +
      `${visibleCount} visible`
    );

    // Quick check for small channels - don't waste time loading
    const totalVideos = state.list.length;
    const isSmallChannel = totalVideos < 30;
    const alreadyAtEnd = this.isAtChannelEnd();
    
    if (isSmallChannel || alreadyAtEnd) {
      logger.log(`Small channel detected (${totalVideos} videos) or at end - showing results immediately`);
      
      // Complete immediately without loading animation
      this.completeFilterImmediately(visibleCount, state.filter.targetVisibleCount);
      return;
    }

    // Show loading overlay if we need to load more
    if (visibleCount < state.filter.targetVisibleCount) {
      showLoadingOverlay();
      updateLoadingMessage(visibleCount, state.filter.targetVisibleCount);
      
      // Start progress tracking
      this.startProgressTracking();
    }

    // Trigger scroll to load more if needed
    this.triggerLoadingIfNeeded();
  }
  
  /**
   * Complete filter immediately for small channels
   */
  private completeFilterImmediately(visibleCount: number, targetCount: number): void {
    store.setLoadingPaused(true);
    
    // No overlay for small channels - instant results
    if (visibleCount === 0) {
      logger.log('No matching videos in this channel');
    } else if (visibleCount < targetCount) {
      logger.log(`Found ${visibleCount} matching videos (channel has limited videos)`);
    } else {
      logger.log(`Filter complete with ${visibleCount} videos`);
    }
    
    // Just scroll to top smoothly, no loading overlay
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Start tracking loading progress
   */
  private startProgressTracking(): void {
    // Clear any existing tracking
    this.stopProgressTracking();
    
    // Initialize tracking variables
    this.loadingStartTime = Date.now();
    this.lastVideoCount = store.getState().list.length;
    this.consecutiveNoProgressChecks = 0;
    
    // Start interval to check progress
    this.loadingCheckInterval = window.setInterval(() => {
      this.checkLoadingProgress();
    }, this.PROGRESS_CHECK_INTERVAL);
    
    logger.log('Started progress tracking for filter loading');
  }
  
  /**
   * Stop progress tracking
   */
  private stopProgressTracking(): void {
    if (this.loadingCheckInterval !== null) {
      clearInterval(this.loadingCheckInterval);
      this.loadingCheckInterval = null;
    }
    this.consecutiveNoProgressChecks = 0;
  }
  
  /**
   * Check if loading is making progress
   */
  private checkLoadingProgress(): void {
    const state = store.getState();
    const currentVideoCount = state.list.length;
    const visibleCount = this.countDomVisibleVideos();
    const elapsedTime = Date.now() - this.loadingStartTime;
    
    // Check if we've exceeded max loading time
    if (elapsedTime > this.MAX_LOADING_TIME) {
      logger.warn(`Filter loading timeout after ${elapsedTime}ms`);
      this.stopLoadingWithMessage(
        visibleCount,
        state.filter.targetVisibleCount,
        'timeout'
      );
      return;
    }
    
    // Check if videos are being added
    if (currentVideoCount === this.lastVideoCount) {
      this.consecutiveNoProgressChecks++;
      logger.log(`No progress detected (${this.consecutiveNoProgressChecks}/${this.NO_PROGRESS_THRESHOLD})`);
      
      // Check if we've reached YouTube's end
      if (this.isAtChannelEnd()) {
        logger.log('Detected end of channel content');
        this.stopLoadingWithMessage(
          visibleCount,
          state.filter.targetVisibleCount,
          'end_of_channel'
        );
        return;
      }
      
      // Give up after no progress for too long
      if (this.consecutiveNoProgressChecks >= this.NO_PROGRESS_THRESHOLD) {
        logger.warn('No progress after multiple checks, giving up');
        this.stopLoadingWithMessage(
          visibleCount,
          state.filter.targetVisibleCount,
          'no_progress'
        );
        return;
      }
    } else {
      // Progress detected, reset counter
      this.consecutiveNoProgressChecks = 0;
      this.lastVideoCount = currentVideoCount;
      logger.log(`Progress detected: ${currentVideoCount} total videos, ${visibleCount} visible`);
    }
  }
  
  /**
   * Detect if we've reached the end of the channel
   */
  private isAtChannelEnd(): boolean {
    // Check for YouTube's "no more results" indicators
    const endIndicators = [
      // YouTube's continuation renderer
      'ytd-continuation-item-renderer[hidden]',
      // Grid continuation
      '#continuations[hidden]',
      // Message renderer
      'ytd-message-renderer',
    ];
    
    for (const selector of endIndicators) {
      const el = document.querySelector(selector);
      if (el) {
        logger.log(`Found end indicator: ${selector}`);
        return true;
      }
    }
    
    // Check if scroll height hasn't changed (nothing more to load)
    const scrollableEl = document.documentElement || document.body;
    const isAtBottom = scrollableEl.scrollTop + scrollableEl.clientHeight >= scrollableEl.scrollHeight - 50;
    
    return isAtBottom;
  }
  
  /**
   * Stop loading and show appropriate message
   */
  private stopLoadingWithMessage(
    foundCount: number,
    targetCount: number,
    reason: 'timeout' | 'no_progress' | 'end_of_channel'
  ): void {
    this.stopProgressTracking();
    store.setLoadingPaused(true);
    
    // Determine message based on reason
    let message: string;
    let subtext: string;
    
    if (foundCount === 0) {
      message = 'No matching videos found';
      subtext = 'Try a lower threshold filter';
    } else if (foundCount < targetCount) {
      message = `Found ${foundCount} matching video${foundCount === 1 ? '' : 's'}`;
      
      if (reason === 'end_of_channel') {
        subtext = 'Reached end of channel';
      } else if (reason === 'timeout') {
        subtext = 'Loading took too long';
      } else {
        subtext = 'No more videos available';
      }
    } else {
      message = 'Loading complete';
      subtext = `Found ${foundCount} videos`;
    }
    
    logger.log(`Stopping filter loading: ${reason} - ${message}`);
    
    // Update overlay with final message
    updateLoadingMessage(foundCount, targetCount, message, subtext);
    
    // Hide overlay after showing message
    setTimeout(() => {
      hideLoadingOverlay(1000);
      
      // Scroll back to top
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 500);
    }, 2000);
  }

  /**
   * Apply visibility to DOM based on current filter
   */
  applyVisibilityToDom(): void {
    const state = store.getState();
    const medianScore = store.getMedianScore();
    
    if (!state.filter.active || !state.filter.threshold) {
      // No filter: show all
      state.list.forEach(record => {
        record.dom.card.classList.remove('ytosc-hidden');
      });
      return;
    }

    const threshold = state.filter.threshold * medianScore;

    state.list.forEach(record => {
      const shouldShow = record.score !== null && record.score > threshold;
      
      if (shouldShow) {
        record.dom.card.classList.remove('ytosc-hidden');
      } else {
        record.dom.card.classList.add('ytosc-hidden');
      }
    });
  }

  /**
   * Count videos currently visible in DOM
   */
  private countDomVisibleVideos(): number {
    const state = store.getState();
    return state.list.filter(r => !r.dom.card.classList.contains('ytosc-hidden')).length;
  }

  /**
   * Trigger loading if we don't have enough visible videos
   */
  private triggerLoadingIfNeeded(): void {
    const state = store.getState();
    
    if (state.filter.isLoadingPaused) {
      return; // Already paused
    }

    const visibleCount = this.countDomVisibleVideos();
    
    if (visibleCount >= state.filter.targetVisibleCount) {
      // We have enough videos, pause loading and scroll back to top
      this.stopProgressTracking();
      store.setLoadingPaused(true);
      logger.log(`Target reached: ${visibleCount} visible videos`);
      
      // Update overlay with success message
      updateLoadingMessage(
        visibleCount,
        state.filter.targetVisibleCount,
        'Loading complete',
        `Found ${visibleCount} matching videos`
      );
      
      // Hide loading overlay
      setTimeout(() => {
        hideLoadingOverlay(1000);
        
        // Scroll back to top
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
          logger.log('Filter complete - scrolled back to top');
        }, 500);
      }, 1500);
      
      return;
    }

    // Scroll to bottom to trigger YouTube's infinite scroll
    if (this.scrollTriggerTimeout) {
      clearTimeout(this.scrollTriggerTimeout);
    }

    this.scrollTriggerTimeout = window.setTimeout(() => {
      this.scrollToTriggerLoad();
    }, 500);
  }

  /**
   * Scroll to bottom to trigger YouTube's loading mechanism
   */
  private scrollToTriggerLoad(): void {
    const scrollableEl = document.documentElement || document.body;
    const currentScroll = scrollableEl.scrollTop;
    const scrollHeight = scrollableEl.scrollHeight;
    const clientHeight = scrollableEl.clientHeight;

    // Scroll near bottom to trigger loading
    if (currentScroll + clientHeight < scrollHeight - 100) {
      window.scrollTo({
        top: scrollHeight - clientHeight - 50,
        behavior: 'smooth',
      });
      
      logger.log('Triggered scroll to load more videos');
    }
  }

  /**
   * Apply sorting to videos
   */
  applySort(direction: 'ascending' | 'descending'): void {
    // Clear any active filters first
    this.currentThreshold = null;
    this.currentSort = direction;

    if (this.scrollTriggerTimeout) {
      clearTimeout(this.scrollTriggerTimeout);
      this.scrollTriggerTimeout = null;
    }

    // Update store state
    const state = store.getState();
    store.setFilter({
      active: false,
      targetVisibleCount: state.filter.targetVisibleCount,
      currentVisibleCount: 0,
      isLoadingPaused: false,
    });
    store.setUIState({ mode: 'sorted', sortDirection: direction });

    // Show all videos first (clear any hidden)
    state.list.forEach(record => {
      record.dom.card.classList.remove('ytosc-hidden');
    });

    // Sort videos by score
    this.sortVideosInDom(direction);

    // Update UI
    setActiveChip(direction);

    logger.log(`Sort applied: ${direction}`);
  }

  /**
   * Sort videos in the DOM by rearranging elements
   */
  private sortVideosInDom(direction: 'ascending' | 'descending'): void {
    const state = store.getState();
    const container = state.list[0]?.dom.card.parentElement;
    
    if (!container) {
      logger.warn('Could not find video container for sorting');
      return;
    }

    // Create sorted list of records
    const sortedRecords = [...state.list]
      .filter(r => r.score !== null)
      .sort((a, b) => {
        const scoreA = a.score ?? -Infinity;
        const scoreB = b.score ?? -Infinity;
        return direction === 'ascending' ? scoreA - scoreB : scoreB - scoreA;
      });

    // Records without scores go at the end
    const noScoreRecords = state.list.filter(r => r.score === null);
    const allSorted = [...sortedRecords, ...noScoreRecords];

    // Rearrange DOM elements
    const fragment = document.createDocumentFragment();
    allSorted.forEach(record => {
      fragment.appendChild(record.dom.card);
    });
    container.appendChild(fragment);

    logger.log(`Sorted ${sortedRecords.length} videos ${direction}`);
  }

  /**
   * Reset filter to show all videos
   */
  reset(): void {
    this.currentThreshold = null;
    this.currentSort = null;

    // Clean up all timeouts and intervals
    if (this.scrollTriggerTimeout) {
      clearTimeout(this.scrollTriggerTimeout);
      this.scrollTriggerTimeout = null;
    }
    this.stopProgressTracking();

    // Update store state
    const state = store.getState();
    store.setFilter({
      active: false,
      targetVisibleCount: state.filter.targetVisibleCount,
      currentVisibleCount: 0,
      isLoadingPaused: false,
    });
    store.setUIState({ mode: 'normal' });

    // Show all videos
    this.applyVisibilityToDom();

    // Restore original order (by indexInChannel)
    const container = state.list[0]?.dom.card.parentElement;
    if (container) {
      const fragment = document.createDocumentFragment();
      const sortedByIndex = [...state.list].sort((a, b) => a.indexInChannel - b.indexInChannel);
      sortedByIndex.forEach(record => {
        fragment.appendChild(record.dom.card);
      });
      container.appendChild(fragment);
    }

    // Hide loading overlay if showing
    hideLoadingOverlay();

    // Update UI
    setActiveChip(null);

    logger.log('Filter reset');
  }

  /**
   * Toggle filter on/off
   */
  toggle(threshold: 2 | 5 | 10): void {
    if (this.currentThreshold === threshold) {
      this.reset();
    } else {
      this.applyFilter(threshold);
    }
  }

  /**
   * Get current filter threshold
   */
  getCurrentThreshold(): 2 | 5 | 10 | null {
    return this.currentThreshold;
  }

  /**
   * Check if filter is active
   */
  isActive(): boolean {
    return this.currentThreshold !== null;
  }

  /**
   * Get current sort direction
   */
  getCurrentSort(): 'ascending' | 'descending' | null {
    return this.currentSort;
  }

  /**
   * Reapply current filter (after new videos loaded)
   * Called when new videos are added to the page
   */
  reapply(): void {
    if (this.currentThreshold === null) {
      return;
    }

    // Apply visibility to all videos (including new ones)
    this.applyVisibilityToDom();

    // Update visible count
    const visibleCount = this.countDomVisibleVideos();
    store.updateVisibleCount(visibleCount);

    // Update loading overlay
    const state = store.getState();
    updateLoadingMessage(visibleCount, state.filter.targetVisibleCount);

    logger.log(`Filter reapplied: ${visibleCount} visible videos`);

    // Check if we need to load more
    this.triggerLoadingIfNeeded();
  }
}

// Singleton instance
export const filterController = new FilterController();

