/**
 * Filter controller
 * Manages filtering by hiding/showing videos
 */

import { store } from '../state/store';
import { setActiveChip } from '../ui/filterBar';
import { showLoadingOverlay, updateLoadingMessage, hideLoadingOverlay } from '../ui/loadingOverlay';
import { logger } from '../utils/logger';

class FilterController {
  private currentThreshold: 2 | 5 | 10 | null = null;
  private scrollTriggerTimeout: number | null = null;

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

    // Show loading overlay if we need to load more
    if (visibleCount < state.filter.targetVisibleCount) {
      showLoadingOverlay();
      updateLoadingMessage(visibleCount, state.filter.targetVisibleCount);
    }

    // Trigger scroll to load more if needed
    this.triggerLoadingIfNeeded();
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
      store.setLoadingPaused(true);
      logger.log(`Target reached: ${visibleCount} visible videos`);
      
      // Hide loading overlay
      hideLoadingOverlay();
      
      // Scroll back to top once at the end
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        logger.log('Filter complete - scrolled back to top');
      }, 500);
      
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
   * Reset filter to show all videos
   */
  reset(): void {
    this.currentThreshold = null;

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
    store.setUIState({ mode: 'normal' });

    // Show all videos
    this.applyVisibilityToDom();

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

