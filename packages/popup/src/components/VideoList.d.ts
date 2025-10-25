import type { VideoWithScore } from '@core/types';
interface VideoListProps {
    videos: VideoWithScore[];
    maxItems?: number;
}
export declare function VideoList({ videos, maxItems }: VideoListProps): import("react/jsx-runtime").JSX.Element;
export {};
