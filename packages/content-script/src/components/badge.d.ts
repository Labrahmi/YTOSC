/**
 * Badge component for displaying outlier scores
 */
import { VideoWithScore } from '@core/types';
/**
 * Create a badge element for the outlier score
 */
export declare function createBadge(score: number, videoData: VideoWithScore): HTMLElement;
/**
 * Get badge class name for use in modal
 */
export declare function getBadgeClass(score: number): string;
