/**
 * Filter chips component for sorting and filtering videos
 */
export interface FilterChip {
    label: string;
    id: string;
    isClear?: boolean;
}
/**
 * Create the filter chips container
 */
export declare function createFilterContainer(): HTMLElement;
/**
 * Update active filter chip
 */
export declare function setActiveFilterChip(filterId: string | null): void;
