/**
 * Central configuration file
 * Single source of truth for all constants used throughout the content script
 */

/**
 * Extension metadata
 */
export const APP_CONFIG = {
  NAME: 'YouTube Outlier Score Calculator',
  VERSION: '1.0.0',
  BADGE_VERSION: 'v1',
} as const;

/**
 * Score thresholds for filtering and classification
 */
export const SCORE_THRESHOLDS = {
  EXCEPTIONAL: 10,  // 10x the median (Gold badge)
  EXCELLENT: 5,     // 5x the median (Silver badge)
  GOOD: 2,          // 2x the median (Bronze badge)
} as const;

/**
 * Filter multipliers (must match SCORE_THRESHOLDS values)
 */
export type FilterMultiplier = 2 | 5 | 10;

/**
 * Badge colors based on performance level
 */
export const BADGE_COLORS = {
  RED: '#F44336',      // 10x+ (Exceptional)
  PURPLE: '#9C27B0',   // 5-10x (Excellent)
  BLUE: '#2196F3',     // 2-5x (Good)
  GRAY: '#9E9E9E',     // <2x (Below threshold)
} as const;

/**
 * Loading behavior configuration
 */
export const LOADING_CONFIG = {
  MAX_LOADING_TIME_MS: 45000,            // 45 seconds maximum loading time
  NO_PROGRESS_THRESHOLD: 3,              // Give up after 3 checks with no progress
  PROGRESS_CHECK_INTERVAL_MS: 3000,      // Check progress every 3 seconds
  TARGET_VISIBLE_COUNT: 20,              // Target number of visible videos when filtering
} as const;

/**
 * Timing delays for various operations (in milliseconds)
 */
export const TIMINGS = {
  INITIAL_INJECTION_DELAY: 1500,         // Wait before first injection
  URL_CHANGE_DELAY: 1500,                // Wait after URL navigation
  SCROLL_DEBOUNCE: 300,                  // Debounce scroll events
  PROCESSING_COOLDOWN: 500,              // Cooldown after processing videos
  FILTER_REAPPLY_DELAY: 50,              // Delay before reapplying filter
  REINIT_DELAY: 500,                     // Delay before reinitializing on channel change
  DOM_READY_DELAY: 1000,                 // Wait for DOM to be ready on bootstrap
} as const;

/**
 * YouTube DOM selectors
 */
export const SELECTORS = {
  // YouTube layout selectors
  RICH_ITEM: 'ytd-rich-item-renderer',
  GRID_VIDEO: 'ytd-grid-video-renderer',
  THUMBNAIL: 'ytd-thumbnail',
  THUMBNAIL_LINK: 'a#thumbnail',
  VIDEO_TITLE_LINK: 'a#video-title-link',
  VIDEO_TITLE: '#video-title',
  VIDEO_TITLE_TEXT: 'yt-formatted-string#video-title',
  METADATA_LINE: '#metadata-line',
  INLINE_METADATA: '.inline-metadata-item',
  CONTENT_AREA: 'ytd-app',
  
  // Extension-specific selectors
  BADGE: '[data-ytosc-badge]',
  SCORED_VIDEO: '[data-ytosc-score]',
  MODAL_OVERLAY: '.ytosc-modal-overlay',
} as const;

/**
 * CSS class names for filter UI
 */
export const FILTER_CLASSES = {
  CONTAINER: 'ytosc-filter-container',
  CHIP: 'ytosc-filter-chip',
  CHIP_ACTIVE: 'ytosc-filter-chip--active',
  CHIP_BUTTON: 'ytosc-filter-chip-button',
  CHIP_CLEAR: 'ytosc-filter-chip--clear',
  CHIP_DISABLED: 'ytosc-filter-chip--disabled',
} as const;

/**
 * CSS class names for badges
 */
export const BADGE_CLASSES = {
  BASE: 'ytosc-badge',
  RED: 'ytosc-badge--red',
  PURPLE: 'ytosc-badge--purple',
  BLUE: 'ytosc-badge--blue',
  GRAY: 'ytosc-badge--gray',
} as const;

/**
 * Style element ID
 */
export const STYLE_ID = 'ytosc-styles';

/**
 * Neighbor selection configuration for outlier score calculation
 */
export const NEIGHBOR_CONFIG = {
  TARGET_COUNT: 10,        // Try to get 10 neighbors total
  IDEAL_BEFORE: 5,         // Prefer 5 before the target video
  IDEAL_AFTER: 5,          // Prefer 5 after the target video
} as const;

