import type { VideoWithScore } from '@core/types';
import { Section } from './ui/Section';
import { IconButton } from './ui/IconButton';
import { calculateStats } from '../utils/formatters';
import { createExportData, downloadJSON } from '../utils/export';

interface FilteredStatsProps {
  videos: VideoWithScore[];
}

export function FilteredStats({ videos }: FilteredStatsProps) {
  const { count, avgScore, topScore } = calculateStats(videos);

  const handleDownload = () => {
    const exportData = createExportData(videos);
    downloadJSON(exportData);
  };

  if (count === 0) return null;

  return (
    <Section 
      icon="trending" 
      title="Filtered Results"
      action={
        <IconButton
          icon="download"
          onClick={handleDownload}
          title="Download filtered results as JSON"
          ariaLabel="Download data"
        />
      }
    >
        <div className="filtered-stats">
          <div className="filtered-stat">
            <div className="filtered-stat-value">{count}</div>
            <div className="filtered-stat-label">Videos</div>
          </div>
          <div className="filtered-stat-divider" />
          <div className="filtered-stat">
            <div className="filtered-stat-value">{avgScore.toFixed(1)}×</div>
            <div className="filtered-stat-label">Avg Score</div>
          </div>
          <div className="filtered-stat-divider" />
          <div className="filtered-stat">
            <div className="filtered-stat-value highlight">{topScore.toFixed(1)}×</div>
            <div className="filtered-stat-label">Top Score</div>
          </div>
        </div>
    </Section>
  );
}

