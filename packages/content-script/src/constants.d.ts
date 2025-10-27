/**
 * Legacy constants file - now imports from centralized config
 * @deprecated Import from './config' instead
 */
export { SELECTORS, TIMINGS, SCORE_THRESHOLDS, BADGE_COLORS as COLORS, BADGE_CLASSES, FILTER_CLASSES, STYLE_ID, } from './config';
export declare const FILTER_SELECTORS: {
    readonly CONTAINER: "#ytosc-filter-container";
    readonly CHIP: ".ytosc-filter-chip";
    readonly CHIP_ACTIVE: ".ytosc-filter-chip--active";
    readonly CHIP_BUTTON: ".ytosc-filter-chip-button";
};
