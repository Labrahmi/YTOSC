/**
 * Badge component for displaying outlier scores
 */

import { VideoWithScore } from '@core/types';
import { BADGE_CLASSES, SCORE_THRESHOLDS } from '../constants';
import { showAnalyticsModal } from './modal';

/**
 * Create a badge element for the outlier score
 */
export function createBadge(score: number, videoData: VideoWithScore): HTMLElement {
  const badge = document.createElement('div');
  badge.className = BADGE_CLASSES.BASE;
  badge.setAttribute('data-ytosc-badge', 'true');

  // Determine and apply variant class
  if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) {
    badge.classList.add(BADGE_CLASSES.RED);
  } else if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    badge.classList.add(BADGE_CLASSES.PURPLE);
  } else if (score >= SCORE_THRESHOLDS.GOOD) {
    badge.classList.add(BADGE_CLASSES.BLUE);
  } else {
    badge.classList.add(BADGE_CLASSES.GRAY);
  }

  // Set content and interactivity
  badge.textContent = `${score.toFixed(1)}x`;
  badge.title = 'Click for detailed analysis';
  badge.style.cursor = 'pointer';

  // Add click handler to show modal
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showAnalyticsModal(videoData);
  });

  return badge;
}

/**
 * Get badge class name for use in modal
 */
export function getBadgeClass(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) return BADGE_CLASSES.RED;
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return BADGE_CLASSES.PURPLE;
  if (score >= SCORE_THRESHOLDS.GOOD) return BADGE_CLASSES.BLUE;
  return BADGE_CLASSES.GRAY;
}

