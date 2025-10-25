/**
 * DOM manipulation utilities
 */
/**
 * Check if we're on a YouTube channel's Videos tab
 */
export declare function isOnChannelVideosPage(): boolean;
/**
 * Detect which layout YouTube is using
 */
export declare function detectLayout(): 'rich' | 'grid' | null;
/**
 * Get all video elements on the page
 */
export declare function getVideoElements(): NodeListOf<Element>;
/**
 * Find thumbnail container within a video element
 */
export declare function findThumbnailContainer(element: Element, isRichLayout: boolean): Element | null;
/**
 * Find title element within a video element
 */
export declare function findTitleElement(element: Element, isRichLayout: boolean): HTMLAnchorElement | null;
/**
 * Find view count element within a video element
 */
export declare function findViewElement(element: Element, isRichLayout: boolean): Element | null;
/**
 * Extract title text from element
 */
export declare function extractTitle(titleElement: Element, element: Element, isRichLayout: boolean): string;
/**
 * Get YouTube video ID from URL
 */
export declare function getVideoIdFromUrl(url: string): string | null;
/**
 * Get thumbnail URL from video URL
 */
export declare function getThumbnailUrl(videoUrl: string): string;
/**
 * Escape HTML to prevent XSS
 */
export declare function escapeHtml(text: string): string;
/**
 * Format number with commas
 */
export declare function formatNumber(num: number): string;
