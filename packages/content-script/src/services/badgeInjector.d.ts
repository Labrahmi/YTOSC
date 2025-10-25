/**
 * Badge injection service
 */
import type { VideoWithScore } from '@core/types';
/**
 * Inject badges at the start of video titles
 */
export declare function injectBadges(videos: VideoWithScore[]): number;
