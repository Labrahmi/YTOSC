# Architecture Documentation

## System Overview

The YouTube Outlier Score Calculator is a Chrome extension that analyzes YouTube channel videos and displays outlier scores based on view count performance. The extension uses a modular architecture with clear separation of concerns.

## 🏗️ Architecture Principles

- **Modular Design**: Each package has a single responsibility
- **State Management**: Centralized store pattern for content script state
- **Type Safety**: Strict TypeScript throughout the codebase
- **Performance**: Incremental updates and efficient DOM manipulation
- **Internationalization**: Support for multiple languages and number formats

## 📦 Package Structure

### Core Package (`packages/core`)
**Purpose**: Pure business logic and shared utilities

**Responsibilities:**
- TypeScript type definitions (VideoData, VideoWithScore, etc.)
- International view count parsing
- Algorithm documentation (deprecated reference implementations)

**Key Files:**
- `types.ts` - Shared TypeScript interfaces
- `viewParser.ts` - Multi-language number parsing
- `README.md` - Package documentation

**No Dependencies**: Pure functions, no DOM or browser APIs

### Content Script Package (`packages/content-script`)
**Purpose**: YouTube page interaction and score calculation

**Responsibilities:**
- YouTube DOM observation and manipulation
- Outlier score calculation and badge injection
- Filter management and UI state
- Chrome extension messaging

**Key Components:**
- `index.ts` - Main entry point and orchestration
- `calc/score.ts` - Outlier score calculation algorithm
- `state/store.ts` - Centralized state management
- `features/filterController.ts` - Filter logic and loading management
- `ui/` - Badge injection, filter bars, loading overlays
- `services/` - Video extraction, badge injection
- `parsers/` - YouTube DOM selectors and data extraction
- `utils/` - Helper functions (logger, number formatting, DOM utilities)

**State Management:**
- Uses a singleton `store` instance with reactive state
- Maintains video records with scores, DOM references, and metadata
- Handles filter state and loading progress

### Popup Package (`packages/popup`)
**Purpose**: Extension popup user interface

**Responsibilities:**
- Display video statistics and filtered results
- Settings management
- Communication with content script

**Key Features:**
- Real-time data from active YouTube tab
- Video list with sorting and filtering
- Statistics display (median scores, counts)
- Theme switching
- Responsive design

### UI Package (`packages/ui`)
**Purpose**: Shared React component library

**Components:**
- `Badge` - Score display badges
- `Button` - Styled button components

### Background Package (`packages/background`)
**Purpose**: Chrome extension service worker

**Responsibilities:**
- Extension lifecycle management
- Permission handling
- Update notifications

## 🔄 Data Flow

### Extension Initialization
```
1. User loads YouTube channel page
2. Content script loads and initializes
3. DOMObserver starts watching for video elements
4. Videos are parsed and added to store
5. Scores are calculated incrementally
6. Badges are injected into DOM
```

### Score Calculation Flow
```
Video Card Detected
    ↓
Parse Title + Views + URL
    ↓
Add to Store (with null score)
    ↓
Calculate Score (using 10 neighbors)
    ↓
Update Store with Score
    ↓
Inject Badge into DOM
```

### Filtering Flow
```
User Clicks Filter Button
    ↓
Lock Threshold (median × multiplier)
    ↓
Hide Videos Below Threshold
    ↓
Sort Remaining Videos by Score
    ↓
Load More Videos if Needed
```

## 🧮 Algorithm Details

### Outlier Score Formula
```
outlier_score = video_views / median(10 neighboring videos)
```

### Neighbor Selection
1. **Target**: 10 neighbors total (5 before + 5 after)
2. **Edge Handling**: Adjust ratios for videos at list boundaries
3. **Filtering**: Exclude videos without view counts (null/0/member-only)
4. **Small Channels**: Use all available neighbors if < 10 exist

### Score Categories
- **🥇 Gold (10x+)**: Exceptional outliers
- **🥈 Silver (5x-10x)**: Excellent performers
- **🥉 Bronze (2x-5x)**: Good performers
- **Default (<2x)**: Below threshold

## 🎯 Key Design Decisions

### State Management Choice
**Why a custom store instead of Redux/Zustand?**
- Lightweight (no additional dependencies)
- Browser extension context (smaller bundle size)
- Simple reactive pattern sufficient for use case
- Direct integration with DOM references

### Incremental Updates
**Why not recalculate all scores on new videos?**
- Performance: O(n) vs O(n²) for large channels
- Real-time: Users see results as videos load
- Memory: Only affects videos near new additions

### Badge Versioning
**Why badge versioning?**
- Prevents conflicts with multiple extension versions
- Allows for future badge format changes
- Easy cleanup of old badges

### Config Centralization
**Why a single config file?**
- Single source of truth for constants
- Easier maintenance and updates
- Consistent values across packages

## 🔧 Development Workflow

### Adding New Features
1. **Core Logic**: Add to `packages/core` (pure functions)
2. **YouTube Integration**: Modify `packages/content-script`
3. **UI Changes**: Update `packages/popup`
4. **Shared Components**: Extend `packages/ui`

### Testing Strategy
1. **Unit Tests**: Algorithm logic in `packages/core`
2. **Integration Tests**: Content script functionality
3. **Manual Testing**: Full extension in browser
4. **Performance Testing**: Large channels (>100 videos)

### Build Process
- **Development**: `npm run dev:ui` (UI) or `npm run dev` (full)
- **Production**: `npm run build` → outputs to `dist/`
- **Quality**: `npm run lint`, `npm run type-check`, `npm test`

## 🚨 Error Handling

### Content Script Errors
- Graceful degradation (extension fails silently)
- Logger utility for structured error reporting
- Recovery mechanisms for DOM changes

### Extension Lifecycle
- Clean state on channel navigation
- Memory management for long sessions
- Permission validation

## 🔍 Performance Considerations

### Memory Management
- Store maintains only current channel data
- DOM references cleaned up on navigation
- Incremental score calculation prevents memory spikes

### DOM Performance
- MutationObserver with debouncing
- Efficient selector usage
- Batch DOM updates

### Loading Strategy
- Progressive loading as user scrolls
- Smart stopping when filtered results satisfied
- Timeout protection against infinite loading

## 🌐 Browser Compatibility

- **Primary**: Chrome 88+ (Manifest V3)
- **Supported**: Chromium-based browsers (Edge, Opera)
- **Requirements**: ActiveTab permission, scripting API

## 🔮 Future Extensions

### Potential Enhancements
- **Sorting Options**: By date, views, engagement
- **Export Features**: CSV/PDF reports
- **Advanced Filtering**: Date ranges, keywords
- **Analytics**: Performance trends over time
- **Social Features**: Share standout videos

### Architecture Scalability
- Current design supports feature additions
- Store pattern enables complex state management
- Modular structure allows package splitting

---

**Last Updated**: October 2025
**Version**: 1.0.0
