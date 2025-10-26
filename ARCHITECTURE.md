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
│   ├── popup/                   # Extension popup UI (React)
│   │   └── src/
│   │       ├── App.tsx          # Main app component
│   │       ├── components/      # Feature components
│   │       │   ├── ui/          # Reusable UI primitives
│   │       │   │   ├── Section.tsx      # Section wrapper
│   │       │   │   └── IconButton.tsx   # Icon button
│   │       │   ├── Header.tsx
│   │       │   ├── Footer.tsx
│   │       │   ├── Tabs.tsx
│   │       │   ├── StatsCard.tsx
│   │       │   ├── FilterBar.tsx
│   │       │   ├── FilteredStats.tsx
│   │       │   ├── VideoList.tsx
│   │       │   ├── VideoRow.tsx
│   │       │   ├── Settings.tsx
│   │       │   └── Icon.tsx
│   │       ├── hooks/           # Custom React hooks
│   │       │   ├── useLiveData.ts   # Channel data management
│   │       │   ├── useFilters.ts    # Filter logic
│   │       │   ├── useAnimations.ts # Animation utilities
│   │       │   ├── useTheme.ts      # Theme management
│   │       │   └── useTabs.ts       # Tab navigation
│   │       ├── utils/           # Utility functions
│   │       │   ├── formatters.ts    # Number/text formatting
│   │       │   └── export.ts        # Data export logic
│   │       └── index.css        # Global styles
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

### Core Package (`@ytosc/core`)
**Shared types and utilities, no DOM dependencies**
- ✅ Type definitions (VideoData, VideoWithScore, etc.)
- ✅ View count parsing (international formats)
- ⚠️ Outlier score calculation (deprecated reference implementation)
  - Active implementation: `content-script/src/calc/score.ts`
  - Kept for testing and documentation only
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
**Modern React architecture with separation of concerns**

#### **Layered Architecture**
```
┌─────────────────────────────────────────┐
│  App.tsx (Composition Layer)           │
│  - Orchestrates hooks                   │
│  - Manages global state                 │
│  - Renders layouts                      │
└─────────────────────────────────────────┘
            │
    ┌───────┼───────┬────────┐
    ▼       ▼       ▼        ▼
┌─────┐ ┌──────┐ ┌─────┐ ┌──────┐
│Hooks│ │Comps │ │Utils│ │UI    │
└─────┘ └──────┘ └─────┘ └──────┘
```

#### **Hooks Layer** (Business Logic)
- `useLiveData`: Channel data fetching & state
- `useFilters`: Video filtering logic
- `useTheme`: Dark mode management & persistence
- `useTabs`: Tab navigation state
- `useAnimations`: Count-up & fade animations

#### **Components Layer** (Features)
- `StatsCard`: Channel overview statistics
- `FilterBar`: Score filtering controls
- `FilteredStats`: Filtered results summary
- `VideoList`: Video display container
- `VideoRow`: Individual video item
- `Settings`: App settings panel
- `Tabs`: Tab navigation
- `Header`, `Footer`: Layout components

#### **UI Primitives** (Reusable)
- `Section`: Consistent section wrapper with header
- `IconButton`: Reusable icon button component
- `Icon`: SVG icon system

#### **Utils Layer** (Pure Functions)
- `formatters.ts`: Number formatting, score classification
- `export.ts`: JSON export & download logic

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

## 🏛️ Popup Architecture Principles

### **1. Separation of Concerns**
- **Hooks** = Business logic & state management
- **Components** = UI rendering & user interaction
- **Utils** = Pure functions & data transformation
- **UI Primitives** = Reusable building blocks

### **2. Single Responsibility**
Each module has ONE clear purpose:
- `useTheme`: Theme state + localStorage sync
- `formatters`: Pure data transformation
- `Section`: Consistent section layout
- `IconButton`: Reusable button primitive

### **3. Composition Over Inheritance**
```tsx
// Instead of duplicating section structure
<Section icon="chart" title="Overview">
  <StatsGrid />
</Section>

// Compose primitives
<IconButton icon="download" onClick={handleDownload} />
```

### **4. Type Safety**
- Shared types exported from hooks
- Strict TypeScript configuration
- Interface-first design

### **5. DRY (Don't Repeat Yourself)**
- `formatNumber()` used across components
- `getScoreClass()` centralized logic
- `Section` component eliminates duplication

## 📁 Folder Organization

```
popup/src/
├── components/          # Feature components
│   ├── ui/             # Reusable primitives
│   ├── StatsCard.tsx   # Feature: Statistics display
│   ├── FilterBar.tsx   # Feature: Filtering controls
│   └── ...
├── hooks/              # Custom hooks (state + logic)
│   ├── useTheme.ts     # Theme management
│   ├── useTabs.ts      # Tab navigation
│   └── ...
├── utils/              # Pure functions
│   ├── formatters.ts   # Data formatting
│   ├── export.ts       # Export logic
│   └── ...
├── App.tsx             # Composition root
└── index.css           # Global styles
```

## 🔄 Data Flow (Popup)

```
1. User opens popup
         │
         ▼
2. App.tsx initializes hooks
         │
         ├─→ useTheme() → Restores saved theme
         ├─→ useTabs() → Sets initial tab
         ├─→ useLiveData() → Fetches channel data
         └─→ useFilters() → Prepares filter state
         │
         ▼
3. App.tsx renders based on state
         │
         ├─→ activeTab === 'overview'
         │         └─→ <StatsCard />
         │
         ├─→ activeTab === 'outliers'
         │         ├─→ <FilteredStats />
         │         ├─→ <FilterBar />
         │         └─→ <VideoList />
         │
         └─→ activeTab === 'settings'
                   └─→ <Settings />
```

## 🎯 Design Patterns Used

### **1. Custom Hooks Pattern**
Extract stateful logic into reusable hooks:
```tsx
// Before: Inline state management
const [theme, setTheme] = useState('light');
useEffect(() => { /* localStorage logic */ }, []);

// After: Custom hook
const { theme, toggleTheme } = useTheme();
```

### **2. Compound Component Pattern**
Section component accepts children & actions:
```tsx
<Section icon="trending" title="Results" action={<IconButton />}>
  <Content />
</Section>
```

### **3. Presentation/Container Pattern**
- **Container**: `App.tsx` (state & logic)
- **Presentation**: Components (pure UI)

### **4. Utility Functions Pattern**
Pure functions for data transformation:
```tsx
// Pure, testable, reusable
export function formatNumber(num: number): string { ... }
export function getScoreClass(score: number): string { ... }
```

## 🧪 Benefits of This Architecture

✅ **Reusability**: UI primitives used across components  
✅ **Testability**: Pure functions easy to unit test  
✅ **Maintainability**: Clear separation of concerns  
✅ **Consistency**: Section component enforces uniform structure  
✅ **Type Safety**: Shared types prevent errors  
✅ **Scalability**: Easy to add new features  
✅ **Developer Experience**: Clear mental model  

## 🚀 Future Improvements

1. **Add unit tests** for utils and hooks
2. **Extract constants** into config file
3. **Add error boundary** in popup
4. **Create logger service** instead of console.log
5. **Add performance monitoring** service
6. **Implement context API** for deeply nested state

---

**Last Updated**: October 2025  
**Version**: 1.0.0

