import type { VideoWithScore } from '@core/types';

interface ExportData {
  exportDate: string;
  summary: {
    totalVideos: number;
    averageScore: number;
    topScore: number;
  };
  videos: Array<{
    rank: number;
    title: string;
    url: string;
    viewCount: number | null;
    outlierScore: number | null;
    performance: string;
  }>;
}

export function createExportData(videos: VideoWithScore[]): ExportData {
  const count = videos.length;
  const avgScore = count > 0 
    ? videos.reduce((sum, v) => sum + (v.outlierScore || 0), 0) / count 
    : 0;
  const topScore = count > 0 
    ? Math.max(...videos.map(v => v.outlierScore || 0)) 
    : 0;

  return {
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
      viewCount: video.viewCount,
      outlierScore: video.outlierScore ? parseFloat(video.outlierScore.toFixed(2)) : null,
      performance: getPerformanceLevel(video.outlierScore),
    })),
  };
}

export function downloadJSON(data: ExportData, filename?: string) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `youtube-outliers-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function getPerformanceLevel(score: number | null): string {
  if (!score) return 'unknown';
  if (score >= 10) return 'exceptional';
  if (score >= 5) return 'excellent';
  if (score >= 2) return 'good';
  return 'normal';
}

