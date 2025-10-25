/**
 * Badge component for displaying outlier scores
 */

import { VideoWithScore } from '@core/types';
import { BADGE_CLASSES, SCORE_THRESHOLDS } from '../constants';
import { showAnalyticsModal } from './modal';

/**
 * Determine badge variant based on score
 */
function getBadgeVariant(score: number): string {
  if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) return BADGE_CLASSES.GOLD;
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return BADGE_CLASSES.SILVER;
  if (score >= SCORE_THRESHOLDS.GOOD) return BADGE_CLASSES.BRONZE;
  return BADGE_CLASSES.DEFAULT;
}

/**
 * Create a badge element for the outlier score
 */
export function createBadge(score: number, videoData: VideoWithScore): HTMLElement {
  const badge = document.createElement('div');
  badge.className = BADGE_CLASSES.BASE;
  badge.setAttribute('data-ytosc-badge', 'true');
  
  const variant = getBadgeVariant(score);
  badge.classList.add(variant);
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
  return getBadgeVariant(score);
}

