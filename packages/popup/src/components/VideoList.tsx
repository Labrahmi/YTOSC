import type { VideoWithScore } from '@core/types';
import { VideoRow } from './VideoRow';

interface VideoListProps {
  videos: VideoWithScore[];
  maxItems?: number;
}

export function VideoList({ videos, maxItems = 10 }: VideoListProps) {
  const displayVideos = videos.slice(0, maxItems);

  if (videos.length === 0) {
    return (
      <div className="video-list-section">
        <div className="video-list-header">
          <span className="video-list-icon">📈</span>
          <h2>Top Results</h2>
        </div>
        <div className="video-list-empty">
          <p>No videos found matching your filter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-list-section">
      <div className="video-list-header">
        <span className="video-list-icon">📈</span>
        <h2>Top Results</h2>
        <span className="video-count">({videos.length} videos)</span>
      </div>

      <div className="video-list">
        {displayVideos.map((video, index) => (
          <VideoRow key={video.url || index} video={video} rank={index + 1} />
        ))}
      </div>

      {videos.length > maxItems && (
        <div className="video-list-more">
          +{videos.length - maxItems} more videos
        </div>
      )}
    </div>
  );
}

