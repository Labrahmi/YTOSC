/**
 * Core Package - Shared Types and Utilities
 *
 * This package provides:
 * - Shared TypeScript type definitions (VideoData, VideoWithScore, etc.)
 * - View count parsing for international formats
 *
 * Note: The outlier calculation exports are deprecated reference implementations.
 * The active implementation is in packages/content-script/src/calc/score.ts
 */
export * from './viewParser';
export * from './types';
