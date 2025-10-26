/**
 * Idempotent badge injection
 * Creates or updates score badges at the start of video titles
 */

import type { VideoRecord } from '../state/types';
import { formatScore } from '../utils/number';
import { getTitleContainer } from '../parsers/youtubeSelectors';

const BADGE_ATTR = 'data-ytosc-badge';
const BADGE_VERSION = 'v1';

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
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      margin-right: 6px;
      border-radius: 3px;
      color: white;
      vertical-align: middle;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.2;
    }

    .ytosc-badge--red {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
      box-shadow: 0 1px 3px rgba(231, 76, 60, 0.4);
    }

    .ytosc-badge--purple {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      box-shadow: 0 1px 3px rgba(155, 89, 182, 0.4);
    }

    .ytosc-badge--blue {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      box-shadow: 0 1px 3px rgba(52, 152, 219, 0.4);
    }

    .ytosc-badge--gray {
      background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
      box-shadow: 0 1px 3px rgba(149, 165, 166, 0.3);
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
 */
function getBadgeClass(score: number): string {
  if (score >= 10) return 'ytosc-badge--red';
  if (score >= 5) return 'ytosc-badge--purple';
  if (score >= 2) return 'ytosc-badge--blue';
  return 'ytosc-badge--gray';
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

