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

import { parseViewCount as coreParseViewCount } from '../../../core/src/viewParser';

/**
 * Main parse function (wrapper around core parser)
 */
export function parseViews(raw: string | null | undefined): number | null {
  return coreParseViewCount(raw || '');
}

/**
 * Format views back to human-readable string
 */
export function formatViews(views: number): string {
  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B`;
  }
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toLocaleString();
}

