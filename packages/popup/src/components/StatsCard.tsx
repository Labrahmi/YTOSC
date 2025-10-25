import { useCountUp } from '../hooks/useAnimations';
import { Section } from './ui/Section';
import { formatNumber } from '../utils/formatters';

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

  return (
    <Section icon="chart" title="Channel Overview">
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
    </Section>
  );
}

