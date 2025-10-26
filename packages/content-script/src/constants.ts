/**
 * Constants used throughout the content script
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
  
  // Extension selectors
  BADGE: '[data-ytosc-badge]',
  SCORED_VIDEO: '[data-ytosc-score]',
  MODAL_OVERLAY: '.ytosc-modal-overlay',
} as const;

export const TIMINGS = {
  INITIAL_INJECTION_DELAY: 1500,
  URL_CHANGE_DELAY: 1500,
  SCROLL_DEBOUNCE: 300,
  PROCESSING_COOLDOWN: 500,
  FILTER_REAPPLY_DELAY: 50,
} as const;

export const SCORE_THRESHOLDS = {
  EXCEPTIONAL: 10,
  EXCELLENT: 5,
  GOOD: 2,
} as const;

export const COLORS = {
  RED: '#F44336',
  ORANGE: '#FF9800',
  YELLOW: '#FFEB3B',
  GRAY: '#9E9E9E',
} as const;

export const BADGE_CLASSES = {
  BASE: 'ytosc-badge',
  RED: 'ytosc-badge--red',
  PURPLE: 'ytosc-badge--purple',
  BLUE: 'ytosc-badge--blue',
  GRAY: 'ytosc-badge--gray',
} as const;

export const FILTER_SELECTORS = {
  CONTAINER: '#ytosc-filter-container',
  CHIP: '.ytosc-filter-chip',
  CHIP_ACTIVE: '.ytosc-filter-chip--active',
  CHIP_BUTTON: '.ytosc-filter-chip-button',
} as const;

export const FILTER_CLASSES = {
  CONTAINER: 'ytosc-filter-container',
  CHIP: 'ytosc-filter-chip',
  CHIP_ACTIVE: 'ytosc-filter-chip--active',
  CHIP_BUTTON: 'ytosc-filter-chip-button',
  CHIP_CLEAR: 'ytosc-filter-chip--clear',
} as const;

export const STYLE_ID = 'ytosc-styles';

