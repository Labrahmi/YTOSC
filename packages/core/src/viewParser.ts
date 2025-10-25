/**
 * Parse YouTube view count strings into numbers
 * Handles formats like "1.2K", "12M", "1.5B", etc.
 * Also handles international formats with spaces, different separators, and localized suffixes
 * 
 * Returns null for videos without view counts (member-only, scheduled, etc.)
 */
export function parseViewCount(viewString: string): number | null {
  if (!viewString) {
    return null;
  }
  
  const original = viewString.trim();
  
  // Check for special cases that indicate no view count
  const noViewsPatterns = [
    /^(no|0)\s*views?$/i,
    /^-+$/,
    /premieres?/i,
    /scheduled/i,
    /member/i,
    /upcoming/i,
  ];
  
  for (const pattern of noViewsPatterns) {
    if (pattern.test(original)) {
      return null;
    }
  }
  
  // Normalize the string:
  // - Remove common words (views, vues, visualizaciones, etc.)
  // - Replace various space characters with standard space
  // - Normalize decimal separators
  let cleaned = original
    .toLowerCase()
    .replace(/\s*views?\s*/gi, '')
    .replace(/\s*vues?\s*/gi, '')
    .replace(/\s*visualizaciones?\s*/gi, '')
    .replace(/\s*visualizzazioni?\s*/gi, '')
    .replace(/\s*aufrufe?\s*/gi, '')
    .replace(/[\u00A0\u202F]/g, ' ') // non-breaking spaces
    .replace(/\s+/g, '') // remove all spaces
    .trim();
  
  // Handle different decimal separators
  // European format uses comma as decimal: 1,2K
  // We need to distinguish between thousand separators and decimal separators
  // If there's a comma followed by 1-2 digits and then a letter, it's likely decimal
  if (/,\d{1,2}[kmb]/i.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  } else {
    // Otherwise remove commas (they're thousand separators)
    cleaned = cleaned.replace(/,/g, '');
  }
  
  // Extract number and suffix
  // Support: K, M, B (English), Md/Mio (some locales), T (trillion in some locales)
  // Also support 万 (10k in Chinese/Japanese) and 億 (100M in Chinese/Japanese)
  const match = cleaned.match(/^([\d.]+)\s*([kmbt]|md|mio|mil|万|億)?/i);
  
  if (!match) {
    // Try to parse as plain number
    const plainNumber = parseFloat(cleaned);
    if (!isNaN(plainNumber)) {
      return Math.floor(plainNumber);
    }
    return null;
  }
  
  const number = parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase();
  
  if (isNaN(number)) {
    return null;
  }
  
  const multipliers: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    md: 1_000_000, // German Millionen
    mio: 1_000_000, // Some locales
    mil: 1_000, // Spanish/Portuguese thousand
    b: 1_000_000_000,
    t: 1_000_000_000_000,
    '万': 10_000, // Chinese/Japanese 10 thousand
    '億': 100_000_000, // Chinese/Japanese 100 million
  };
  
  const multiplier = suffix ? multipliers[suffix] || 1 : 1;
  
  return Math.floor(number * multiplier);
}

/**
 * Format a view count number back to a human-readable string
 */
export function formatViewCount(views: number): string {
  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B`;
  }
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toString();
}
