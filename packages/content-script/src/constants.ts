/**
 * Legacy constants file - now imports from centralized config
 * @deprecated Import from './config' instead
 */

// Re-export from central config for backward compatibility
export {
  SELECTORS,
  TIMINGS,
  SCORE_THRESHOLDS,
  BADGE_COLORS as COLORS,
  BADGE_CLASSES,
  FILTER_CLASSES,
  STYLE_ID,
} from './config';

// Legacy filter selectors (maintained for backward compatibility)
export const FILTER_SELECTORS = {
  CONTAINER: '#ytosc-filter-container',
  CHIP: '.ytosc-filter-chip',
  CHIP_ACTIVE: '.ytosc-filter-chip--active',
  CHIP_BUTTON: '.ytosc-filter-chip-button',
} as const;

