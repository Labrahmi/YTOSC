import type { VideoWithScore } from '@core/types';

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

  const truncateTitle = (title: string, maxLength: number = 40): string => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  const score = video.outlierScore;
  const scoreClass = score ? getScoreClass(score) : '';

  return (
    <div className="video-row" onClick={handleClick} title={video.title}>
      <div className="video-rank">{rank}</div>
      <div className={`video-score ${scoreClass}`}>
        {score !== null && score !== undefined ? `${score.toFixed(1)}×` : 'N/A'}
      </div>
      <span className="video-divider">|</span>
      <div className="video-title">{truncateTitle(video.title)}</div>
    </div>
  );
}

