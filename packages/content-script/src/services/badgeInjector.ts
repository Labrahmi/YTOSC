/**
 * Badge injection service
 */

import type { VideoWithScore } from '@core/types';
import { SELECTORS } from '../constants';
import { getVideoElements, detectLayout, findThumbnailContainer } from '../utils/dom';
import { createBadge } from '../components/badge';

/**
 * Inject badges into video thumbnails
 */
export function injectBadges(videos: VideoWithScore[]): number {
  const isRichLayout = detectLayout() === 'rich';
  const videoElements = getVideoElements();
  
  let badgesInjected = 0;
  
  videoElements.forEach((element, index) => {
    const video = videos[index];
    if (!video || video.outlierScore === null) {
      return;
    }
    
    // Find thumbnail container
    const thumbnailContainer = findThumbnailContainer(element, isRichLayout);
    if (!thumbnailContainer) {
      return;
    }
    
    // ALWAYS remove existing badge (scores may have changed with new videos)
    const existingBadge = thumbnailContainer.querySelector(SELECTORS.BADGE);
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Create and inject new badge with updated score
    const badge = createBadge(video.outlierScore, video);
    thumbnailContainer.appendChild(badge);
    badgesInjected++;
    
    // Update score data attribute (may have changed)
    (element as HTMLElement).setAttribute('data-ytosc-score', video.outlierScore.toString());
    (element as HTMLElement).setAttribute('data-ytosc-url', video.url);
  });
  
  return badgesInjected;
}

