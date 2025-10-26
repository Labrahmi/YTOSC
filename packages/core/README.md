# @ytosc/core

**Shared Types and Utilities Package**

## Purpose

This package provides foundational shared code used across the YouTube Outlier Score Calculator extension:

- **Type Definitions**: Common TypeScript interfaces and types
- **View Parser**: International view count parsing utility

## What's Inside

### ✅ Active Exports

#### 1. Type Definitions (`types.ts`)

Shared TypeScript interfaces used throughout the project:

```typescript
import type { VideoData, VideoWithScore } from '@core/types';
```

**Available Types:**
- `VideoData` - Base video information structure
- `VideoWithScore` - Video with calculated outlier score
- `ChannelStats` - Channel-level statistics
- `FilterLevel` - Filter threshold type (2 | 5 | 10 | null)
- `FilterMessage` - Message types for filtering
- `StatsResponse` - Stats response structure

**Used by:**
- Popup components (VideoRow, VideoList, FilteredStats, etc.)
- Content-script components (badge, modal, services)
- Custom hooks (useLiveData, useFilters)

#### 2. View Parser (`viewParser.ts`)

Robust international view count parser that handles multiple formats:

```typescript
import { parseViewCount, formatViewCount } from '@core/index';
```

**Features:**
- Supports multiple languages (English, French, Spanish, German, etc.)
- Handles different formats: "1.2K", "12M", "1.5B"
- Different decimal separators (`.` and `,`)
- Special cases: member-only, scheduled, live videos
- International characters: 万 (Chinese/Japanese), etc.

**Used by:**
- Content-script video extraction (`videoExtractor.ts`)

### ⚠️ Deprecated Exports

#### Outlier Score Calculation (`outlierScore.ts`)

**Status:** Reference implementation only

**Active Implementation:** `packages/content-script/src/calc/score.ts`

The outlier calculation functions in this package are **deprecated** and kept only for:
- ✅ Algorithm documentation
- ✅ Comprehensive test coverage (451 test cases)
- ✅ Reference implementation

The content-script package has a reimplemented version that:
- Integrates with the state store
- Supports incremental updates
- Better performance for real-time calculation

**Functions (Deprecated):**
- `calculateOutlierScore()` - Calculate score for a single video
- `calculateChannelOutlierScores()` - Calculate scores for all videos
- `getMedianViewCount()` - Get median view count (moved to content-script)

## Architecture

```
@ytosc/core/
├── types.ts           # ✅ Shared type definitions
├── viewParser.ts      # ✅ International view parsing
├── outlierScore.ts    # ⚠️  Reference implementation (deprecated)
└── index.ts           # Package exports
```

## Usage Examples

### Importing Types

```typescript
// Popup components
import type { VideoWithScore } from '@core/types';

// Content-script
import type { VideoData } from '@core/types';
```

### Using View Parser

```typescript
import { parseViewCount } from '@core/index';

const views = parseViewCount("1.2M views");  // Returns: 1200000
const views2 = parseViewCount("1,2M vues"); // Returns: 1200000 (French)
const views3 = parseViewCount("Member only"); // Returns: null
```

## Migration Notes

### For Outlier Score Calculation

**Before (Deprecated):**
```typescript
import { calculateChannelOutlierScores } from '@core/index';

const videosWithScores = calculateChannelOutlierScores(videos);
```

**After (Current Active Implementation):**
```typescript
import { calculateAllScores } from './calc/score';
import { store } from './state/store';

// Videos are managed in store
calculateAllScores(); // Calculates for all videos in store
```

### For Median View Count

**Before (Deprecated):**
```typescript
import { getMedianViewCount } from '@core/index';

const median = getMedianViewCount(videos);
```

**After (Current):**
```typescript
import { getMedianViewCount } from './utils/number';

const median = getMedianViewCount(videos);
```

## Why the Change?

The outlier score calculation was moved from `core` to `content-script` because:

1. **State Integration**: New implementation uses the centralized store
2. **Performance**: Incremental updates instead of recalculating everything
3. **Real-time**: Better suited for dynamic video loading
4. **Neighbor Selection**: Integrated with store's `getNeighbors()` method

The core package now focuses on what it does best:
- Providing shared type definitions
- Offering pure utility functions (view parsing)
- No DOM dependencies or state management

## Testing

The reference implementation in `outlierScore.ts` has comprehensive test coverage:

```bash
npm test packages/core
```

**Test Coverage:**
- Formula verification (5 before + 5 after neighbor selection)
- Edge cases (insufficient videos, balancing)
- Small channels (< 10 videos)
- Null/zero view counts
- Real-world scenarios (viral videos, underperformers)

## Package Role Summary

| Feature | Status | Location |
|---------|--------|----------|
| Type Definitions | ✅ **Active** | `types.ts` |
| View Parser | ✅ **Active** | `viewParser.ts` |
| Outlier Calculation | ⚠️ **Reference Only** | `outlierScore.ts` (tests only) |

---

**Package Version:** 1.0.0  
**Last Updated:** October 2025  
**Maintainer:** YTOSC Team

