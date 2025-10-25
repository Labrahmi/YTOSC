/**
 * DOM manipulation utilities
 */

import { SELECTORS } from '../constants';

/**
 * Check if we're on a YouTube channel's Videos tab
 */
export function isOnChannelVideosPage(): boolean {
  const url = window.location.href;
  return (
    url.includes('youtube.com/@') ||
    url.includes('youtube.com/c/') ||
    url.includes('youtube.com/channel/')
  );
}

/**
 * Get all video elements on the page (unified for all layouts)
 */
export function getVideoElements(): NodeListOf<Element> {
  return document.querySelectorAll(`${SELECTORS.RICH_ITEM}, ${SELECTORS.GRID_VIDEO}`);
}

/**
 * Find thumbnail container within a video element (works for all layouts)
 */
export function findThumbnailContainer(element: Element): Element | null {
  // Try main thumbnail container first
  let container = element.querySelector(SELECTORS.THUMBNAIL);
  if (!container) {
    // Fallback to thumbnail link for some layouts
    container = element.querySelector(SELECTORS.THUMBNAIL_LINK);
  }
  return container;
}

/**
 * Find title element within a video element (works for all layouts)
 */
export function findTitleElement(element: Element): HTMLAnchorElement | null {
  // Try video title link first (rich layout)
  let titleElement = element.querySelector(SELECTORS.VIDEO_TITLE_LINK) as HTMLAnchorElement;
  if (!titleElement) {
    // Fallback to video title (grid layout)
    titleElement = element.querySelector(SELECTORS.VIDEO_TITLE) as HTMLAnchorElement;
  }
  return titleElement;
}

/**
 * Find title container for badge placement (works for all layouts)
 */
export function findTitleContainer(element: Element): Element | null {
  const titleElement = findTitleElement(element);
  if (!titleElement) return null;

  // For rich layout, the title text might be in a child element
  const titleText = titleElement.querySelector(SELECTORS.VIDEO_TITLE_TEXT);
  return titleText || titleElement;
}

/**
 * Find view count element within a video element (works for all layouts)
 */
export function findViewElement(element: Element): Element | null {
  // Try inline metadata first (rich layout)
  let viewElement = element.querySelector(`${SELECTORS.INLINE_METADATA}:nth-child(1)`);
  if (!viewElement) {
    // Fallback to metadata line span (grid layout)
    const metadataLine = element.querySelector(SELECTORS.METADATA_LINE);
    viewElement = metadataLine ? metadataLine.querySelector('span') : null;
  }
  return viewElement;
}

/**
 * Extract title text from element
 */
export function extractTitle(titleElement: Element, element: Element): string {
  let title = titleElement.textContent?.trim() || '';

  // Fallback to video title text if needed
  if (!title) {
    const titleText = element.querySelector(SELECTORS.VIDEO_TITLE_TEXT);
    title = titleText?.textContent?.trim() || '';
  }

  return title;
}

/**
 * Get YouTube video ID from URL
 */
export function getVideoIdFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Find the container where YouTube filter chips are located
 */
export function findFilterChipContainer(): Element | null {
  // Try different possible selectors for YouTube's filter chip container
  const selectors = [
    'ytd-feed-filter-chip-bar-renderer #chips-content',
    'ytd-feed-filter-chip-bar #chips-content',
    '#chips-content',
    'ytd-feed-filter-chip-bar-renderer',
    'ytd-feed-filter-chip-bar',
    '#filter-chip-bar',
    '.filter-chip-bar',
    'ytd-rich-grid-renderer #filter-chip-bar',
    'ytd-two-column-browse-results-renderer #filter-chip-bar'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

/**
 * Find the primary content area where filters should be injected
 */
export function findPrimaryContentArea(): Element | null {
  // Try to find the main content area for channel pages
  const selectors = [
    'ytd-rich-grid-renderer',
    'ytd-two-column-browse-results-renderer',
    '#primary',
    '#contents'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}

/**
 * Get thumbnail URL from video URL
 */
export function getThumbnailUrl(videoUrl: string): string {
  const videoId = getVideoIdFromUrl(videoUrl);
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

