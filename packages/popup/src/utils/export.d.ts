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
export declare function createExportData(videos: VideoWithScore[]): ExportData;
export declare function downloadJSON(data: ExportData, filename?: string): void;
export {};
