/**
 * Content Script Bootstrap
 * Main entry point that orchestrates all modules
 */

import { store } from './state/store';
import type { VideoRecord } from './state/types';
import { DOMObserver } from './observers/DOMObserver';
import { 
  parseCardElements, 
  extractViewsText, 
  extractTitleText,
  isChannelPage,
  getChannelIdentifier 
} from './parsers/youtubeSelectors';
import { parseViews } from './parsers/parseViews';
import { calculateAllScores } from './calc/score';
import { injectBadgeStyles, ensureBadge } from './ui/injectBadge';
import { injectFilterBar, setChipsEnabled } from './ui/filterBar';
import { filterController } from './features/filterController';
import { initMessageChannel } from './messaging/channel';
import { logger } from './utils/logger';

// Global state
let observer: DOMObserver | null = null;
let currentChannel: string | null = null;
let isInitialized = false;

/**
 * Process new video cards discovered by the observer
 */
function processNewCards(cards: HTMLElement[]): void {
  if (cards.length === 0) return;

  const state = store.getState();
  const existingCount = state.list.length;
  let newCount = 0;

  cards.forEach((card) => {
    const elements = parseCardElements(card);
    if (!elements || !elements.videoId || !elements.url) {
      return;
    }

    // Check if already exists
    const existing = store.getById(elements.videoId);
    if (existing) {
      // Already in store, skip
      return;
    }

    // Extract data
    const title = extractTitleText(elements.titleEl);
    const viewsText = extractViewsText(elements.viewsEl);
    const views = parseViews(viewsText);

    // Determine index in channel (current position in DOM)
    const indexInChannel = existingCount + newCount;

    // Create record
    const record: VideoRecord = {
      videoId: elements.videoId,
      url: elements.url,
      title,
      views,
      score: null,
      indexInChannel,
      status: views !== null ? 'parsed' : 'new',
      dom: {
        card,
        titleEl: elements.titleEl!,
      },
    };

    // Add to store
    store.upsert(record);
    newCount++;
  });

  if (newCount > 0) {
    logger.log(`Added ${newCount} new videos to store`);

    // Recalculate scores for all videos
    calculateAllScores();

    // Inject badges
    const state = store.getState();
    state.list.forEach(record => {
      if (record.score !== null && record.status !== 'injected') {
        ensureBadge(record);
        store.update(record.videoId, { status: 'injected' });
      }
    });

    // Update filter chip states
    const medianScore = store.getMedianScore();
    setChipsEnabled(medianScore > 0);

    // Reapply filter if active
    if (filterController.isActive()) {
      filterController.reapply();
    }

    // Log summary
    const videosWithScores = state.list.filter(r => r.score !== null).length;
    logger.success(
      `Processed: ${state.list.length} total videos | ` +
      `${videosWithScores} scored | ` +
      `Median: ${medianScore.toFixed(2)}x`
    );
  }
}

/**
 * Initialize the extension on the current page
 */
function initialize(): void {
  if (isInitialized) {
    logger.warn('Already initialized, skipping');
    return;
  }

  if (!isChannelPage()) {
    logger.log('Not on a channel page, skipping initialization');
    return;
  }

  logger.log('Initializing YouTube Outlier Score Calculator...');

  // Inject styles
  injectBadgeStyles();

  // Initialize message channel
  initMessageChannel();

  // Inject filter bar
  injectFilterBar((action) => {
    if (action === null) {
      filterController.reset();
    } else if (action === 'ascending' || action === 'descending') {
      filterController.applySort(action);
    } else {
      filterController.toggle(action);
    }
  });

  // Create and start DOM observer
  observer = new DOMObserver(processNewCards);
  observer.start();

  // Track current channel
  currentChannel = getChannelIdentifier();

  isInitialized = true;
  logger.success('Initialization complete');
}

/**
 * Clean up and reinitialize for a new channel
 */
function reinitialize(): void {
  logger.log('Reinitializing for new channel...');

  // Stop observer
  if (observer) {
    observer.stop();
    observer.clear();
  }

  // Clear store
  store.clear();

  // Reset filter
  filterController.reset();

  // Reset state
  isInitialized = false;

  // Initialize fresh
  setTimeout(initialize, 500);
}

/**
 * Handle YouTube SPA navigation
 */
function watchNavigation(): void {
  let lastUrl = location.href;

  const checkNavigation = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;

      const newChannel = getChannelIdentifier();
      
      if (isChannelPage()) {
        if (newChannel !== currentChannel) {
          // Navigated to a different channel
          reinitialize();
        } else if (!isInitialized) {
          // Navigated back to a channel page
          initialize();
        }
      } else {
        // Navigated away from channel page
        if (observer) {
          observer.stop();
        }
        isInitialized = false;
      }
    }
  };

  // Watch for URL changes
  const navigationObserver = new MutationObserver(checkNavigation);
  navigationObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
  });

  // Also listen to popstate events
  window.addEventListener('popstate', checkNavigation);
}

/**
 * Bootstrap the extension
 */
function bootstrap(): void {
  logger.log('YouTube Outlier Score Calculator v2.0.0 loaded');

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initialize, 1000);
    });
  } else {
    setTimeout(initialize, 1000);
  }

  // Watch for navigation
  watchNavigation();
}

// Start the extension
bootstrap();

