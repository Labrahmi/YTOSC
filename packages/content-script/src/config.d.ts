/**
 * Central configuration file
 * Single source of truth for all constants used throughout the content script
 */
/**
 * Extension metadata
 */
export declare const APP_CONFIG: {
    readonly NAME: "YouTube Outlier Score Calculator";
    readonly VERSION: "1.0.0";
    readonly BADGE_VERSION: "v1";
};
/**
 * Score thresholds for filtering and classification
 */
export declare const SCORE_THRESHOLDS: {
    readonly EXCEPTIONAL: 10;
    readonly EXCELLENT: 5;
    readonly GOOD: 2;
};
/**
 * Filter multipliers (must match SCORE_THRESHOLDS values)
 */
export type FilterMultiplier = 2 | 5 | 10;
/**
 * Badge colors based on performance level
 */
export declare const BADGE_COLORS: {
    readonly RED: "#F44336";
    readonly PURPLE: "#9C27B0";
    readonly BLUE: "#2196F3";
    readonly GRAY: "#9E9E9E";
};
/**
 * Loading behavior configuration
 */
export declare const LOADING_CONFIG: {
    readonly MAX_LOADING_TIME_MS: 45000;
    readonly NO_PROGRESS_THRESHOLD: 3;
    readonly PROGRESS_CHECK_INTERVAL_MS: 3000;
    readonly TARGET_VISIBLE_COUNT: 20;
};
/**
 * Timing delays for various operations (in milliseconds)
 */
export declare const TIMINGS: {
    readonly INITIAL_INJECTION_DELAY: 1500;
    readonly URL_CHANGE_DELAY: 1500;
    readonly SCROLL_DEBOUNCE: 300;
    readonly PROCESSING_COOLDOWN: 500;
    readonly FILTER_REAPPLY_DELAY: 50;
    readonly REINIT_DELAY: 500;
    readonly DOM_READY_DELAY: 1000;
};
/**
 * YouTube DOM selectors
 */
export declare const SELECTORS: {
    readonly RICH_ITEM: "ytd-rich-item-renderer";
    readonly GRID_VIDEO: "ytd-grid-video-renderer";
    readonly THUMBNAIL: "ytd-thumbnail";
    readonly THUMBNAIL_LINK: "a#thumbnail";
    readonly VIDEO_TITLE_LINK: "a#video-title-link";
    readonly VIDEO_TITLE: "#video-title";
    readonly VIDEO_TITLE_TEXT: "yt-formatted-string#video-title";
    readonly METADATA_LINE: "#metadata-line";
    readonly INLINE_METADATA: ".inline-metadata-item";
    readonly CONTENT_AREA: "ytd-app";
    readonly BADGE: "[data-ytosc-badge]";
    readonly SCORED_VIDEO: "[data-ytosc-score]";
    readonly MODAL_OVERLAY: ".ytosc-modal-overlay";
};
/**
 * CSS class names for filter UI
 */
export declare const FILTER_CLASSES: {
    readonly CONTAINER: "ytosc-filter-container";
    readonly CHIP: "ytosc-filter-chip";
    readonly CHIP_ACTIVE: "ytosc-filter-chip--active";
    readonly CHIP_BUTTON: "ytosc-filter-chip-button";
    readonly CHIP_CLEAR: "ytosc-filter-chip--clear";
    readonly CHIP_DISABLED: "ytosc-filter-chip--disabled";
};
/**
 * CSS class names for badges
 */
export declare const BADGE_CLASSES: {
    readonly BASE: "ytosc-badge";
    readonly RED: "ytosc-badge--red";
    readonly PURPLE: "ytosc-badge--purple";
    readonly BLUE: "ytosc-badge--blue";
    readonly GRAY: "ytosc-badge--gray";
};
/**
 * Style element ID
 */
export declare const STYLE_ID = "ytosc-styles";
/**
 * Neighbor selection configuration for outlier score calculation
 */
export declare const NEIGHBOR_CONFIG: {
    readonly TARGET_COUNT: 10;
    readonly IDEAL_BEFORE: 5;
    readonly IDEAL_AFTER: 5;
};
