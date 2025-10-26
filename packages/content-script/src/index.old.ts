/**
 * Content Script for YouTube Outlier Score Calculator
 * 
 * Main entry point that orchestrates:
 * - Video data extraction
 * - Outlier score calculation
 * - Badge injection
 * - Analytics modal display
 */

import { calculateChannelOutlierScores } from '@core/index';
import type { VideoWithScore } from '@core/types';

import { TIMINGS, SELECTORS } from './constants';
import { isOnChannelVideosPage, getVideoListContainer, getCardUrl, getVideoIdFromUrl } from './utils/dom';
import { extractVideos } from './services/videoExtractor';
import { injectBadges } from './services/badgeInjector';
import { injectFilterContainer } from './services/filterInjector';
import { setCurrentVideos } from './components/modal';
import { injectStyles } from './styles/styles';
import { setActiveFilterChip } from './components/filterChips';

console.log('🎬 YouTube Outlier Score Calculator v1.0.0 loaded');

// Global state
let currentVideos: VideoWithScore[] = [];
let scrollObserver: MutationObserver | null = null;
let lastProcessedCount = 0;
let isProcessing = false;

// Filter & sort state
let activeFilter: 2 | 5 | 10 | null = null;
let medianScore = 0;
let lockedThreshold: number | null = null; // Locked threshold when user applies filter
let originalOrder: Map<string, number> = new Map();
let nodeById: Map<string, HTMLElement> = new Map();
let isApplying = false;
let emptyStateEl: HTMLElement | null = null;
let filterEventListenerAttached = false;

// Video loading limit
const MAX_VIDEOS_WHEN_FILTERED = 60;
let totalVideosLoaded = 0;

/**
 * Compute median outlier score from current videos
 */
function computeMedianScore(videos: VideoWithScore[]): number {
  const validScores = videos
    .map(v => v.outlierScore)
    .filter((score): score is number => 
      score !== null && 
      score !== undefined && 
      !isNaN(score) && 
      score > 0
    );

  if (validScores.length === 0) return 0;

  const sorted = [...validScores].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

/**
 * Capture original DOM order and map video cards by ID
 */
function captureOriginalOrderAndMap(): void {
  const container = getVideoListContainer();
  if (!container) return;

  const videoElements = container.querySelectorAll(`${SELECTORS.RICH_ITEM}, ${SELECTORS.GRID_VIDEO}`);
  
  videoElements.forEach((el, index) => {
    const url = getCardUrl(el);
    if (!url) return;

    const videoId = getVideoIdFromUrl(url);
    if (!videoId) return;

    const htmlEl = el as HTMLElement;

    // Only set original order for new items
    if (!originalOrder.has(videoId)) {
      originalOrder.set(videoId, index);
    }

    // Always update the node map
    nodeById.set(videoId, htmlEl);

    // Set data attributes for fast access
    if (!htmlEl.dataset.ytoscId) {
      htmlEl.dataset.ytoscId = videoId;
    }

    // Find the score from currentVideos
    const video = currentVideos.find(v => getVideoIdFromUrl(v.url) === videoId);
    if (video && video.outlierScore !== null && video.outlierScore !== undefined) {
      htmlEl.dataset.ytoscScore = String(video.outlierScore);
    }
  });
}

/**
 * Apply filter to show only videos matching the threshold
 * @param multiplier - The filter multiplier (2, 5, or 10)
 * @param silent - If true, don't log the filter application (for auto-reapply)
 */
function applyFilter(multiplier: 2 | 5 | 10, silent = false): void {
  if (medianScore <= 0) {
    console.warn('⚠️ Cannot apply filter: median score is 0');
    return;
  }

  isApplying = true;

  // Lock threshold on first application
  let threshold: number;
  if (!silent && lockedThreshold === null) {
    threshold = multiplier * medianScore;
    lockedThreshold = threshold;
  } else if (lockedThreshold !== null) {
    threshold = lockedThreshold;
  } else {
    threshold = multiplier * medianScore;
  }

  let visibleCount = 0;

  // Simple show/hide - no reordering
  nodeById.forEach((el) => {
    const scoreStr = el.dataset.ytoscScore;
    const score = scoreStr ? parseFloat(scoreStr) : null;

    if (score !== null && !isNaN(score) && score > threshold) {
      el.classList.remove('ytosc-hidden');
      visibleCount++;
    } else {
      el.classList.add('ytosc-hidden');
    }
  });

  // Show empty state if no matches
  const container = getVideoListContainer();
  if (visibleCount === 0 && container) {
    showEmptyState(container);
  } else {
    hideEmptyState();
  }

  isApplying = false;

  // Update UI (only on user action)
  if (!silent) {
    const chipId = `gt${multiplier}`;
    setActiveFilterChip(chipId);
    console.log(`🔍 Filter applied: >${multiplier}x (${threshold.toFixed(2)}) | ${visibleCount} visible`);
  }
}

/**
 * Reset filter to show all videos
 */
function resetFilter(): void {
  isApplying = true;

  // Simply show all videos
  nodeById.forEach((el) => {
    el.classList.remove('ytosc-hidden');
  });

  hideEmptyState();

  // Clear filter state
  activeFilter = null;
  lockedThreshold = null;
  setActiveFilterChip(null);

  isApplying = false;

  console.log('🔄 Filter reset: all videos visible');
}

/**
 * Show empty state message
 */
function showEmptyState(container: Element): void {
  hideEmptyState(); // Remove any existing empty state

  emptyStateEl = document.createElement('div');
  emptyStateEl.className = 'ytosc-empty';
  emptyStateEl.textContent = 'No videos match this filter. Try a lower threshold or reset.';
  emptyStateEl.dataset.ytoscEmpty = 'true';

  // Insert at the beginning of the container
  container.insertBefore(emptyStateEl, container.firstChild);
}

/**
 * Hide empty state message
 */
function hideEmptyState(): void {
  if (emptyStateEl && emptyStateEl.parentNode) {
    emptyStateEl.parentNode.removeChild(emptyStateEl);
    emptyStateEl = null;
  }

  // Also remove any orphaned empty states
  const orphaned = document.querySelectorAll('[data-ytosc-empty]');
  orphaned.forEach(el => el.parentNode?.removeChild(el));
}

/**
 * Check if we should stop loading more videos when filter is active
 */
function shouldStopLoading(): boolean {
  return activeFilter !== null && totalVideosLoaded >= MAX_VIDEOS_WHEN_FILTERED;
}

/**
 * Attach event listeners to filter chips
 */
function attachFilterEventListeners(): void {
  if (filterEventListenerAttached) return;

  const container = document.querySelector('#ytosc-filter-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const chip = target.closest('.ytosc-filter-chip') as HTMLElement;

    if (!chip) return;

    const filterId = chip.dataset.filterId;
    if (!filterId) return;

    // Map filter IDs to multipliers
    const multiplierMap: Record<string, 2 | 5 | 10 | null> = {
      'gt2': 2,
      'gt5': 5,
      'gt10': 10,
      'reset': null,
    };

    const multiplier = multiplierMap[filterId];

    if (multiplier === null || filterId === 'reset') {
      // Reset button clicked
      resetFilter();
    } else if (activeFilter === multiplier) {
      // Clicking active filter toggles it off
      resetFilter();
    } else {
      // Apply new filter
      activeFilter = multiplier;
      applyFilter(multiplier);
    }
  });

  filterEventListenerAttached = true;
  console.log('✅ Filter event listeners attached');
}

/**
 * Update filter chip states based on median score
 */
function updateFilterChipStates(): void {
  const container = document.querySelector('#ytosc-filter-container');
  if (!container) return;

  const chips = container.querySelectorAll('.ytosc-filter-chip:not(.ytosc-filter-chip--clear)');
  
  chips.forEach(chip => {
    const htmlChip = chip as HTMLElement;
    if (medianScore <= 0) {
      htmlChip.classList.add('ytosc-filter-chip--disabled');
      const button = htmlChip.querySelector('button');
      if (button) {
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('disabled', 'true');
      }
    } else {
      htmlChip.classList.remove('ytosc-filter-chip--disabled');
      const button = htmlChip.querySelector('button');
      if (button) {
        button.removeAttribute('aria-disabled');
        button.removeAttribute('disabled');
      }
    }
  });
}

/**
 * Main function to inject outlier scores into the page
 */
function injectOutlierScores(): void {
  if (!isOnChannelVideosPage()) {
    return;
  }

  // Inject styles first
  injectStyles();

  // Inject filter container
  injectFilterContainer();

  // Attach filter event listeners (once)
  attachFilterEventListeners();

  // Extract video data
  const videos = extractVideos();

  if (videos.length === 0) {
    console.log('⚠️ No videos found on page');
    return;
  }

  // Calculate outlier scores
  currentVideos = calculateChannelOutlierScores(videos);

  // Update total videos loaded count
  totalVideosLoaded = currentVideos.length;

  // Share with modal component
  setCurrentVideos(currentVideos);

  // Compute median score for filtering
  medianScore = computeMedianScore(currentVideos);

  // Capture original order and map nodes
  captureOriginalOrderAndMap();

  // Update filter chip states
  updateFilterChipStates();

  // Re-apply active filter silently to new videos
  if (activeFilter !== null) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        applyFilter(activeFilter!, true);
      }, TIMINGS.FILTER_REAPPLY_DELAY);
    });
  }

  // Get score statistics
  const videosWithScores = currentVideos.filter(v => v.outlierScore !== null);
  const scores = videosWithScores.map(v => v.outlierScore!);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const highScores = videosWithScores.filter(v => v.outlierScore! >= 2).length;

  // Inject badges into the DOM
  const badgesInjected = injectBadges(currentVideos);

  // Summary log with insights
  console.log(
    `✅ YTOSC: ${videos.length} videos analyzed | ` +
    `${badgesInjected} badges | ` +
    `Avg: ${avgScore.toFixed(1)}x | Max: ${maxScore.toFixed(1)}x | ` +
    `≥2x: ${highScores} | Median: ${medianScore.toFixed(1)}x`
  );
}

/**
 * Initialize scroll observer for infinite scroll detection
 */
function initScrollObserver(): void {
  let debounceTimer: number;
  
  scrollObserver = new MutationObserver(() => {
    // Ignore mutations caused by our own filtering/sorting
    if (isApplying) {
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      // Prevent concurrent processing
      if (isProcessing || isApplying) {
        return;
      }

      // Stop loading if filter is active and reached limit
      if (shouldStopLoading()) {
        return;
      }
      
      // Count current videos on page
      let currentCount = document.querySelectorAll(SELECTORS.RICH_ITEM).length;
      if (currentCount === 0) {
        currentCount = document.querySelectorAll(SELECTORS.GRID_VIDEO).length;
      }
      
      const injectedCount = document.querySelectorAll(SELECTORS.SCORED_VIDEO).length;
      
      // Smart detection: Only process if we have new videos
      // AND not stuck in a loop (same count triggering repeatedly)
      if (currentCount > injectedCount && currentCount !== lastProcessedCount) {
        lastProcessedCount = currentCount;
        isProcessing = true;
        
        injectOutlierScores();
        
        // Reset processing flag after a delay
        setTimeout(() => {
          isProcessing = false;
        }, TIMINGS.PROCESSING_COOLDOWN);
      }
    }, TIMINGS.SCROLL_DEBOUNCE);
  });
  
  // Observe the main content area for changes
  const contentArea = document.querySelector(SELECTORS.CONTENT_AREA);
  if (contentArea) {
    scrollObserver.observe(contentArea, { childList: true, subtree: true });
  }
}

/**
 * Initialize URL change observer for SPA navigation
 */
function initUrlObserver(): void {
  let lastUrl = location.href;
  
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectOutlierScores, TIMINGS.URL_CHANGE_DELAY);
    }
  }).observe(document.body, { subtree: true, childList: true });
}

/**
 * Message listener for popup communication
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_CHANNEL_DATA') {
    // Check if we're on a channel page
    if (!isOnChannelVideosPage()) {
      sendResponse({
        error: 'Not on a YouTube channel page',
        videos: null,
        medianViews: null,
      });
      return true;
    }

    // Return current video data with scores
    if (currentVideos.length > 0) {
      const validVideos = currentVideos.filter(v => v.viewCount !== null && v.viewCount !== undefined);
      const viewCounts = validVideos.map(v => v.viewCount!);
      const medianViews = viewCounts.length > 0 ? calculateMedian(viewCounts) : 0;

      sendResponse({
        videos: currentVideos,
        medianViews,
        error: null,
      });
    } else {
      // No videos extracted yet, try to extract now
      const videos = extractVideos();
      if (videos.length > 0) {
        const videosWithScores = calculateChannelOutlierScores(videos);
        currentVideos = videosWithScores;

        const validVideos = videosWithScores.filter(v => v.viewCount !== null && v.viewCount !== undefined);
        const viewCounts = validVideos.map(v => v.viewCount!);
        const medianViews = viewCounts.length > 0 ? calculateMedian(viewCounts) : 0;

        sendResponse({
          videos: videosWithScores,
          medianViews,
          error: null,
        });
      } else {
        sendResponse({
          error: 'No videos found. Please wait for the page to load.',
          videos: null,
          medianViews: null,
        });
      }
    }

    return true; // Keep the message channel open for async response
  }
});

/**
 * Helper function to calculate median
 */
function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

/**
 * Initialize the content script
 */
function init(): void {
  // Initial injection
  setTimeout(() => {
    injectOutlierScores();
  }, TIMINGS.INITIAL_INJECTION_DELAY);
  
  // Watch for URL changes (YouTube SPA navigation)
  initUrlObserver();
  
  // Watch for infinite scroll
  initScrollObserver();
}

// Start the extension
init();
