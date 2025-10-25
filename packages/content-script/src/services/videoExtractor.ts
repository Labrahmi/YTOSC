/**
 * Video data extraction service
 */

import { parseViewCount } from '@core/index';
import type { VideoData } from '@core/types';
import { 
  getVideoElements, 
  detectLayout, 
  findTitleElement, 
  findViewElement,
  extractTitle 
} from '../utils/dom';

/**
 * Extract video data from YouTube channel page
 * Supports both old (ytd-grid-video-renderer) and new (ytd-rich-item-renderer) layouts
 */
export function extractVideos(): VideoData[] {
  const videos: VideoData[] = [];
  let skippedCount = 0;
  let parseErrors = 0;
  
  const isRichLayout = detectLayout() === 'rich';
  const videoElements = getVideoElements();
  
  if (videoElements.length === 0) {
    console.warn('⚠️ No video elements found on page');
    return videos;
  }
  
  videoElements.forEach((element, index) => {
    try {
      const titleElement = findTitleElement(element, isRichLayout);
      const viewElement = findViewElement(element, isRichLayout);
      
      if (!titleElement || !viewElement) {
        skippedCount++;
        return;
      }
      
      // Extract data
      const title = extractTitle(titleElement, element, isRichLayout);
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
  console.log(
    `📊 Extracted ${videos.length} videos (${isRichLayout ? 'Rich' : 'Grid'} layout)` +
    (skippedCount > 0 ? `, skipped: ${skippedCount}` : '') +
    (parseErrors > 0 ? `, errors: ${parseErrors}` : '')
  );
  
  return videos;
}

