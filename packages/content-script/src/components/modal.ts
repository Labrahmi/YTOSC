/**
 * Analytics modal component
 */

import { VideoWithScore } from '@core/types';
import { getMedianViewCount } from '@core/index';
import { SELECTORS } from '../constants';
import { getThumbnailUrl, escapeHtml, formatNumber } from '../utils/dom';
import { calculatePercentile, getPerformanceLevel, getAnalysisText } from '../utils/analytics';
import { getBadgeClass } from './badge';

// Global state for current videos (imported from main)
let currentVideos: VideoWithScore[] = [];

export function setCurrentVideos(videos: VideoWithScore[]) {
  currentVideos = videos;
}

/**
 * Show analytics modal for a video
 */
export function showAnalyticsModal(video: VideoWithScore) {
  // Remove existing modal if any
  const existingModal = document.querySelector(SELECTORS.MODAL_OVERLAY);
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
  const { level: performanceLevel, color: performanceColor } = getPerformanceLevel(video.outlierScore!);
  const performancePercentage = percentile;
  
  // Get score badge class
  const badgeClass = getBadgeClass(video.outlierScore!);
  
  // Create modal
  const overlay = createModalOverlay(
    video,
    thumbnailUrl,
    badgeClass,
    performanceLevel,
    performanceColor,
    performancePercentage,
    medianViews
  );
  
  // Disable page scroll
  disableBodyScroll();
  
  // Add to page
  document.body.appendChild(overlay);
  
  // Setup event handlers
  setupModalEventHandlers(overlay);
}

/**
 * Create modal overlay element
 */
function createModalOverlay(
  video: VideoWithScore,
  thumbnailUrl: string,
  badgeClass: string,
  performanceLevel: string,
  performanceColor: string,
  performancePercentage: number,
  medianViews: number
): HTMLElement {
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
        
        ${createScoreSection(video, badgeClass, performanceLevel)}
        ${createStatsGrid(video, medianViews, performancePercentage)}
        ${createAnalysisSection(video, medianViews, performanceColor, performancePercentage)}
      </div>
    </div>
  `;
  
  return overlay;
}

/**
 * Create score display section
 */
function createScoreSection(
  video: VideoWithScore,
  badgeClass: string,
  performanceLevel: string
): string {
  return `
    <div class="ytosc-modal-score">
      <div class="ytosc-modal-score-badge ${badgeClass}">
        ${video.outlierScore!.toFixed(1)}x
      </div>
      <div class="ytosc-modal-score-info">
        <div class="ytosc-modal-score-label">Outlier Score</div>
        <div class="ytosc-modal-score-value">${performanceLevel} Performance</div>
      </div>
    </div>
  `;
}

/**
 * Create statistics grid
 */
function createStatsGrid(
  video: VideoWithScore,
  medianViews: number,
  percentile: number
): string {
  return `
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
  `;
}

/**
 * Create analysis section
 */
function createAnalysisSection(
  video: VideoWithScore,
  medianViews: number,
  performanceColor: string,
  performancePercentage: number
): string {
  const analysisText = getAnalysisText(video.outlierScore!, medianViews, video.viewCount || 0);
  
  return `
    <div class="ytosc-modal-analysis">
      <h3 class="ytosc-modal-analysis-title">📊 Performance Analysis</h3>
      <p class="ytosc-modal-analysis-text">${analysisText}</p>
      
      <div class="ytosc-performance-bar">
        <div class="ytosc-performance-label">Channel Performance Distribution</div>
        <div class="ytosc-performance-track">
          <div class="ytosc-performance-fill" style="width: ${performancePercentage}%; background: ${performanceColor};"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Setup modal event handlers
 */
function setupModalEventHandlers(overlay: HTMLElement) {
  const closeModal = () => {
    overlay.remove();
    enableBodyScroll();
  };
  
  // Close button
  const closeBtn = overlay.querySelector('.ytosc-modal-close');
  closeBtn?.addEventListener('click', closeModal);
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // ESC key to close
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/**
 * Disable body scroll when modal is open
 */
function disableBodyScroll() {
  // Save current overflow state
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  // Prevent layout shift by adding padding to compensate for scrollbar
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

/**
 * Re-enable body scroll when modal is closed
 */
function enableBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

