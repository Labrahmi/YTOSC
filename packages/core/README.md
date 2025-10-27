# @ytosc/core

**Shared Types and Utilities Package**

## Purpose

This package provides foundational shared code used across the YouTube Outlier Score Calculator extension:

- **Type Definitions**: Common TypeScript interfaces and types
- **View Parser**: International view count parsing utility

## What's Inside

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

## Architecture

```
@ytosc/core/
├── types.ts           # Shared type definitions
├── viewParser.ts      # International view parsing
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

## Testing

Run tests for the core package:

```bash
npm test packages/core
```

---

**Package Version:** 1.0.0  
**Last Updated:** October 2025  
**Maintainer:** YTOSC Team

