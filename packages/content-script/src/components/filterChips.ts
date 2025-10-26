/**
 * Filter chips component for sorting and filtering videos
 */

import { FILTER_CLASSES } from '../constants';

export interface FilterChip {
  label: string;
  id: string;
  isClear?: boolean;
}

/**
 * Filter chip configurations
 */
const FILTER_CHIPS: FilterChip[] = [
  { label: '> 2x median', id: 'gt2' },
  { label: '> 5x median', id: 'gt5' },
  { label: '> 10x median', id: 'gt10' },
  { label: 'Reset', id: 'reset', isClear: true },
];

/**
 * Create a filter chip element
 */
function createFilterChip(chip: FilterChip): HTMLElement {
  const chipElement = document.createElement('div');
  chipElement.className = `${FILTER_CLASSES.CHIP}${chip.isClear ? ` ${FILTER_CLASSES.CHIP_CLEAR}` : ''}`;
  chipElement.setAttribute('data-filter-id', chip.id);

  const button = document.createElement('button');
  button.className = FILTER_CLASSES.CHIP_BUTTON;
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', chip.label);
  button.textContent = chip.label;

  chipElement.appendChild(button);

  return chipElement;
}

/**
 * Create the filter chips container
 */
export function createFilterContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = FILTER_CLASSES.CONTAINER;
  container.id = 'ytosc-filter-container';

  // Create filter chips
  FILTER_CHIPS.forEach(chip => {
    const chipElement = createFilterChip(chip);
    container.appendChild(chipElement);
  });

  return container;
}

/**
 * Update active filter chip
 */
export function setActiveFilterChip(filterId: string | null): void {
  const container = document.querySelector(`#ytosc-filter-container`);
  if (!container) return;

  // Remove active class from all chips
  const chips = container.querySelectorAll(`.${FILTER_CLASSES.CHIP}`);
  chips.forEach(chip => {
    chip.classList.remove(FILTER_CLASSES.CHIP_ACTIVE.slice(1)); // Remove the dot
  });

  // Add active class to selected chip
  if (filterId) {
    const activeChip = container.querySelector(`[data-filter-id="${filterId}"]`);
    if (activeChip) {
      activeChip.classList.add(FILTER_CLASSES.CHIP_ACTIVE.slice(1)); // Remove the dot
    }
  }
}
