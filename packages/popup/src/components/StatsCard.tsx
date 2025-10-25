import { useCountUp } from '../hooks/useAnimations';
import { Icon } from './Icon';

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
    <section className="section">
      <div className="section-header" style={{ cursor: 'default' }}>
        <Icon name="chart" className="section-icon" />
        <h2 className="section-title">Channel Overview</h2>
      </div>

      <div className="section-content expanded">

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Videos</div>
          <div className="stat-value">{animatedTotal}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Median Views</div>
          <div className="stat-value">{formatNumber(animatedMedian)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Top Outlier</div>
          <div className="stat-value stat-highlight">{topScore.toFixed(1)}×</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Avg Score</div>
          <div className="stat-value">{avgScore.toFixed(1)}×</div>
        </div>
      </div>

      <div className="stats-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-count exceptional">{exceptionalCount}</span>
          <span className="breakdown-label">Exceptional</span>
        </div>
        <span className="pipe-divider">|</span>
        <div className="breakdown-item">
          <span className="breakdown-count excellent">{excellentCount}</span>
          <span className="breakdown-label">Excellent</span>
        </div>
        <span className="pipe-divider">|</span>
        <div className="breakdown-item">
          <span className="breakdown-count good">{goodCount}</span>
          <span className="breakdown-label">Good</span>
        </div>
      </div>

      </div>
    </section>
  );
}

