/**
 * Tests for content-script parseViews function
 * Ensures it handles the same cases as the core viewParser
 */

import { describe, it, expect } from 'vitest';
import { parseViews, formatViews } from '../parseViews';

describe('parseViews', () => {
  describe('Standard formats', () => {
    it('should parse K formats', () => {
      expect(parseViews('1.2k')).toBe(1200);
      expect(parseViews('12K')).toBe(12000);
      expect(parseViews('500K')).toBe(500000);
    });

    it('should parse M formats', () => {
      expect(parseViews('1M')).toBe(1000000);
      expect(parseViews('12M')).toBe(12000000);
      expect(parseViews('5.5M')).toBe(5500000);
    });

    it('should parse B formats', () => {
      expect(parseViews('1B')).toBe(1000000000);
      expect(parseViews('2.5B')).toBe(2500000000);
    });
  });

  describe('Localized formats', () => {
    it('should handle English', () => {
      expect(parseViews('1,234 views')).toBe(1234);
      expect(parseViews('1.2K views')).toBe(1200);
    });

    it('should handle French (comma decimal)', () => {
      expect(parseViews('1,2K vues')).toBe(1200);
      expect(parseViews('1,5M vues')).toBe(1500000);
    });

    it('should handle German', () => {
      expect(parseViews('1,2K Aufrufe')).toBe(1200);
      expect(parseViews('1Mio Aufrufe')).toBe(1000000);
    });

    it('should handle Chinese/Japanese', () => {
      expect(parseViews('1万')).toBe(10000);
      expect(parseViews('5.5万')).toBe(55000);
      expect(parseViews('1億')).toBe(100000000);
    });
  });

  describe('Special cases - no views', () => {
    it('should return null for member-only videos', () => {
      expect(parseViews('Member')).toBeNull();
      expect(parseViews('member-only')).toBeNull();
    });

    it('should return null for scheduled videos', () => {
      expect(parseViews('Scheduled')).toBeNull();
      expect(parseViews('scheduled')).toBeNull();
    });

    it('should return null for premieres', () => {
      expect(parseViews('Premiere')).toBeNull();
      expect(parseViews('premieres')).toBeNull();
    });

    it('should return null for upcoming', () => {
      expect(parseViews('Upcoming')).toBeNull();
      expect(parseViews('upcoming')).toBeNull();
    });

    it('should return null for empty/invalid', () => {
      expect(parseViews('')).toBeNull();
      expect(parseViews(null)).toBeNull();
      expect(parseViews(undefined)).toBeNull();
      expect(parseViews('---')).toBeNull();
    });
  });

  describe('Edge cases from requirements', () => {
    it('should handle all required formats: 1.2k, 12M, 500K, 1B', () => {
      expect(parseViews('1.2k')).toBe(1200);
      expect(parseViews('12M')).toBe(12000000);
      expect(parseViews('500K')).toBe(500000);
      expect(parseViews('1B')).toBe(1000000000);
    });
  });
});

describe('formatViews', () => {
  it('should format views correctly', () => {
    expect(formatViews(500)).toBe('500');
    expect(formatViews(1200)).toBe('1.2K');
    expect(formatViews(1000000)).toBe('1.0M');
    expect(formatViews(1500000000)).toBe('1.5B');
  });
});

