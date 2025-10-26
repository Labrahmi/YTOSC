/**
 * Loading overlay
 * Simple, minimalist overlay shown while filter is loading videos
 */

const OVERLAY_ID = 'ytosc-loading-overlay';

/**
 * Show loading overlay
 */
export function showLoadingOverlay(message: string = 'Loading videos...'): void {
  // Don't create duplicate
  if (document.getElementById(OVERLAY_ID)) {
    return;
  }

  // Inject styles if not already present
  injectLoadingStyles();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.className = 'ytosc-loading-overlay';
  
  overlay.innerHTML = `
    <div class="ytosc-loading-content">
      <div class="ytosc-loading-spinner"></div>
      <div class="ytosc-loading-text">${message}</div>
      <div class="ytosc-loading-subtext">Finding matching videos...</div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * Update loading overlay message
 */
export function updateLoadingMessage(
  count: number,
  target: number,
  message?: string,
  subtext?: string
): void {
  const overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) return;

  const textEl = overlay.querySelector('.ytosc-loading-text');
  const subtextEl = overlay.querySelector('.ytosc-loading-subtext');
  
  if (textEl) {
    textEl.textContent = message || `Loading videos...`;
  }
  if (subtextEl) {
    subtextEl.textContent = subtext || `Found ${count} of ${target} matching videos`;
  }
}

/**
 * Hide loading overlay with delay
 */
export function hideLoadingOverlay(delay: number = 800): void {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    // Wait for delay, then fade out
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 400);
    }, delay);
  }
}

/**
 * Inject loading overlay styles
 */
function injectLoadingStyles(): void {
  if (document.getElementById('ytosc-loading-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'ytosc-loading-styles';
  style.textContent = `
    .ytosc-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 1;
      transition: opacity 0.4s ease;
    }

    .ytosc-loading-content {
      text-align: center;
      color: white;
    }

    .ytosc-loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.2);
      border-top-color: rgb(35, 100, 240);
      border-radius: 50%;
      animation: ytosc-spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes ytosc-spin {
      to { transform: rotate(360deg); }
    }

    .ytosc-loading-text {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ytosc-loading-subtext {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .ytosc-loading-overlay {
        background: rgba(0, 0, 0, 0.92);
      }
    }
  `;

  document.head.appendChild(style);
}

