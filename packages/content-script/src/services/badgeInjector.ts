/**
 * Badge injection service
 */

import type { VideoWithScore } from '@core/types';
import { SELECTORS } from '../constants';
import { getVideoElements, findTitleContainer } from '../utils/dom';
import { createBadge } from '../components/badge';

/**
 * Inject badges at the start of video titles
 */
export function injectBadges(videos: VideoWithScore[]): number {
  const videoElements = getVideoElements();
  let badgesInjected = 0;

  videoElements.forEach((element, index) => {
    const video = videos[index];
    if (!video || video.outlierScore === null) {
      return;
    }

    // Find title container for badge placement
    const titleContainer = findTitleContainer(element);
    if (!titleContainer) {
      return;
    }

    // Remove existing badge if present
    const existingBadge = titleContainer.querySelector(SELECTORS.BADGE);
    if (existingBadge) {
      existingBadge.remove();
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

