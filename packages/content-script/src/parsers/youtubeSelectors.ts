/**
 * YouTube DOM selectors and card node finder
 * Handles different YouTube layout variants
 */

export interface CardElements {
  card: HTMLElement;
  titleEl: HTMLElement | null;
  viewsEl: HTMLElement | null;
  url: string | null;
  videoId: string | null;
}

/**
 * Get the grid container where videos are rendered
 */
export function findGridContainer(): HTMLElement | null {
  // Try in order of likelihood
  const selectors = [
    'ytd-rich-grid-renderer #contents',
    'ytd-section-list-renderer #contents',
    'ytd-grid-renderer #contents',
    '#contents.ytd-rich-grid-renderer',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el as HTMLElement;
  }

  return null;
}

/**
 * Get all video card nodes currently in the DOM
 */
export function findCardNodes(): HTMLElement[] {
  const cards: HTMLElement[] = [];
  
  // Rich grid layout (most common on channel pages)
  const richItems = document.querySelectorAll('ytd-rich-item-renderer');
  richItems.forEach(el => cards.push(el as HTMLElement));
  
  // Fallback to grid layout
  if (cards.length === 0) {
    const gridItems = document.querySelectorAll('ytd-grid-video-renderer');
    gridItems.forEach(el => cards.push(el as HTMLElement));
  }

  return cards;
}

/**
 * Extract all relevant elements from a card
 */
export function parseCardElements(card: HTMLElement): CardElements | null {
  // Find title element (contains URL and title text)
  let titleEl = card.querySelector('a#video-title-link') as HTMLElement;
  if (!titleEl) {
    titleEl = card.querySelector('a#video-title') as HTMLElement;
  }
  if (!titleEl) {
    titleEl = card.querySelector('#video-title') as HTMLElement;
  }

  const url = titleEl instanceof HTMLAnchorElement ? titleEl.href : null;
  const videoId = url ? extractVideoId(url) : null;

  // Skip shorts or invalid videos
  if (!videoId || url?.includes('/shorts/')) {
    return null;
  }

  // Find view count element
  let viewsEl = card.querySelector('.inline-metadata-item:nth-child(1)') as HTMLElement;
  if (!viewsEl) {
    const metadataLine = card.querySelector('#metadata-line');
    viewsEl = metadataLine?.querySelector('span') as HTMLElement;
  }

  return {
    card,
    titleEl,
    viewsEl,
    url,
    videoId,
  };
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Get the title container for badge injection
 * This is the element where we'll prepend the badge
 */
export function getTitleContainer(titleEl: HTMLElement): HTMLElement {
  // Check for yt-formatted-string child (rich layout)
  const formattedString = titleEl.querySelector('yt-formatted-string#video-title');
  if (formattedString) {
    return formattedString as HTMLElement;
  }

  // Otherwise use the title element itself
  return titleEl;
}

/**
 * Extract view count text from views element
 */
export function extractViewsText(viewsEl: HTMLElement | null): string | null {
  if (!viewsEl) return null;

  // Try textContent first
  let text = viewsEl.textContent?.trim();
  if (text) return text;

  // Try aria-label as fallback
  const ariaLabel = viewsEl.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  return null;
}

/**
 * Extract title text
 */
export function extractTitleText(titleEl: HTMLElement | null): string {
  if (!titleEl) return '';
  
  // Remove any existing badges first
  const clone = titleEl.cloneNode(true) as HTMLElement;
  const badges = clone.querySelectorAll('[data-ytosc-badge]');
  badges.forEach(b => b.remove());
  
  return clone.textContent?.trim() || '';
}

/**
 * Check if we're on a YouTube channel page
 */
export function isChannelPage(): boolean {
  const url = window.location.href;
  return (
    url.includes('youtube.com/@') ||
    url.includes('youtube.com/c/') ||
    url.includes('youtube.com/channel/') ||
    url.includes('youtube.com/user/')
  );
}

/**
 * Extract current channel identifier from URL
 */
export function getChannelIdentifier(): string | null {
  const url = window.location.pathname;
  
  // Match @handle, /c/name, /channel/id, or /user/name
  const match = url.match(/\/@([^/]+)|\/c\/([^/]+)|\/channel\/([^/]+)|\/user\/([^/]+)/);
  if (!match) return null;
  
  // Return first non-null group
  const identifier = match[1] || match[2] || match[3] || match[4];
  return identifier || null;
}

