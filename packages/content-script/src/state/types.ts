/**
 * State types for the content script
 */

export type VideoId = string;

export interface VideoRecord {
  videoId: VideoId;
  url: string;
  title: string;
  publishedTimeText?: string;
  views: number | null;           // null when unknown/unparseable
  score: number | null;            // null until computed
  indexInChannel: number;          // 0 = newest; maintained by DOM order
  status: 'new' | 'parsed' | 'scored' | 'injected';
  flags?: {
    memberOnly?: boolean;
    live?: boolean;
    scheduled?: boolean;
  };
  dom: {
    card: HTMLElement;             // ytd-rich-item-renderer | equivalent
    titleEl: HTMLElement;          // anchor or title container
    badgeEl?: HTMLElement;         // injected badge, if any
    placeholder?: Comment;         // for reparenting mode only
  };
}

export interface FilterState {
  active: boolean;
  threshold?: 2 | 5 | 10;
  targetVisibleCount: number;      // Target number of visible videos (20)
  currentVisibleCount: number;     // Current count of visible videos
  isLoadingPaused: boolean;        // Whether we've paused loading
}

export interface UIState {
  mode: 'normal' | 'filtered' | 'sorted';
  sortDirection?: 'ascending' | 'descending';  // Sort direction for sorted mode
}

export interface StoreState {
  list: VideoRecord[];                     // ordered newest→oldest (indexInChannel)
  byId: Map<VideoId, VideoRecord>;
  filter: FilterState;
  ui: UIState;
}

export type StoreListener = (state: StoreState) => void;

