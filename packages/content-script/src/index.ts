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
import { isOnChannelVideosPage } from './utils/dom';
import { extractVideos } from './services/videoExtractor';
import { injectBadges } from './services/badgeInjector';
import { setCurrentVideos } from './components/modal';
import { injectStyles } from './styles/styles';

console.log('🎬 YouTube Outlier Score Calculator v1.0.0 loaded');

// Global state
let currentVideos: VideoWithScore[] = [];
let scrollObserver: MutationObserver | null = null;
let lastProcessedCount = 0;
let isProcessing = false;

/**
 * Main function to inject outlier scores into the page
 */
function injectOutlierScores(): void {
  if (!isOnChannelVideosPage()) {
    return;
  }
  
  // Inject styles first
  injectStyles();
  
  // Extract video data
  const videos = extractVideos();
  
  if (videos.length === 0) {
    console.log('⚠️ No videos found on page');
    return;
  }
  
  // Calculate outlier scores
  currentVideos = calculateChannelOutlierScores(videos);
  
  // Share with modal component
  setCurrentVideos(currentVideos);
  
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
    `≥2x: ${highScores}`
  );
}

/**
 * Initialize scroll observer for infinite scroll detection
 */
function initScrollObserver(): void {
  let debounceTimer: number;
  
  scrollObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      // Prevent concurrent processing
      if (isProcessing) {
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
