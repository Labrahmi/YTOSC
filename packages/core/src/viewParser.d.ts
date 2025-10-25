/**
 * Parse YouTube view count strings into numbers
 * Handles formats like "1.2K", "12M", "1.5B", etc.
 * Also handles international formats with spaces, different separators, and localized suffixes
 *
 * Returns null for videos without view counts (member-only, scheduled, etc.)
 */
export declare function parseViewCount(viewString: string): number | null;
/**
 * Format a view count number back to a human-readable string
 */
export declare function formatViewCount(views: number): string;
