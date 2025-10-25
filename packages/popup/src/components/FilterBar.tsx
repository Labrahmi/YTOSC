import type { FilterLevel } from '../hooks/useFilters';
import { Section } from './ui/Section';

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

export function FilterBar({ activeFilter, onFilterChange, onReset, counts }: FilterBarProps) {
  return (
    <Section icon="filter" title="Filter Videos">
        <div className="filter-buttons">
          <button
            className={`filter-btn filter-good ${activeFilter === 2 ? 'active' : ''}`}
            onClick={() => onFilterChange(2)}
            title={`Good: ${counts.good} videos with score ≥2×`}
          >
            ≥2×
          </button>

          <button
            className={`filter-btn filter-excellent ${activeFilter === 5 ? 'active' : ''}`}
            onClick={() => onFilterChange(5)}
            title={`Excellent: ${counts.excellent} videos with score ≥5×`}
          >
            ≥5×
          </button>

          <button
            className={`filter-btn filter-exceptional ${activeFilter === 10 ? 'active' : ''}`}
            onClick={() => onFilterChange(10)}
            title={`Exceptional: ${counts.exceptional} videos with score ≥10×`}
          >
            ≥10×
          </button>

          <button
            className={`filter-btn filter-reset ${activeFilter === null ? 'active' : ''}`}
            onClick={onReset}
            title="Show all videos"
          >
          All
        </button>
      </div>
    </Section>
  );
}

