import type { VideoWithScore } from '@core/types';
import { VideoRow } from './VideoRow';
import { Icon } from './Icon';

interface VideoListProps {
  videos: VideoWithScore[];
  maxItems?: number;
}

export function VideoList({ videos, maxItems = 10 }: VideoListProps) {
  const displayVideos = videos.slice(0, maxItems);

  if (videos.length === 0) {
    return (
      <section className="section">
        <div className="section-header">
          <Icon name="trending" className="section-icon" />
          <h2 className="section-title">Top Outliers</h2>
        </div>
        <div className="video-list-empty">
          <p>No videos found matching your filter.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-header">
        <Icon name="trending" className="section-icon" />
        <h2 className="section-title">Top Outliers</h2>
        <span className="section-count">{videos.length}</span>
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
    </section>
  );
}

