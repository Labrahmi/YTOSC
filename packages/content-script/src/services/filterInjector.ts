/**
 * Filter container injection service
 */

import { FILTER_SELECTORS } from '../constants';
import { findFilterChipContainer, findPrimaryContentArea } from '../utils/dom';
import { createFilterContainer } from '../components/filterChips';

/**
 * Inject filter container into the YouTube page
 */
export function injectFilterContainer(): boolean {
  // Check if filter container already exists
  if (document.querySelector(FILTER_SELECTORS.CONTAINER)) {
    return true; // Already injected
  }

  // Try to find YouTube's chips-content container (the flex row)
  const chipsContent = document.querySelector('#chips-content') ||
                      document.querySelector('ytd-feed-filter-chip-bar-renderer #chips-content');

  if (chipsContent) {
    // Find the scroll-container and right-arrow to inject between them
    const scrollContainer = chipsContent.querySelector('#scroll-container');
    const rightArrow = chipsContent.querySelector('#right-arrow');

    if (scrollContainer && rightArrow) {
      // Create and inject the filter container between scroll-container and right-arrow
      const filterContainer = createFilterContainer();
      chipsContent.insertBefore(filterContainer, rightArrow);
      console.log('✅ YTOSC Filter container injected in chips row');
      return true;
    }
  }

  // Fallback: Try to find YouTube's filter chip container
  let targetContainer = findFilterChipContainer();

  // If not found, try to find the primary content area
  if (!targetContainer) {
    targetContainer = findPrimaryContentArea();
  }

  // If still not found, try to find a suitable container
  if (!targetContainer) {
    // Fallback to finding any container that might hold content
    const fallbackSelectors = [
      'ytd-browse[page-subtype="channels"]',
      'ytd-browse',
      '#page-manager'
    ];

    for (const selector of fallbackSelectors) {
      targetContainer = document.querySelector(selector);
      if (targetContainer) break;
    }
  }

  if (!targetContainer) {
    console.warn('⚠️ Could not find suitable container for filter injection');
    return false;
  }

  // Create and inject the filter container
  const filterContainer = createFilterContainer();

  // Insert at the beginning of the target container
  if (targetContainer.firstChild) {
    targetContainer.insertBefore(filterContainer, targetContainer.firstChild);
  } else {
    targetContainer.appendChild(filterContainer);
  }

  console.log('✅ YTOSC Filter container injected (fallback)');
  return true;
}

/**
 * Remove filter container from the page
 */
export function removeFilterContainer(): void {
  const container = document.querySelector(FILTER_SELECTORS.CONTAINER);
  if (container) {
    container.remove();
    console.log('🗑️ YTOSC Filter container removed');
  }
}
