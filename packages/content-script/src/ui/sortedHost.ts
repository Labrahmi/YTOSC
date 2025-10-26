/**
 * Sorted overlay host
 * Non-invasive sorted view that doesn't modify YouTube's DOM
 */

import type { VideoRecord } from '../state/types';
import { formatScore } from '../utils/number';
import { formatViews } from '../parsers/parseViews';
import { logger } from '../utils/logger';

const HOST_ID = 'ytosc-sorted-host';

/**
 * Create and show sorted overlay
 */
export function showSortedOverlay(records: VideoRecord[]): void {
  // Remove existing overlay if present
  hideSortedOverlay();

  // Inject styles
  injectSortedStyles();

  // Hide original grid
  const grid = document.querySelector('ytd-rich-grid-renderer');
  if (grid) {
    (grid as HTMLElement).style.display = 'none';
  }

  // Create overlay host
  const host = document.createElement('div');
  host.id = HOST_ID;
  host.className = 'ytosc-sorted-host';

  // Add header
  const header = document.createElement('div');
  header.className = 'ytosc-sorted-header';
  header.innerHTML = `
    <h3 class="ytosc-sorted-title">Filtered Videos (${records.length})</h3>
    <p class="ytosc-sorted-subtitle">Sorted by outlier score (highest first)</p>
  `;
  host.appendChild(header);

  // Create grid container
  const gridContainer = document.createElement('div');
  gridContainer.className = 'ytosc-sorted-grid';

  // Create card clones
  const fragment = document.createDocumentFragment();
  records.forEach(record => {
    const clone = createCardClone(record);
    if (clone) {
      fragment.appendChild(clone);
    }
  });

  gridContainer.appendChild(fragment);
  host.appendChild(gridContainer);

  // Insert into page
  const insertionPoint = grid?.parentElement || document.querySelector('#primary');
  if (insertionPoint) {
    insertionPoint.insertBefore(host, grid || insertionPoint.firstChild);
    logger.log(`Sorted overlay shown with ${records.length} videos`);
  } else {
    logger.warn('Could not find insertion point for sorted overlay');
  }
}

/**
 * Hide sorted overlay and restore original grid
 */
export function hideSortedOverlay(): void {
  const host = document.getElementById(HOST_ID);
  if (host && host.parentNode) {
    host.parentNode.removeChild(host);
  }

  // Restore original grid
  const grid = document.querySelector('ytd-rich-grid-renderer');
  if (grid) {
    (grid as HTMLElement).style.display = '';
  }
}

/**
 * Create a simplified clone of a video card
 */
function createCardClone(record: VideoRecord): HTMLElement | null {
  if (!record.url || record.score === null) return null;

  const card = document.createElement('a');
  card.href = record.url;
  card.className = 'ytosc-sorted-card';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  // Get thumbnail URL
  const videoId = record.videoId;
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  // Badge color
  let badgeClass = 'ytosc-sorted-badge--gray';
  if (record.score >= 10) badgeClass = 'ytosc-sorted-badge--red';
  else if (record.score >= 5) badgeClass = 'ytosc-sorted-badge--purple';
  else if (record.score >= 2) badgeClass = 'ytosc-sorted-badge--blue';

  card.innerHTML = `
    <div class="ytosc-sorted-card-thumbnail">
      <img src="${thumbnailUrl}" alt="${escapeHtml(record.title)}" loading="lazy" />
    </div>
    <div class="ytosc-sorted-card-content">
      <div class="ytosc-sorted-card-header">
        <span class="ytosc-sorted-badge ${badgeClass}">${formatScore(record.score)}</span>
      </div>
      <h4 class="ytosc-sorted-card-title">${escapeHtml(record.title)}</h4>
      <div class="ytosc-sorted-card-meta">
        ${record.views !== null ? `<span>${formatViews(record.views)} views</span>` : ''}
        ${record.publishedTimeText ? `<span>${escapeHtml(record.publishedTimeText)}</span>` : ''}
      </div>
    </div>
  `;

  return card;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Inject styles for sorted overlay
 */
function injectSortedStyles(): void {
  if (document.getElementById('ytosc-sorted-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'ytosc-sorted-styles';
  style.textContent = `
    .ytosc-sorted-host {
      width: 100%;
      padding: 20px 0;
    }

    .ytosc-sorted-header {
      margin-bottom: 20px;
    }

    .ytosc-sorted-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--yt-spec-text-primary, #030303);
      margin: 0 0 4px 0;
    }

    .ytosc-sorted-subtitle {
      font-size: 13px;
      color: var(--yt-spec-text-secondary, #606060);
      margin: 0;
    }

    .ytosc-sorted-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .ytosc-sorted-card {
      display: flex;
      flex-direction: column;
      background: var(--yt-spec-general-background-a, #fff);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--yt-spec-10-percent-layer, #e5e5e5);
    }

    .ytosc-sorted-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .ytosc-sorted-card-thumbnail {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      background: var(--yt-spec-10-percent-layer, #f0f0f0);
      overflow: hidden;
    }

    .ytosc-sorted-card-thumbnail img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ytosc-sorted-card-content {
      padding: 12px;
    }

    .ytosc-sorted-card-header {
      margin-bottom: 8px;
    }

    .ytosc-sorted-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      color: white;
    }

    .ytosc-sorted-badge--red {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .ytosc-sorted-badge--purple {
      background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
    }

    .ytosc-sorted-badge--blue {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    }

    .ytosc-sorted-badge--gray {
      background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    }

    .ytosc-sorted-card-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
      color: var(--yt-spec-text-primary, #030303);
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ytosc-sorted-card-meta {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: var(--yt-spec-text-secondary, #606060);
    }

    .ytosc-sorted-card-meta span:not(:last-child)::after {
      content: '•';
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .ytosc-sorted-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

