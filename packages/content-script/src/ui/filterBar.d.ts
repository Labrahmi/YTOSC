/**
 * In-page filter bar (chips for 2x, 5x, 10x, Reset)
 */
export type FilterCallback = (threshold: 2 | 5 | 10 | 'ascending' | 'descending' | null) => void;
/**
 * Inject filter bar into the page
 */
export declare function injectFilterBar(onFilterChange: FilterCallback): void;
/**
 * Set active filter chip
 */
export declare function setActiveChip(filterId: string | null): void;
/**
 * Enable or disable filter chips
 */
export declare function setChipsEnabled(enabled: boolean): void;
/**
 * Remove filter bar from page
 */
export declare function removeFilterBar(): void;
