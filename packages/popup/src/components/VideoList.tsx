import type { VideoWithScore } from '@core/types';
import { VideoRow } from './VideoRow';

interface VideoListProps {
  videos: VideoWithScore[];
  maxItems?: number;
}

export function VideoList({ videos, maxItems = 20 }: VideoListProps) {
  const displayVideos = videos.slice(0, maxItems);

  if (videos.length === 0) {
    return (
      <div className="video-list-empty">
        <p>No videos found matching your filter.</p>
      </div>
    );
  }

  return (
    <div className="video-list-container">
      <div className="video-list">
        {displayVideos.map((video, index) => (
          <VideoRow key={video.url || index} video={video} />
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

