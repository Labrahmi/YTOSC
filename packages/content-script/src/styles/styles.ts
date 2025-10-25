/**
 * CSS styles for the extension
 */

import { STYLE_ID } from '../constants';

export const EXTENSION_STYLES = `
  /* Enhanced title row styling with badge */
  yt-formatted-string[id="video-title"] {
    display: flex;
    align-items: center;
    line-height: 1.4;
  }

  /* YouTube chips container centering */
  #chips-content, ytd-feed-filter-chip-bar-renderer #chips-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 8px;
  }

  /* Filter Chips Container */
  .ytosc-filter-container {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
    padding-left: 16px;
  }

  /* Individual Filter Chip */
  .ytosc-filter-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  /* Filter Chip Button */
  .ytosc-filter-chip-button {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    background-color: #065fd4;
    color: #ffffff;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: 'Roboto', 'Arial', sans-serif;
  }

  .ytosc-filter-chip-button:hover {
    background-color: #0d7df7;
  }

  /* Active Filter Chip */
  .ytosc-filter-chip--active .ytosc-filter-chip-button {
    background-color: #1a73e8;
    box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
  }

  .ytosc-filter-chip--active:hover .ytosc-filter-chip-button {
    background-color: #1557b0;
  }

  /* Clear Filter Chip (Red) */
  .ytosc-filter-chip--clear .ytosc-filter-chip-button {
    background-color: #dc2626;
    color: #ffffff;
  }

  .ytosc-filter-chip--clear:hover .ytosc-filter-chip-button {
    background-color: #ef4444;
  }

  .ytosc-filter-chip--clear.ytosc-filter-chip--active .ytosc-filter-chip-button {
    background-color: #b91c1c;
    box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3);
  }

  .ytosc-filter-chip--clear.ytosc-filter-chip--active:hover .ytosc-filter-chip-button {
    background-color: #991b1b;
  }

  /* Badge positioning within titles */
  .ytosc-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 8px;
    margin-right: 6px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    cursor: pointer;
    vertical-align: middle;
  }

  .ytosc-badge:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  .ytosc-badge--gold {
    background: linear-gradient(135deg, #FF6B6B, #F44336);
    color: #FFFFFF;
  }

  .ytosc-badge--silver {
    background: linear-gradient(135deg, #FFD93D, #FF9800);
    color: #000000;
  }

  .ytosc-badge--bronze {
    background: linear-gradient(135deg, #FFF176, #FFEB3B);
    color: #000000;
  }

  .ytosc-badge--default {
    background: linear-gradient(135deg, #BDBDBD, #9E9E9E);
    color: #FFFFFF;
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

/**
 * Inject CSS styles into the page
 */
export function injectStyles(): void {
  // Check if styles already injected
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = EXTENSION_STYLES;
  
  document.head.appendChild(style);
}

