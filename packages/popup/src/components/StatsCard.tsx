import { useCountUp } from '../hooks/useAnimations';

interface StatsCardProps {
  totalVideos: number;
  medianViews: number;
  topScore: number;
  avgScore: number;
  goodCount: number;
  excellentCount: number;
  exceptionalCount: number;
}

export function StatsCard({
  totalVideos,
  medianViews,
  topScore,
  avgScore,
  goodCount,
  excellentCount,
  exceptionalCount,
}: StatsCardProps) {
  const animatedTotal = useCountUp(totalVideos, 600);
  const animatedMedian = useCountUp(medianViews, 700);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <span className="stats-card-icon">🔹</span>
        <h2>Live Channel Snapshot</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Videos analyzed</div>
          <div className="stat-value">{animatedTotal}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Median views</div>
          <div className="stat-value">{formatNumber(animatedMedian)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Top outlier</div>
          <div className="stat-value stat-highlight">{topScore.toFixed(1)}×</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">Avg score</div>
          <div className="stat-value">{avgScore.toFixed(1)}×</div>
        </div>
      </div>

      <div className="stats-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label exceptional">Exceptional</span>
          <span className="breakdown-count">{exceptionalCount}</span>
        </div>
        <div className="breakdown-divider">|</div>
        <div className="breakdown-item">
          <span className="breakdown-label excellent">Excellent</span>
          <span className="breakdown-count">{excellentCount}</span>
        </div>
        <div className="breakdown-divider">|</div>
        <div className="breakdown-item">
          <span className="breakdown-label good">Good</span>
          <span className="breakdown-count">{goodCount}</span>
        </div>
      </div>
    </div>
  );
}

