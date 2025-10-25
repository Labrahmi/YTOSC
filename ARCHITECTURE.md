# YouTube Outlier Score Calculator - Architecture

## 📐 Project Structure

```
YTOSC/
├── packages/
│   ├── core/                    # Business logic (pure TypeScript)
│   │   └── src/
│   │       ├── outlierScore.ts  # Score calculation with ±5 neighbors
│   │       ├── viewParser.ts    # International view count parsing
│   │       └── types.ts         # Shared TypeScript interfaces
│   │
│   ├── content-script/          # YouTube page integration
│   │   └── src/
│   │       ├── index.ts         # Main entry point & orchestration
│   │       ├── constants.ts     # Configuration & constants
│   │       ├── components/      # Reusable UI components
│   │       │   ├── badge.ts     # Score badge component
│   │       │   └── modal.ts     # Analytics modal component
│   │       ├── services/        # Business services
│   │       │   ├── videoExtractor.ts   # DOM scraping
│   │       │   └── badgeInjector.ts    # Badge injection
│   │       ├── utils/           # Helper utilities
│   │       │   ├── dom.ts       # DOM manipulation helpers
│   │       │   └── analytics.ts # Stats & analysis helpers
│   │       └── styles/          # CSS styles
│   │           └── styles.ts    # Extension stylesheet
│   │
│   ├── popup/                   # Extension popup UI
│   │   └── src/
│   │       ├── App.tsx          # Main app component
│   │       ├── components/      # React components
│   │       │   ├── Header.tsx
│   │       │   ├── Footer.tsx
│   │       │   ├── InfoCard.tsx
│   │       │   ├── ScoreLegend.tsx
│   │       │   └── FeatureList.tsx
│   │       └── index.css        # Popup styles
│   │
│   ├── ui/                      # Shared UI component library
│   │   └── src/
│   │       ├── Badge.tsx        # Reusable badge component
│   │       └── Button.tsx       # Reusable button component
│   │
│   └── background/              # Service worker
│       └── src/
│           └── index.ts         # Background script
```

## 🏗️ Architecture Patterns

### 1. **Separation of Concerns**

#### Content Script Layer Architecture:
```
┌─────────────────────────────────────────────┐
│           index.ts (Orchestrator)           │
│  - Initializes observers                    │
│  - Coordinates all services                 │
│  - Manages global state                     │
└─────────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌──────────┐   ┌──────────┐
│Services │   │Components│   │Utilities │
└─────────┘   └──────────┘   └──────────┘
    │             │               │
    ├─ videoExtractor.ts          ├─ dom.ts
    └─ badgeInjector.ts           └─ analytics.ts
                  │
            ├─ badge.ts
            └─ modal.ts
```

### 2. **Single Responsibility Principle**

Each module has ONE clear responsibility:

- **`constants.ts`**: All configuration in one place
- **`dom.ts`**: All DOM queries & manipulation
- **`analytics.ts`**: All statistics & analysis
- **`badge.ts`**: Badge creation & interaction
- **`modal.ts`**: Modal display & templating
- **`videoExtractor.ts`**: Scraping YouTube data
- **`badgeInjector.ts`**: Injecting badges into DOM
- **`styles.ts`**: All CSS styles

### 3. **Dependency Injection Pattern**

```typescript
// Modal component receives state via dependency injection
import { setCurrentVideos } from './components/modal';

// In main orchestrator
setCurrentVideos(calculatedVideos);
```

### 4. **Configuration-Driven**

All magic numbers and selectors in `constants.ts`:

```typescript
export const TIMINGS = {
  INITIAL_INJECTION_DELAY: 1500,
  SCROLL_DEBOUNCE: 500,
  // ...
};

export const SELECTORS = {
  RICH_ITEM: 'ytd-rich-item-renderer',
  THUMBNAIL: 'ytd-thumbnail',
  // ...
};
```

## 📦 Module Responsibilities

### Core Package (`@core`)
**Pure business logic, no DOM dependencies**
- ✅ Outlier score calculation
- ✅ View count parsing
- ✅ Type definitions
- ❌ No DOM access
- ❌ No side effects

### Content Script

#### **Main Entry (`index.ts`)**
```typescript
- Initialize observers (URL, scroll)
- Orchestrate the flow
- Manage global state
- Call services in order
```

#### **Services**
- **`videoExtractor`**: Extracts video data from YouTube DOM
- **`badgeInjector`**: Injects badges into thumbnails

#### **Components**
- **`badge`**: Creates clickable score badges
- **`modal`**: Displays detailed analytics

#### **Utils**
- **`dom`**: DOM queries, HTML escaping, formatting
- **`analytics`**: Percentile, performance levels, analysis text

### Popup Package
**Component-based React architecture**
- Small, focused components
- Props-based communication
- No business logic (purely presentational)

## 🔄 Data Flow

```
1. User loads YouTube channel page
         │
         ▼
2. index.ts initializes
         │
         ▼
3. injectOutlierScores() called
         │
         ├─→ videoExtractor.extractVideos()
         │         │
         │         ▼
         │   Returns VideoData[]
         │
         ├─→ @core/calculateChannelOutlierScores()
         │         │
         │         ▼
         │   Returns VideoWithScore[]
         │
         ├─→ setCurrentVideos() (share with modal)
         │
         └─→ badgeInjector.injectBadges()
                   │
                   ├─→ badge.createBadge() for each video
                   │         │
                   │         └─→ Attaches click → showAnalyticsModal()
                   │
                   └─→ Appends to thumbnails
```

## 🎯 Key Design Decisions

### 1. **Why separate utils/dom.ts?**
- YouTube has 2 layouts (rich/grid)
- DOM queries are complex and repetitive
- Centralized = easier to update when YouTube changes

### 2. **Why component pattern for badge/modal?**
- Reusability (could be used elsewhere)
- Testing (easier to unit test)
- Maintenance (find code quickly)

### 3. **Why constants.ts?**
- Single source of truth
- Easy to adjust timing/selectors
- Type safety with `as const`

### 4. **Why services folder?**
- Business logic separate from UI
- Could be reused in different contexts
- Clear responsibilities

## 🧪 Testing Strategy

### Unit Tests (Future)
```typescript
// utils/dom.test.ts
test('formatNumber formats 1000 as "1,000"')

// utils/analytics.test.ts
test('getPerformanceLevel returns "Exceptional" for score >= 10')

// core/outlierScore.test.ts
test('calculateOutlierScore with edge cases')
```

### Integration Tests (Future)
```typescript
// services/videoExtractor.test.ts
test('extractVideos handles rich layout')
test('extractVideos handles grid layout')
```

## 🔧 Maintenance Guide

### Adding a New Feature
1. **Identify the layer** (core, service, component, util)
2. **Create focused module** (one responsibility)
3. **Update index.ts** if needed for orchestration
4. **Add constants** if introducing magic values

### Modifying YouTube Selectors
1. Open `constants.ts`
2. Update `SELECTORS` object
3. All code uses constants, so changes propagate

### Changing Timing/Behavior
1. Open `constants.ts`
2. Update `TIMINGS` object
3. No need to hunt through codebase

### Styling Changes
1. Open `styles/styles.ts`
2. Modify `EXTENSION_STYLES` string
3. All styles in one place

## 📊 Benefits of This Architecture

✅ **Maintainability**: Easy to find and fix bugs  
✅ **Scalability**: Add features without touching existing code  
✅ **Testability**: Small, focused functions are easy to test  
✅ **Readability**: Clear file names and responsibilities  
✅ **Flexibility**: Swap implementations without breaking others  
✅ **Discoverability**: New developers can navigate easily  

## 🚀 Future Improvements

1. **Add unit tests** for critical functions
2. **Extract i18n** into separate module
3. **Add error boundary** in popup
4. **Create logger service** instead of console.log
5. **Add performance monitoring** service
6. **Create theme system** for colors

---

**Last Updated**: October 2025  
**Version**: 1.0.0

