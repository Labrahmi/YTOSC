/**
 * Logging utilities for debugging
 */

const PREFIX = '🎬 YTOSC';

export const logger = {
  log: (message: string, ...args: any[]) => {
    console.log(`${PREFIX}: ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`${PREFIX} ⚠️: ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`${PREFIX} ❌: ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${PREFIX} 🐛: ${message}`, ...args);
    }
  },

  success: (message: string, ...args: any[]) => {
    console.log(`${PREFIX} ✅: ${message}`, ...args);
  },
};

