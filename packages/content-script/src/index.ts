/**
 * Content Script for YouTube Outlier Score Calculator
 * 
 * This script runs on YouTube channel pages and is responsible for:
 * - Scraping video data from the DOM
 * - Calculating outlier scores
 * - Injecting score badges into thumbnails
 * - Displaying analytics modal on click
 */

import { parseViewCount, calculateChannelOutlierScores, getMedianViewCount } from '@core/index';
import type { VideoData, VideoWithScore } from '@core/types';

console.log('🎬 YouTube Outlier Score Calculator v1.0.0 loaded');

// Global state
let currentVideos: VideoWithScore[] = [];
let scrollObserver: MutationObserver | null = null;
let lastProcessedCount = 0;
let isProcessing = false;

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
function createBadgeElement(score: number, videoData: VideoWithScore): HTMLElement {
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
  badge.title = 'Click for detailed analysis';
  
  // Add click handler to show modal
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showAnalyticsModal(videoData);
  });
  
  // Make it clear it's clickable
  badge.style.cursor = 'pointer';
  
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
    
    /* Modal Overlay */
    .ytosc-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: ytosc-fadeIn 0.2s ease;
    }
    
    @keyframes ytosc-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes ytosc-slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Modal Container */
    .ytosc-modal {
      background: #ffffff;
      border-radius: 16px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: ytosc-slideUp 0.3s ease;
      position: relative;
    }
    
    /* Modal Header */
    .ytosc-modal-header {
      position: relative;
      padding: 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .ytosc-modal-thumbnail {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
      border-radius: 16px 16px 0 0;
      background: #000;
    }
    
    .ytosc-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 10;
    }
    
    .ytosc-modal-close:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }
    
    /* Modal Body */
    .ytosc-modal-body {
      padding: 24px;
    }
    
    .ytosc-modal-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      line-height: 1.4;
    }
    
    /* Score Display */
    .ytosc-modal-score {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border-radius: 12px;
      margin-bottom: 24px;
    }
    
    .ytosc-modal-score-badge {
      font-size: 32px;
      font-weight: 800;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .ytosc-modal-score-info {
      flex: 1;
    }
    
    .ytosc-modal-score-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .ytosc-modal-score-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    
    /* Stats Grid */
    .ytosc-modal-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .ytosc-modal-stat {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .ytosc-modal-stat-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 6px;
      display: block;
    }
    
    .ytosc-modal-stat-value {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      display: block;
    }
    
    /* Analysis Section */
    .ytosc-modal-analysis {
      padding: 20px;
      background: #eff6ff;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    
    .ytosc-modal-analysis-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      margin: 0 0 12px 0;
    }
    
    .ytosc-modal-analysis-text {
      font-size: 14px;
      color: #1e40af;
      line-height: 1.6;
      margin: 0;
    }
    
    /* Performance Bar */
    .ytosc-performance-bar {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    
    .ytosc-performance-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .ytosc-performance-track {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .ytosc-performance-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
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
    
    // ALWAYS remove existing badge (scores may have changed with new videos)
    const existingBadge = thumbnailContainer.querySelector('[data-ytosc-badge]');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Create and inject new badge with updated score
    const badge = createBadgeElement(video.outlierScore, video);
    thumbnailContainer.appendChild(badge);
    badgesInjected++;
    
    // Update score data attribute (may have changed)
    (element as HTMLElement).setAttribute('data-ytosc-score', video.outlierScore.toString());
    (element as HTMLElement).setAttribute('data-ytosc-url', video.url);
  });
  
  // Summary log with insights
  const updatedBadges = badgesInjected - (videoElements.length - badgesInjected);
  console.log(
    `✅ YTOSC: ${videos.length} videos analyzed | ` +
    `${badgesInjected} badges (${updatedBadges > 0 ? updatedBadges + ' updated' : 'all new'}) | ` +
    `Avg: ${avgScore.toFixed(1)}x | Max: ${maxScore.toFixed(1)}x | ` +
    `≥2x: ${highScores}`
  );
}

/**
 * Show analytics modal for a video
 */
function showAnalyticsModal(video: VideoWithScore) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.ytosc-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Get video thumbnail
  const thumbnailUrl = getThumbnailUrl(video.url);
  
  // Calculate additional metrics
  const allScores = currentVideos
    .filter(v => v.outlierScore !== null)
    .map(v => v.outlierScore!);
  
  const percentile = calculatePercentile(video.outlierScore!, allScores);
  const medianViews = getMedianViewCount(currentVideos.filter(v => v.viewCount !== null));
  
  // Determine performance level
  let performanceLevel = 'Average';
  let performanceColor = '#9E9E9E';
  let performancePercentage = percentile;
  
  if (video.outlierScore! >= 10) {
    performanceLevel = 'Exceptional';
    performanceColor = '#F44336';
  } else if (video.outlierScore! >= 5) {
    performanceLevel = 'Excellent';
    performanceColor = '#FF9800';
  } else if (video.outlierScore! >= 2) {
    performanceLevel = 'Good';
    performanceColor = '#FFEB3B';
  }
  
  // Get score badge class
  let badgeClass = 'ytosc-badge--default';
  if (video.outlierScore! >= 10) badgeClass = 'ytosc-badge--gold';
  else if (video.outlierScore! >= 5) badgeClass = 'ytosc-badge--silver';
  else if (video.outlierScore! >= 2) badgeClass = 'ytosc-badge--bronze';
  
  // Create modal
  const overlay = document.createElement('div');
  overlay.className = 'ytosc-modal-overlay';
  
  overlay.innerHTML = `
    <div class="ytosc-modal">
      <div class="ytosc-modal-header">
        <img src="${thumbnailUrl}" alt="Video thumbnail" class="ytosc-modal-thumbnail" />
        <button class="ytosc-modal-close" aria-label="Close">&times;</button>
      </div>
      
      <div class="ytosc-modal-body">
        <h2 class="ytosc-modal-title">${escapeHtml(video.title)}</h2>
        
        <div class="ytosc-modal-score">
          <div class="ytosc-modal-score-badge ${badgeClass}">
            ${video.outlierScore!.toFixed(1)}x
          </div>
          <div class="ytosc-modal-score-info">
            <div class="ytosc-modal-score-label">Outlier Score</div>
            <div class="ytosc-modal-score-value">${performanceLevel} Performance</div>
          </div>
        </div>
        
        <div class="ytosc-modal-stats">
          <div class="ytosc-modal-stat">
            <span class="ytosc-modal-stat-label">Video Views</span>
            <span class="ytosc-modal-stat-value">${formatNumber(video.viewCount || 0)}</span>
          </div>
          
          <div class="ytosc-modal-stat">
            <span class="ytosc-modal-stat-label">Channel Median</span>
            <span class="ytosc-modal-stat-value">${formatNumber(medianViews)}</span>
          </div>
          
          <div class="ytosc-modal-stat">
            <span class="ytosc-modal-stat-label">Percentile Rank</span>
            <span class="ytosc-modal-stat-value">${percentile.toFixed(0)}th</span>
          </div>
          
          <div class="ytosc-modal-stat">
            <span class="ytosc-modal-stat-label">vs. Average</span>
            <span class="ytosc-modal-stat-value">${video.outlierScore! > 1 ? '+' : ''}${((video.outlierScore! - 1) * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div class="ytosc-modal-analysis">
          <h3 class="ytosc-modal-analysis-title">📊 Performance Analysis</h3>
          <p class="ytosc-modal-analysis-text">
            ${getAnalysisText(video.outlierScore!, medianViews, video.viewCount || 0)}
          </p>
          
          <div class="ytosc-performance-bar">
            <div class="ytosc-performance-label">Channel Performance Distribution</div>
            <div class="ytosc-performance-track">
              <div class="ytosc-performance-fill" style="width: ${performancePercentage}%; background: ${performanceColor};"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Close handlers
  const closeBtn = overlay.querySelector('.ytosc-modal-close');
  closeBtn?.addEventListener('click', () => overlay.remove());
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // ESC key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Get thumbnail URL from video URL
 */
function getThumbnailUrl(videoUrl: string): string {
  const videoId = new URL(videoUrl).searchParams.get('v');
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}

/**
 * Calculate percentile rank
 */
function calculatePercentile(score: number, allScores: number[]): number {
  const sorted = [...allScores].sort((a, b) => a - b);
  const index = sorted.findIndex(s => s >= score);
  return ((index + 1) / sorted.length) * 100;
}

/**
 * Format number with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate analysis text based on performance
 */
function getAnalysisText(score: number, median: number, views: number): string {
  const difference = views - median;
  const percentDiff = ((score - 1) * 100).toFixed(0);
  
  if (score >= 10) {
    return `🔥 This video is an exceptional outlier! It has ${formatNumber(views)} views, which is ${score.toFixed(1)}x the channel median of ${formatNumber(median)}. This represents a ${percentDiff}% increase over typical performance—truly viral content!`;
  } else if (score >= 5) {
    return `⭐ This video is performing excellently! With ${formatNumber(views)} views compared to the median of ${formatNumber(median)}, it's ${percentDiff}% above average. This content clearly resonated with your audience.`;
  } else if (score >= 2) {
    return `✨ This video is performing well above average at ${score.toFixed(1)}x the median. It has ${formatNumber(difference)} more views than typical, showing ${percentDiff}% better engagement.`;
  } else if (score >= 1) {
    return `📈 This video is performing around average for your channel, with ${formatNumber(views)} views compared to the median of ${formatNumber(median)}.`;
  } else {
    return `📊 This video is performing below average with ${formatNumber(views)} views (${percentDiff}% of median). This could indicate the content, title, or thumbnail needs optimization.`;
  }
}


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
  scrollObserver = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      // Prevent concurrent processing
      if (isProcessing) {
        return;
      }
      
      // Check both rich and grid layouts
      let currentCount = document.querySelectorAll('ytd-rich-item-renderer').length;
      if (currentCount === 0) {
        currentCount = document.querySelectorAll('ytd-grid-video-renderer').length;
      }
      
      const injectedCount = document.querySelectorAll('[data-ytosc-score]').length;
      
      // Smart detection: Only process if we have new videos
      // AND not stuck in a loop (same count triggering repeatedly)
      if (currentCount > injectedCount && currentCount !== lastProcessedCount) {
        lastProcessedCount = currentCount;
        isProcessing = true;
        
        injectOutlierScores();
        
        // Reset processing flag after a delay
        setTimeout(() => {
          isProcessing = false;
        }, 1000);
      }
    }, 500);
  });
  
  // Observe the main content area for changes
  const contentArea = document.querySelector('ytd-app');
  if (contentArea) {
    scrollObserver.observe(contentArea, { childList: true, subtree: true });
  }
}

init();
