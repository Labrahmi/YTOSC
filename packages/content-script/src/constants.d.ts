/**
 * Constants used throughout the content script
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
export declare const TIMINGS: {
    readonly INITIAL_INJECTION_DELAY: 1500;
    readonly URL_CHANGE_DELAY: 1500;
    readonly SCROLL_DEBOUNCE: 500;
    readonly PROCESSING_COOLDOWN: 1000;
    readonly FILTER_REAPPLY_DELAY: 100;
};
export declare const SCORE_THRESHOLDS: {
    readonly EXCEPTIONAL: 10;
    readonly EXCELLENT: 5;
    readonly GOOD: 2;
};
export declare const COLORS: {
    readonly RED: "#F44336";
    readonly ORANGE: "#FF9800";
    readonly YELLOW: "#FFEB3B";
    readonly GRAY: "#9E9E9E";
};
export declare const BADGE_CLASSES: {
    readonly BASE: "ytosc-badge";
    readonly RED: "ytosc-badge--red";
    readonly PURPLE: "ytosc-badge--purple";
    readonly BLUE: "ytosc-badge--blue";
    readonly GRAY: "ytosc-badge--gray";
};
export declare const FILTER_SELECTORS: {
    readonly CONTAINER: "#ytosc-filter-container";
    readonly CHIP: ".ytosc-filter-chip";
    readonly CHIP_ACTIVE: ".ytosc-filter-chip--active";
    readonly CHIP_BUTTON: ".ytosc-filter-chip-button";
};
export declare const FILTER_CLASSES: {
    readonly CONTAINER: "ytosc-filter-container";
    readonly CHIP: "ytosc-filter-chip";
    readonly CHIP_ACTIVE: "ytosc-filter-chip--active";
    readonly CHIP_BUTTON: "ytosc-filter-chip-button";
    readonly CHIP_CLEAR: "ytosc-filter-chip--clear";
};
export declare const STYLE_ID = "ytosc-styles";
