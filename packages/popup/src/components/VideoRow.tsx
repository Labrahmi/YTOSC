import type { VideoWithScore } from '@core/types';
import { Icon } from './Icon';

interface VideoRowProps {
  video: VideoWithScore;
  rank: number;
}

export function VideoRow({ video, rank }: VideoRowProps) {
  const getScoreClass = (score: number | null): string => {
    if (score === null || score === undefined) return '';
    if (score >= 10) return 'exceptional';
    if (score >= 5) return 'excellent';
    if (score >= 2) return 'good';
    return '';
  };

  const handleClick = () => {
    if (video.url) {
      chrome.tabs.create({ url: video.url });
    }
  };

  const score = video.outlierScore;
  const scoreClass = score ? getScoreClass(score) : '';

  return (
    <div className="video-row" onClick={handleClick} title={video.title}>
      <Icon name="youtube" className="video-icon" />
      <div className="video-info">
        <div className="video-title">{video.title}</div>
      </div>
      {score !== null && score !== undefined && (
        <div className={`video-score ${scoreClass}`}>
          {score.toFixed(1)}×
        </div>
      )}
    </div>
  );
}

