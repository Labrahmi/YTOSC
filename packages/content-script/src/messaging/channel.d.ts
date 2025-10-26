/**
 * Message channel for popup ↔ content script communication
 */
import type { FilterState, UIState } from '../state/types';
export type MsgApplyFilter = {
    type: 'APPLY_FILTER';
    threshold: 2 | 5 | 10;
};
export type MsgReset = {
    type: 'RESET';
};
export type MsgRequestState = {
    type: 'REQUEST_STATE';
};
export type MsgGetChannelData = {
    type: 'GET_CHANNEL_DATA';
};
export type IncomingMsg = MsgApplyFilter | MsgReset | MsgRequestState | MsgGetChannelData;
export type MsgState = {
    type: 'STATE';
    payload: {
        filter: FilterState;
        ui: UIState;
        videos: Array<{
            id: string;
            url: string;
            title: string;
            views: number | null;
            score: number | null;
        }>;
        medianScore: number;
    };
};
export type MsgChannelData = {
    videos: Array<{
        title: string;
        url: string;
        viewCount: number | null;
        outlierScore: number | null;
    }>;
    medianViews: number;
    error: string | null;
};
export type OutgoingMsg = MsgState | MsgChannelData;
/**
 * Initialize message listener
 */
export declare function initMessageChannel(): void;
