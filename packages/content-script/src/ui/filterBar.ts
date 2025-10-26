/**
 * In-page filter bar (chips for 2x, 5x, 10x, Reset)
 */

import { logger } from '../utils/logger';

const FILTER_BAR_ID = 'ytosc-filter-container';

export type FilterCallback = (threshold: 2 | 5 | 10 | 'ascending' | 'descending' | null) => void;

/**
 * Inject filter bar into the page
 */
export function injectFilterBar(onFilterChange: FilterCallback): void {
  // Don't inject if already exists
  if (document.getElementById(FILTER_BAR_ID)) {
    return;
  }

  // Inject styles
  injectFilterStyles();

  // Find insertion point (near YouTube's own filter chips if they exist)
  const insertionPoint = findInsertionPoint();
  if (!insertionPoint) {
    logger.warn('Could not find insertion point for filter bar');
    return;
  }

  // Create filter container
  const container = document.createElement('div');
  container.id = FILTER_BAR_ID;
  container.className = 'ytosc-filter-container';
  
  // Create filter buttons (matching reference style)
  container.innerHTML = `
    <button class="ytosc-filter-btn" data-filter-id="ascending" type="button" aria-label="Sort videos by score ascending">
      Ascending
    </button>
    <button class="ytosc-filter-btn" data-filter-id="descending" type="button" aria-label="Sort videos by score descending">
      Descending
    </button>
    <button class="ytosc-filter-btn" data-filter-id="gt2" type="button" aria-label="Show videos with outlier score greater than 2x">
      >2
    </button>
    <button class="ytosc-filter-btn" data-filter-id="gt5" type="button" aria-label="Show videos with outlier score greater than 5x">
      >5
    </button>
    <button class="ytosc-filter-btn" data-filter-id="gt10" type="button" aria-label="Show videos with outlier score greater than 10x">
      >10
    </button>
    <button class="ytosc-filter-btn ytosc-filter-btn--clear" data-filter-id="reset" type="button" aria-label="Reset filter to show all videos">
      Clear
    </button>
  `;

  // Add event listener
  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('.ytosc-filter-btn') as HTMLElement;
    
    if (!button) return;

    const filterId = button.dataset.filterId;
    if (!filterId) return;

    // Map filter IDs to thresholds/actions
    const actionMap: Record<string, 2 | 5 | 10 | 'ascending' | 'descending' | null> = {
      'ascending': 'ascending',
      'descending': 'descending',
      'gt2': 2,
      'gt5': 5,
      'gt10': 10,
      'reset': null,
    };

    const action = actionMap[filterId];
    onFilterChange(action);
  });

  // Insert into page
  // If we're inside #chips-content, insert after the #right-arrow (at the end)
  const rightArrow = insertionPoint.querySelector('#right-arrow');
  if (rightArrow && insertionPoint.id === 'chips-content') {
    // Insert after the right arrow
    insertionPoint.appendChild(container);
  } else {
    // Otherwise append to the insertion point
    insertionPoint.appendChild(container);
  }

  logger.success('Filter bar injected');
}

/**
 * Set active filter chip
 */
export function setActiveChip(filterId: string | null): void {
  const container = document.getElementById(FILTER_BAR_ID);
  if (!container) return;

  const buttons = container.querySelectorAll('.ytosc-filter-btn');
  buttons.forEach(btn => {
    const button = btn as HTMLElement;
    const btnId = button.dataset.filterId;
    
    if (btnId === filterId) {
      button.classList.add('ytosc-filter-btn--active');
    } else {
      button.classList.remove('ytosc-filter-btn--active');
    }
  });
}

/**
 * Enable or disable filter chips
 */
export function setChipsEnabled(enabled: boolean): void {
  const container = document.getElementById(FILTER_BAR_ID);
  if (!container) return;

  const buttons = container.querySelectorAll('.ytosc-filter-btn:not(.ytosc-filter-btn--clear)');
  buttons.forEach(btn => {
    const button = btn as HTMLButtonElement;

    if (enabled) {
      button.removeAttribute('disabled');
      button.classList.remove('ytosc-filter-btn--disabled');
    } else {
      button.setAttribute('disabled', 'true');
      button.classList.add('ytosc-filter-btn--disabled');
    }
  });
}

/**
 * Find where to insert the filter bar
 */
function findInsertionPoint(): HTMLElement | null {
  // Primary: Insert inside YouTube's chip bar, in the chips-content area
  const chipsContent = document.querySelector('ytd-feed-filter-chip-bar-renderer #chips-content');
  if (chipsContent) {
    return chipsContent as HTMLElement;
  }

  // Fallback 1: Try to find the chip bar wrapper
  const ytChipBar = document.querySelector('ytd-feed-filter-chip-bar-renderer');
  if (ytChipBar) {
    const chipsWrapper = ytChipBar.querySelector('#chips-wrapper');
    if (chipsWrapper) {
      return chipsWrapper as HTMLElement;
    }
    return ytChipBar as HTMLElement;
  }

  // Fallback 2: insert before the grid
  const grid = document.querySelector('ytd-rich-grid-renderer');
  if (grid) {
    return grid.parentElement as HTMLElement;
  }

  // Last resort: use primary content
  return document.querySelector('#primary') as HTMLElement;
}

/**
 * Inject filter bar styles
 */
function injectFilterStyles(): void {
  if (document.getElementById('ytosc-filter-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'ytosc-filter-styles';
  style.textContent = `
    /* Container floating on the right - matching reference */
    .ytosc-filter-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: left;
      margin-left: auto;
      margin-right: 12px;
      gap: 12px;
      flex-shrink: 0;
    }

    /* Filter buttons - matching reference style */
    .ytosc-filter-btn {
      display: inline-block;
      padding: 10px 16px;
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      background-color: rgb(35, 100, 240);
      color: rgb(254, 254, 254);
      font-size: 1.25rem;
      border: none;
      border-radius: 8px;
      transition: opacity 0.2s ease, transform 0.1s ease;
    }

    .ytosc-filter-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .ytosc-filter-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .ytosc-filter-btn--active {
      box-shadow: 0 0 0 2px rgb(254, 254, 254), 0 0 0 4px rgb(35, 100, 240);
    }

    .ytosc-filter-btn--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ytosc-filter-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Clear button - red color matching reference */
    .ytosc-filter-btn--clear {
      background-color: rgb(232, 21, 60);
    }

    .ytosc-filter-btn--clear:hover:not(:disabled) {
      opacity: 0.9;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Remove filter bar from page
 */
export function removeFilterBar(): void {
  const container = document.getElementById(FILTER_BAR_ID);
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

