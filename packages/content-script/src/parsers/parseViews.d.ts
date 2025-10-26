/**
 * Robust view count parser
 * Handles multiple formats and locales:
 * - "1.2k views", "12M views", "500K", "1B"
 * - Different languages: English, French, Spanish, German, Portuguese, Russian, Arabic, Chinese, Japanese
 * - Different decimal separators: . and ,
 * - Member-only, scheduled, and live videos
 *
 * This is a simplified wrapper around the core parseViewCount function
 */
/**
 * Main parse function (wrapper around core parser)
 */
export declare function parseViews(raw: string | null | undefined): number | null;
/**
 * Format views back to human-readable string
 */
export declare function formatViews(views: number): string;
