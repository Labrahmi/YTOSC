/**
 * Video data extraction service
 */
import type { VideoData } from '@core/types';
/**
 * Extract video data from YouTube channel page
 * Supports both old (ytd-grid-video-renderer) and new (ytd-rich-item-renderer) layouts
 */
export declare function extractVideos(): VideoData[];
