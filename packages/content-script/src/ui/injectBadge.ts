/**
 * Idempotent badge injection
 * Creates or updates score badges at the start of video titles
 */

import type { VideoRecord } from '../state/types';
import { formatScore } from '../utils/number';
import { getTitleContainer } from '../parsers/youtubeSelectors';

const BADGE_ATTR = 'data-ytosc-badge';
import { APP_CONFIG } from '../config';

const BADGE_VERSION = APP_CONFIG.BADGE_VERSION;

/**
 * Inject global styles for badges (call once)
 */
export function injectBadgeStyles(): void {
  if (document.getElementById('ytosc-badge-styles')) {
    return; // Already injected
  }

  const style = document.createElement('style');
  style.id = 'ytosc-badge-styles';
  style.textContent = `
    .ytosc-badge {
      width: max-content;
      display: inline-block;
      padding: 3px 5px;
      border-radius: 6px;
      margin-right: 5px;
      color: white;
      font-size: 11.7px;
      line-height: 1.2;
      white-space: nowrap;
      vertical-align: middle;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ytosc-badge--red {
      background: rgb(232, 21, 60);
    }

    .ytosc-badge--purple {
      background: rgb(151, 55, 160);
    }

    .ytosc-badge--blue {
      background: rgb(35, 100, 240);
    }

    .ytosc-badge--gray {
      background: rgb(0, 0, 0);
    }

    .ytosc-badge--navy {
      background: rgb(42, 55, 89);
    }

    /* Hidden class for filtering - hides the entire card */
    .ytosc-hidden {
      display: none !important;
    }
    
    /* Ensure hidden cards don't take up space */
    ytd-rich-item-renderer.ytosc-hidden,
    ytd-grid-video-renderer.ytosc-hidden {
      display: none !important;
      visibility: hidden !important;
    }

    /* Empty state message */
    .ytosc-empty {
      padding: 40px 20px;
      text-align: center;
      color: var(--yt-spec-text-secondary, #606060);
      font-size: 14px;
      background: var(--yt-spec-general-background-a, #f9f9f9);
      border-radius: 8px;
      margin: 20px 0;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Get badge color class based on score
 * Matching reference: >10x = red, >5x = purple, >2x = blue, 1-2x = navy, <1x = black
 */
function getBadgeClass(score: number): string {
  if (score > 10) return 'ytosc-badge--red';      // rgb(232, 21, 60)
  if (score > 5) return 'ytosc-badge--purple';    // rgb(151, 55, 160)
  if (score > 2) return 'ytosc-badge--blue';      // rgb(35, 100, 240)
  if (score > 1) return 'ytosc-badge--navy';      // rgb(42, 55, 89)
  return 'ytosc-badge--gray';                     // rgb(0, 0, 0)
}

/**
 * Ensure a badge exists and is up-to-date (idempotent)
 */
export function ensureBadge(record: VideoRecord): void {
  if (record.score === null) return;

  const titleContainer = getTitleContainer(record.dom.titleEl);
  if (!titleContainer) return;

  // Check for existing badge
  let badge = titleContainer.querySelector(`[${BADGE_ATTR}="${BADGE_VERSION}"]`) as HTMLElement;

  const scoreText = formatScore(record.score);
  const colorClass = getBadgeClass(record.score);

  if (badge) {
    // Update existing badge
    badge.textContent = scoreText;
    
    // Update color class if needed
    badge.className = `ytosc-badge ${colorClass}`;
    
    // Update reference
    record.dom.badgeEl = badge;
  } else {
    // Create new badge
    badge = document.createElement('span');
    badge.setAttribute(BADGE_ATTR, BADGE_VERSION);
    badge.className = `ytosc-badge ${colorClass}`;
    badge.textContent = scoreText;
    
    // Insert at the start of the title
    titleContainer.insertBefore(badge, titleContainer.firstChild);
    
    // Store reference
    record.dom.badgeEl = badge;
    
    // Mark card with score attribute for fast filtering
    record.dom.card.dataset.ytoscScore = String(record.score);
    record.dom.card.dataset.ytoscId = record.videoId;
  }
}

/**
 * Remove badge from a record
 */
export function removeBadge(record: VideoRecord): void {
  if (record.dom.badgeEl && record.dom.badgeEl.parentNode) {
    record.dom.badgeEl.parentNode.removeChild(record.dom.badgeEl);
    record.dom.badgeEl = undefined;
  }
}

/**
 * Update badge for a record (if it exists)
 */
export function updateBadge(record: VideoRecord): void {
  if (record.dom.badgeEl && record.score !== null) {
    const scoreText = formatScore(record.score);
    const colorClass = getBadgeClass(record.score);
    
    record.dom.badgeEl.textContent = scoreText;
    record.dom.badgeEl.className = `ytosc-badge ${colorClass}`;
    
    // Update score attribute
    record.dom.card.dataset.ytoscScore = String(record.score);
  }
}

