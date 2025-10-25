/**
 * Content Script for YouTube Outlier Score Calculator
 * 
 * This script runs on YouTube channel pages and is responsible for:
 * - Scraping video data from the DOM
 * - Injecting outlier scores into the page
 * - Handling filter UI interactions
 */

import { parseViewCount, calculateChannelOutlierScores } from '@core/index';
import type { VideoData, VideoWithScore, FilterMessage } from '@core/types';

console.log('🎬 YouTube Outlier Score Calculator v1.0.0 loaded');

// Global state
let currentVideos: VideoWithScore[] = [];
let activeFilter: number | null = null;

/**
 * Check if we're on a YouTube channel's Videos tab
 */
function isOnChannelVideosPage(): boolean {
  const url = window.location.href;
  return url.includes('youtube.com/@') || url.includes('youtube.com/c/') || url.includes('youtube.com/channel/');
}

/**
 * Extract video data from YouTube channel page
 * Supports both old (ytd-grid-video-renderer) and new (ytd-rich-item-renderer) layouts
 */
function extractVideoData(): VideoData[] {
  const videos: VideoData[] = [];
  let skippedCount = 0;
  let parseErrors = 0;
  
  // Try newer layout first (ytd-rich-item-renderer)
  let videoElements = document.querySelectorAll('ytd-rich-item-renderer');
  let isRichLayout = videoElements.length > 0;
  
  // Fallback to older layout if needed
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-grid-video-renderer');
  }
  
  if (videoElements.length === 0) {
    console.warn('⚠️ No video elements found on page');
    return videos;
  }
  
  videoElements.forEach((element, index) => {
    try {
      let titleElement: HTMLAnchorElement | null = null;
      let viewElement: Element | null = null;
      
      if (isRichLayout) {
        // New layout selectors (ytd-rich-item-renderer)
        titleElement = element.querySelector('a#video-title-link') as HTMLAnchorElement;
        if (!titleElement) {
          titleElement = element.querySelector('#video-title') as HTMLAnchorElement;
        }
        
        // View count is in the first inline-metadata-item
        viewElement = element.querySelector('.inline-metadata-item:nth-child(1)');
        if (!viewElement) {
          const metadataItems = element.querySelectorAll('.inline-metadata-item');
          viewElement = metadataItems[0];
        }
      } else {
        // Old layout selectors (ytd-grid-video-renderer)
        titleElement = element.querySelector('#video-title') as HTMLAnchorElement;
        const metadataLine = element.querySelector('#metadata-line');
        if (metadataLine) {
          viewElement = metadataLine.querySelector('span');
        }
      }
      
      if (!titleElement || !viewElement) {
        skippedCount++;
        return;
      }
      
      // Extract data
      let title = titleElement.textContent?.trim() || '';
      
      // For rich layout, title might be in a child element
      if (!title && isRichLayout) {
        const titleText = element.querySelector('yt-formatted-string#video-title');
        title = titleText?.textContent?.trim() || '';
      }
      
      const viewText = viewElement.textContent?.trim() || '';
      const url = titleElement.href || '';
      
      // Parse view count (will return null for member-only, scheduled, etc.)
      const viewCount = parseViewCount(viewText);
      
      videos.push({
        title,
        viewCount,
        url,
      });
    } catch (error) {
      console.error(`Error extracting video ${index + 1}:`, error);
      parseErrors++;
    }
  });
  
  // Summary log
  console.log(`📊 Extracted ${videos.length} videos (${isRichLayout ? 'Rich' : 'Grid'} layout)` +
    (skippedCount > 0 ? `, skipped: ${skippedCount}` : '') +
    (parseErrors > 0 ? `, errors: ${parseErrors}` : ''));
  
  return videos;
}

/**
 * Create a badge element for the outlier score
 */
function createBadgeElement(score: number): HTMLElement {
  const badge = document.createElement('div');
  badge.className = 'ytosc-badge';
  badge.setAttribute('data-ytosc-badge', 'true');
  
  // Determine variant based on score
  let variant = 'default';
  if (score >= 10) {
    variant = 'gold';
  } else if (score >= 5) {
    variant = 'silver';
  } else if (score >= 2) {
    variant = 'bronze';
  }
  
  badge.classList.add(`ytosc-badge--${variant}`);
  badge.textContent = `${score.toFixed(1)}x`;
  badge.title = `Outlier Score: ${score.toFixed(2)}x the median`;
  
  return badge;
}

/**
 * Inject CSS styles into the page
 */
function injectStyles() {
  // Check if styles already injected
  if (document.getElementById('ytosc-styles')) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'ytosc-styles';
  style.textContent = `
    /* Position badge container on thumbnail */
    ytd-thumbnail, ytd-video-thumbnail {
      position: relative;
    }
    
    /* Dark gradient overlay at bottom of thumbnail for better contrast */
    ytd-thumbnail::after, ytd-video-thumbnail::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to top, 
        rgba(0, 0, 0, 0.8) 0%, 
        rgba(0, 0, 0, 0.4) 40%,
        transparent 100%);
      pointer-events: none;
      z-index: 50;
    }
    
    .ytosc-badge {
      position: absolute;
      bottom: 8px;
      left: 8px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
      white-space: nowrap;
      letter-spacing: 0.5px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 
                  0 2px 4px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: default;
    }
    
    .ytosc-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5), 
                  0 3px 6px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    
    .ytosc-badge--gold {
      background: #F44336;
      color: #FFFFFF;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      border: 2px solid #EF5350;
    }
    
    .ytosc-badge--silver {
      background: #FF9800;
      color: #000000;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
      border: 2px solid #FFB74D;
    }
    
    .ytosc-badge--bronze {
      background: #FFEB3B;
      color: #000000;
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.3);
      border: 2px solid #FFF176;
    }
    
    .ytosc-badge--default {
      background: #9E9E9E;
      color: #FFFFFF;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      border: 2px solid #BDBDBD;
    }
    
    /* Hide filtered videos - support both layouts */
    ytd-grid-video-renderer[data-ytosc-hidden="true"],
    ytd-rich-item-renderer[data-ytosc-hidden="true"] {
      display: none !important;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Inject outlier scores into the page
 */
function injectOutlierScores() {
  if (!isOnChannelVideosPage()) {
    return;
  }
  
  // Inject styles first
  injectStyles();
  
  const videos = extractVideoData();
  
  if (videos.length === 0) {
    console.log('⚠️ No videos found on page');
    return;
  }
  
  // Calculate scores
  currentVideos = calculateChannelOutlierScores(videos);
  
  // Get score statistics
  const videosWithScores = currentVideos.filter(v => v.outlierScore !== null);
  const scores = videosWithScores.map(v => v.outlierScore!);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const highScores = videosWithScores.filter(v => v.outlierScore! >= 2).length;
  
  // Inject badges into the DOM
  let videoElements = document.querySelectorAll('ytd-rich-item-renderer');
  const isRichLayout = videoElements.length > 0;
  
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-grid-video-renderer');
  }
  
  let badgesInjected = 0;
  
  videoElements.forEach((element, index) => {
    const video = currentVideos[index];
    if (!video || video.outlierScore === null) {
      return;
    }
    
    // Find thumbnail container based on layout
    let thumbnailContainer: Element | null = null;
    
    if (isRichLayout) {
      // Rich layout: find ytd-thumbnail element
      thumbnailContainer = element.querySelector('ytd-thumbnail');
      
      // Alternative: look for the thumbnail link
      if (!thumbnailContainer) {
        thumbnailContainer = element.querySelector('a#thumbnail');
      }
    } else {
      // Grid layout: find ytd-thumbnail element
      thumbnailContainer = element.querySelector('ytd-thumbnail');
    }
    
    if (!thumbnailContainer) {
      return;
    }
    
    // Remove existing badge if present
    const existingBadge = thumbnailContainer.querySelector('[data-ytosc-badge]');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Create and inject new badge
    const badge = createBadgeElement(video.outlierScore);
    thumbnailContainer.appendChild(badge);
    badgesInjected++;
    
    // Store score as data attribute for filtering
    (element as HTMLElement).setAttribute('data-ytosc-score', video.outlierScore.toString());
    (element as HTMLElement).setAttribute('data-ytosc-url', video.url);
  });
  
  // Summary log with insights
  console.log(
    `✅ YTOSC: ${badgesInjected} badges injected | ` +
    `Avg: ${avgScore.toFixed(1)}x | Max: ${maxScore.toFixed(1)}x | ` +
    `≥2x: ${highScores} videos` +
    (activeFilter ? ` | Filter: >${activeFilter}x` : '')
  );
  
  // Apply current filter if active
  if (activeFilter !== null) {
    applyFilter(activeFilter);
  }
}

/**
 * Apply filter to hide videos below threshold
 */
function applyFilter(threshold: number) {
  activeFilter = threshold;
  
  // Support both rich and grid layouts
  let videoElements = document.querySelectorAll('ytd-rich-item-renderer');
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-grid-video-renderer');
  }
  
  const videosToSort: Array<{ element: HTMLElement; score: number }> = [];
  
  videoElements.forEach((element) => {
    const scoreStr = (element as HTMLElement).getAttribute('data-ytosc-score');
    const score = scoreStr ? parseFloat(scoreStr) : null;
    
    if (score === null || score < threshold) {
      (element as HTMLElement).setAttribute('data-ytosc-hidden', 'true');
    } else {
      (element as HTMLElement).removeAttribute('data-ytosc-hidden');
      videosToSort.push({ element: element as HTMLElement, score });
    }
  });
  
  // Sort visible videos by score (descending)
  sortVideos(videosToSort);
  
  console.log(`🔍 Filter: >${threshold}x (${videosToSort.length} videos shown)`);
}

/**
 * Sort videos by outlier score (descending)
 */
function sortVideos(videosToSort: Array<{ element: HTMLElement; score: number }>) {
  if (videosToSort.length === 0) {
    return;
  }
  
  // Sort by score descending
  videosToSort.sort((a, b) => b.score - a.score);
  
  // Get the parent container
  const container = videosToSort[0].element.parentElement;
  if (!container) {
    return;
  }
  
  // Re-insert elements in sorted order
  videosToSort.forEach((video) => {
    container.appendChild(video.element);
  });
}

/**
 * Reset filter to show all videos
 */
function resetFilter() {
  activeFilter = null;
  
  // Support both rich and grid layouts
  let videoElements = document.querySelectorAll('ytd-rich-item-renderer');
  if (videoElements.length === 0) {
    videoElements = document.querySelectorAll('ytd-grid-video-renderer');
  }
  
  videoElements.forEach((element) => {
    (element as HTMLElement).removeAttribute('data-ytosc-hidden');
  });
  
  console.log('🔄 Filter reset (all videos shown)');
}

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((message: FilterMessage, _sender, sendResponse) => {
  if (message.type === 'SET_FILTER' && message.threshold) {
    applyFilter(message.threshold);
    sendResponse({ success: true });
  } else if (message.type === 'RESET_FILTER') {
    resetFilter();
    sendResponse({ success: true });
  } else if (message.type === 'GET_STATS') {
    const videosWithScores = currentVideos.filter((v) => v.outlierScore !== null);
    sendResponse({
      type: 'STATS',
      totalVideos: currentVideos.length,
      videosWithScores: videosWithScores.length,
      medianViews: videosWithScores.length > 0 ? 
        videosWithScores.reduce((sum, v) => sum + (v.viewCount || 0), 0) / videosWithScores.length : 0,
    });
  }
  
  return true; // Keep channel open for async response
});

/**
 * Initialize the content script
 */
function init() {
  // Initial injection
  setTimeout(() => {
    injectOutlierScores();
  }, 1500); // Give YouTube time to load
  
  // Re-run when navigating within YouTube (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectOutlierScores, 1500);
    }
  }).observe(document.body, { subtree: true, childList: true });
  
  // Also watch for DOM changes to re-inject on infinite scroll
  let debounceTimer: number;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      // Check both rich and grid layouts
      let currentCount = document.querySelectorAll('ytd-rich-item-renderer').length;
      if (currentCount === 0) {
        currentCount = document.querySelectorAll('ytd-grid-video-renderer').length;
      }
      
      const injectedCount = document.querySelectorAll('[data-ytosc-score]').length;
      
      // If we have more videos than injected badges, re-inject
      if (currentCount > injectedCount) {
        injectOutlierScores();
      }
    }, 500);
  });
  
  // Observe the main content area for changes
  const contentArea = document.querySelector('ytd-app');
  if (contentArea) {
    observer.observe(contentArea, { childList: true, subtree: true });
  }
}

init();
