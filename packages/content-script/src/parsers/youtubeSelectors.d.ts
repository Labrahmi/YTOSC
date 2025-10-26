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
export declare function findGridContainer(): HTMLElement | null;
/**
 * Get all video card nodes currently in the DOM
 */
export declare function findCardNodes(): HTMLElement[];
/**
 * Extract all relevant elements from a card
 */
export declare function parseCardElements(card: HTMLElement): CardElements | null;
/**
 * Extract video ID from YouTube URL
 */
export declare function extractVideoId(url: string): string | null;
/**
 * Get the title container for badge injection
 * This is the element where we'll prepend the badge
 */
export declare function getTitleContainer(titleEl: HTMLElement): HTMLElement;
/**
 * Extract view count text from views element
 */
export declare function extractViewsText(viewsEl: HTMLElement | null): string | null;
/**
 * Extract title text
 */
export declare function extractTitleText(titleEl: HTMLElement | null): string;
/**
 * Check if we're on a YouTube channel page
 */
export declare function isChannelPage(): boolean;
/**
 * Extract current channel identifier from URL
 */
export declare function getChannelIdentifier(): string | null;
