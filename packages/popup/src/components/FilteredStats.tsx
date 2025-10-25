import type { VideoWithScore } from '@core/types';
import { Icon } from './Icon';

interface FilteredStatsProps {
  videos: VideoWithScore[];
}

export function FilteredStats({ videos }: FilteredStatsProps) {
  const count = videos.length;
  const avgScore = count > 0 
    ? videos.reduce((sum, v) => sum + (v.outlierScore || 0), 0) / count 
    : 0;
  const topScore = count > 0 
    ? Math.max(...videos.map(v => v.outlierScore || 0)) 
    : 0;

  const handleDownload = () => {
    // Create comprehensive export data
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalVideos: count,
        averageScore: parseFloat(avgScore.toFixed(2)),
        topScore: parseFloat(topScore.toFixed(2)),
      },
      videos: videos.map((video, index) => ({
        rank: index + 1,
        title: video.title,
        url: video.url,
        views: video.views,
        outlierScore: video.outlierScore ? parseFloat(video.outlierScore.toFixed(2)) : null,
        performance: video.outlierScore 
          ? video.outlierScore >= 10 ? 'exceptional' 
          : video.outlierScore >= 5 ? 'excellent'
          : video.outlierScore >= 2 ? 'good'
          : 'normal'
          : 'unknown',
      })),
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-outliers-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (count === 0) return null;

  return (
    <section className="section">
      <div className="section-header section-header-static">
        <Icon name="trending" className="section-icon" />
        <h2 className="section-title">Filtered Results</h2>
        <button 
          className="download-btn"
          onClick={handleDownload}
          title="Download filtered results as JSON"
          aria-label="Download data"
        >
          <Icon name="download" className="download-icon" />
        </button>
      </div>

      <div className="section-content expanded">
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
      </div>
    </section>
  );
}

