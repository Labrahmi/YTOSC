import type { FilterLevel } from '../hooks/useFilters';
interface FilterBarProps {
    activeFilter: FilterLevel;
    onFilterChange: (level: FilterLevel) => void;
    onReset: () => void;
    counts: {
        good: number;
        excellent: number;
        exceptional: number;
    };
}
export declare function FilterBar({ activeFilter, onFilterChange, onReset, counts }: FilterBarProps): import("react/jsx-runtime").JSX.Element;
export {};
