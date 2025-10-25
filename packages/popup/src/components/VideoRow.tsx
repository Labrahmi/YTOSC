import type { VideoWithScore } from '@core/types';
import { Icon } from './Icon';
import { getScoreClass } from '../utils/formatters';

interface VideoRowProps {
  video: VideoWithScore;
}

export function VideoRow({ video }: VideoRowProps) {
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

