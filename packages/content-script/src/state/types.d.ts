/**
 * State types for the content script
 */
export type VideoId = string;
export interface VideoRecord {
    videoId: VideoId;
    url: string;
    title: string;
    publishedTimeText?: string;
    views: number | null;
    score: number | null;
    indexInChannel: number;
    status: 'new' | 'parsed' | 'scored' | 'injected';
    flags?: {
        memberOnly?: boolean;
        live?: boolean;
        scheduled?: boolean;
    };
    dom: {
        card: HTMLElement;
        titleEl: HTMLElement;
        badgeEl?: HTMLElement;
        placeholder?: Comment;
    };
}
export interface FilterState {
    active: boolean;
    threshold?: 2 | 5 | 10;
    targetVisibleCount: number;
    currentVisibleCount: number;
    isLoadingPaused: boolean;
}
export interface UIState {
    mode: 'normal' | 'filtered' | 'sorted';
    sortDirection?: 'ascending' | 'descending';
}
export interface StoreState {
    list: VideoRecord[];
    byId: Map<VideoId, VideoRecord>;
    filter: FilterState;
    ui: UIState;
}
export type StoreListener = (state: StoreState) => void;
