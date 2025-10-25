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
 * Detect which layout YouTube is using
 */
export function detectLayout(): 'rich' | 'grid' | null {
  const richItems = document.querySelectorAll(SELECTORS.RICH_ITEM);
  if (richItems.length > 0) return 'rich';
  
  const gridItems = document.querySelectorAll(SELECTORS.GRID_VIDEO);
  if (gridItems.length > 0) return 'grid';
  
  return null;
}

/**
 * Get all video elements on the page
 */
export function getVideoElements(): NodeListOf<Element> {
  let elements = document.querySelectorAll(SELECTORS.RICH_ITEM);
  if (elements.length === 0) {
    elements = document.querySelectorAll(SELECTORS.GRID_VIDEO);
  }
  return elements;
}

/**
 * Find thumbnail container within a video element
 */
export function findThumbnailContainer(
  element: Element,
  isRichLayout: boolean
): Element | null {
  if (isRichLayout) {
    let container = element.querySelector(SELECTORS.THUMBNAIL);
    if (!container) {
      container = element.querySelector(SELECTORS.THUMBNAIL_LINK);
    }
    return container;
  } else {
    return element.querySelector(SELECTORS.THUMBNAIL);
  }
}

/**
 * Find title element within a video element
 */
export function findTitleElement(
  element: Element,
  isRichLayout: boolean
): HTMLAnchorElement | null {
  if (isRichLayout) {
    let titleElement = element.querySelector(SELECTORS.VIDEO_TITLE_LINK) as HTMLAnchorElement;
    if (!titleElement) {
      titleElement = element.querySelector(SELECTORS.VIDEO_TITLE) as HTMLAnchorElement;
    }
    return titleElement;
  } else {
    return element.querySelector(SELECTORS.VIDEO_TITLE) as HTMLAnchorElement;
  }
}

/**
 * Find view count element within a video element
 */
export function findViewElement(
  element: Element,
  isRichLayout: boolean
): Element | null {
  if (isRichLayout) {
    let viewElement = element.querySelector(`${SELECTORS.INLINE_METADATA}:nth-child(1)`);
    if (!viewElement) {
      const metadataItems = element.querySelectorAll(SELECTORS.INLINE_METADATA);
      viewElement = metadataItems[0];
    }
    return viewElement;
  } else {
    const metadataLine = element.querySelector(SELECTORS.METADATA_LINE);
    return metadataLine ? metadataLine.querySelector('span') : null;
  }
}

/**
 * Extract title text from element
 */
export function extractTitle(
  titleElement: Element,
  element: Element,
  isRichLayout: boolean
): string {
  let title = titleElement.textContent?.trim() || '';
  
  // For rich layout, title might be in a child element
  if (!title && isRichLayout) {
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

