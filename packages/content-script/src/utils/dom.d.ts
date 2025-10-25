/**
 * DOM manipulation utilities
 */
/**
 * Check if we're on a YouTube channel's Videos tab
 */
export declare function isOnChannelVideosPage(): boolean;
/**
 * Get all video elements on the page (unified for all layouts)
 */
export declare function getVideoElements(): NodeListOf<Element>;
/**
 * Find thumbnail container within a video element (works for all layouts)
 */
export declare function findThumbnailContainer(element: Element): Element | null;
/**
 * Find title element within a video element (works for all layouts)
 */
export declare function findTitleElement(element: Element): HTMLAnchorElement | null;
/**
 * Find title container for badge placement (works for all layouts)
 */
export declare function findTitleContainer(element: Element): Element | null;
/**
 * Find view count element within a video element (works for all layouts)
 */
export declare function findViewElement(element: Element): Element | null;
/**
 * Extract title text from element
 */
export declare function extractTitle(titleElement: Element, element: Element): string;
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
