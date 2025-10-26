/**
 * Message channel for popup ↔ content script communication
 */

import { store } from '../state/store';
import { filterController } from '../features/filterController';
import type { FilterState, UIState } from '../state/types';
import { logger } from '../utils/logger';

// Message types
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
export function initMessageChannel(): void {
  chrome.runtime.onMessage.addListener((message: IncomingMsg, _sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true; // Keep channel open for async response
  });

  logger.success('Message channel initialized');
}

/**
 * Handle incoming messages
 */
function handleMessage(message: IncomingMsg, sendResponse: (response: any) => void): void {
  try {
    switch (message.type) {
      case 'APPLY_FILTER':
        handleApplyFilter(message, sendResponse);
        break;

      case 'RESET':
        handleReset(sendResponse);
        break;

      case 'REQUEST_STATE':
        handleRequestState(sendResponse);
        break;

      case 'GET_CHANNEL_DATA':
        handleGetChannelData(sendResponse);
        break;

      default:
        logger.warn('Unknown message type:', (message as any).type);
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    logger.error('Error handling message:', error);
    sendResponse({ error: String(error) });
  }
}

/**
 * Handle APPLY_FILTER message
 */
function handleApplyFilter(message: MsgApplyFilter, sendResponse: (response: any) => void): void {
  filterController.applyFilter(message.threshold);
  sendResponse({ success: true });
}

/**
 * Handle RESET message
 */
function handleReset(sendResponse: (response: any) => void): void {
  filterController.reset();
  sendResponse({ success: true });
}

/**
 * Handle REQUEST_STATE message
 */
function handleRequestState(sendResponse: (response: MsgState) => void): void {
  const state = store.getState();
  const medianScore = store.getMedianScore();

  const response: MsgState = {
    type: 'STATE',
    payload: {
      filter: state.filter,
      ui: state.ui,
      videos: state.list.map(r => ({
        id: r.videoId,
        url: r.url,
        title: r.title,
        views: r.views,
        score: r.score,
      })),
      medianScore,
    },
  };

  sendResponse(response);
}

/**
 * Handle GET_CHANNEL_DATA message (legacy support for existing popup)
 */
function handleGetChannelData(sendResponse: (response: MsgChannelData) => void): void {
  const state = store.getState();
  
  if (state.list.length === 0) {
    sendResponse({
      videos: [],
      medianViews: 0,
      error: 'No videos found. Please wait for the page to load.',
    });
    return;
  }

  // Calculate median views
  const validViews = state.list
    .map(r => r.views)
    .filter((v): v is number => v !== null && v > 0);
  
  let medianViews = 0;
  if (validViews.length > 0) {
    const sorted = [...validViews].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    medianViews = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  sendResponse({
    videos: state.list.map(r => ({
      title: r.title,
      url: r.url,
      viewCount: r.views,
      outlierScore: r.score,
    })),
    medianViews,
    error: null,
  });
}

