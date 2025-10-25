/**
 * Video data extraction service
 */

import { parseViewCount } from '@core/index';
import type { VideoData } from '@core/types';
import {
  getVideoElements,
  findTitleElement,
  findViewElement,
  extractTitle
} from '../utils/dom';

/**
 * Extract video data from YouTube channel page
 */
export function extractVideos(): VideoData[] {
  const videos: VideoData[] = [];
  let skippedCount = 0;
  let parseErrors = 0;

  const videoElements = getVideoElements();

  if (videoElements.length === 0) {
    console.warn('⚠️ No video elements found on page');
    return videos;
  }

  videoElements.forEach((element, index) => {
    try {
      const titleElement = findTitleElement(element);
      const viewElement = findViewElement(element);

      if (!titleElement || !viewElement) {
        skippedCount++;
        return;
      }

      // Extract data
      const title = extractTitle(titleElement, element);
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
    `📊 Extracted ${videos.length} videos` +
    (skippedCount > 0 ? `, skipped: ${skippedCount}` : '') +
    (parseErrors > 0 ? `, errors: ${parseErrors}` : '')
  );

  return videos;
}

