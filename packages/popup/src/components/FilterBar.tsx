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

export function FilterBar({ activeFilter, onFilterChange, onReset, counts }: FilterBarProps) {
  return (
    <div className="filter-section">
      <div className="filter-header">
        <span className="filter-icon">🎯</span>
        <h2>Filter Videos</h2>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn filter-good ${activeFilter === 2 ? 'active' : ''}`}
          onClick={() => onFilterChange(2)}
          title={`${counts.good} videos with score ≥2×`}
        >
          <span className="filter-threshold">≥2×</span>
          <span className="filter-label">Good</span>
        </button>

        <button
          className={`filter-btn filter-excellent ${activeFilter === 5 ? 'active' : ''}`}
          onClick={() => onFilterChange(5)}
          title={`${counts.excellent} videos with score ≥5×`}
        >
          <span className="filter-threshold">≥5×</span>
          <span className="filter-label">Excellent</span>
        </button>

        <button
          className={`filter-btn filter-exceptional ${activeFilter === 10 ? 'active' : ''}`}
          onClick={() => onFilterChange(10)}
          title={`${counts.exceptional} videos with score ≥10×`}
        >
          <span className="filter-threshold">≥10×</span>
          <span className="filter-label">Exceptional</span>
        </button>

        <button
          className={`filter-btn filter-reset ${activeFilter === null ? 'active' : ''}`}
          onClick={onReset}
        >
          <span className="filter-label">Reset</span>
        </button>
      </div>
    </div>
  );
}

