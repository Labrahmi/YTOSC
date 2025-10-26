/**
 * Badge injection service
 */

import type { VideoWithScore } from '@core/types';
import { SELECTORS } from '../constants';
import { getVideoElements, findTitleContainer, getCardUrl } from '../utils/dom';
import { createBadge } from '../components/badge';

/**
 * Inject badges at the start of video titles
 */
export function injectBadges(videos: VideoWithScore[]): number {
  const videoElements = getVideoElements();
  let badgesInjected = 0;

  // Create a map of URL -> video for fast lookup
  const videoMap = new Map<string, VideoWithScore>();
  videos.forEach(video => {
    if (video.url) {
      videoMap.set(video.url, video);
    }
  });

  videoElements.forEach((element) => {
    // Get the URL from the element
    const url = getCardUrl(element);
    if (!url) return;

    // Find the matching video by URL
    const video = videoMap.get(url);
    if (!video || video.outlierScore === null) {
      return;
    }

    // Find title container for badge placement
    const titleContainer = findTitleContainer(element);
    if (!titleContainer) {
      return;
    }

    // Check if badge already exists
    const existingBadge = titleContainer.querySelector(SELECTORS.BADGE);
    if (existingBadge) {
      // Badge already present, skip
      return;
    }

    // Create and inject new badge at the start of the title
    const badge = createBadge(video.outlierScore, video);
    titleContainer.insertBefore(badge, titleContainer.firstChild);
    badgesInjected++;

    // Update score data attributes
    (element as HTMLElement).setAttribute('data-ytosc-score', video.outlierScore.toString());
    (element as HTMLElement).setAttribute('data-ytosc-url', video.url);
  });

  return badgesInjected;
}

