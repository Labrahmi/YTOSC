/**
 * Background Service Worker
 * 
 * Handles extension lifecycle events
 * Note: No persistent storage is used per project requirements
 */

console.log('YouTube Outlier Score Calculator - Background Service Worker Loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed - YouTube Outlier Score Calculator v1.0.0');
  } else if (details.reason === 'update') {
    console.log('Extension updated - YouTube Outlier Score Calculator v1.0.0');
  }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started - YouTube Outlier Score Calculator loaded');
});
