# YouTube Outlier Score - Popup UI Guide

## 🎨 Overview

The popup has been completely redesigned to provide a **refined, card-based analytics dashboard** for content creators. It offers a quick visual snapshot of how a channel's videos are performing, with dynamic filters and live interaction with the current YouTube tab.

## ✨ Key Features

### 1. **Live Channel Snapshot**
- Real-time statistics from the current YouTube channel page
- Animated number counters for engaging visual feedback
- Key metrics displayed:
  - Total videos analyzed
  - Median view count (formatted: K/M)
  - Top outlier score (with gradient highlight)
  - Average score across all videos
  - Breakdown by performance tiers (Good/Excellent/Exceptional)

### 2. **Smart Filtering**
- Four filter buttons for quick analysis:
  - **≥2× Good** - Shows videos with good performance
  - **≥5× Excellent** - Shows exceptional performers
  - **≥10× Exceptional** - Shows viral hits
  - **Reset** - Shows all videos
- Visual feedback with colored borders and active states
- Instant filtering without page reload

### 3. **Top Results List**
- Ranked list of videos sorted by outlier score
- Color-coded scores (Good=Yellow, Excellent=Orange, Exceptional=Red)
- Clickable rows that open videos in new tabs
- Truncated titles with full title on hover
- Shows top 10 with count of remaining videos

### 4. **Loading & Error States**
- Elegant loading spinner during data fetch
- Clear error messages with helpful hints
- Retry button for failed requests

## 🏗️ Architecture

### Component Structure

```
App.tsx (Main Container)
├── Header (Title & Subtitle)
├── Main Content
│   ├── StatsCard (Live metrics)
│   ├── FilterBar (Filter controls)
│   └── VideoList (Top results)
│       └── VideoRow[] (Individual videos)
└── Footer (Version & sync info)
```

### Custom Hooks

#### `useLiveData()`
Manages communication with the content script to fetch channel data:
- Queries the active YouTube tab
- Requests video data with outlier scores
- Calculates aggregate statistics
- Handles loading and error states

```typescript
const { data, refresh } = useLiveData();
// data contains: videos, totalVideos, medianViews, topScore, avgScore, counts, etc.
```

#### `useFilters(videos)`
Manages video filtering by score threshold:
- Filters videos based on selected threshold
- Maintains active filter state
- Returns filtered video list

```typescript
const { activeFilter, setFilter, resetFilter, filteredVideos } = useFilters(data.videos);
```

#### `useCountUp(target, duration)`
Animates numbers from 0 to target value:
- Smooth easing animation (ease-out cubic)
- Configurable duration (default 800ms)

```typescript
const animatedCount = useCountUp(totalVideos, 600);
```

#### `useFadeIn(delay)`
Triggers fade-in animation on mount:
- Adds smooth opacity transition
- Configurable delay

```typescript
const fadeIn = useFadeIn(100);
```

## 🎨 Design System

### Color Palette

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary Gradient | `#6D4AFF → #A46DFF` | Header, highlights, buttons |
| Text Primary | `#1C1C1E` | Main text content |
| Text Secondary | `#6E6E73` | Labels, hints |
| Background Base | `#FAFAFA` | App background |
| Background Card | `#FFFFFF` | Card backgrounds |
| Divider | `#E5E5EA` | Borders, separators |
| Good (≥2×) | `#EAB308` | Yellow for good scores |
| Excellent (≥5×) | `#EA580C` | Orange for excellent scores |
| Exceptional (≥10×) | `#DC2626` | Red for exceptional scores |

### Typography

- **Font Family**: SF Pro Display, Inter, system-ui
- **Sizes**:
  - XL: 16px (Headers)
  - LG: 14px (Section titles)
  - Base: 13px (Body text)
  - SM: 12px (Labels, hints)

### Spacing

- XS: 4px
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 20px

### Border Radius

- SM: 8px (Small elements)
- MD: 12px
- LG: 14px (Cards)
- Pill: 20px (Buttons)

### Shadows

- SM: `0 1px 3px rgba(0,0,0,0.05)`
- MD: `0 2px 10px rgba(0,0,0,0.05)` (Cards)
- LG: `0 4px 20px rgba(0,0,0,0.08)`

## 🔄 Data Flow

```
┌─────────────────┐
│   Popup UI      │
│   (React App)   │
└────────┬────────┘
         │ 1. Opens popup
         │ 2. Sends message: GET_CHANNEL_DATA
         ▼
┌─────────────────┐
│  Content Script │
│  (YouTube Tab)  │
└────────┬────────┘
         │ 3. Extracts videos
         │ 4. Calculates scores
         ▼
┌─────────────────┐
│   Core Library  │
│  (Pure Logic)   │
└────────┬────────┘
         │ 5. Returns data
         ▼
┌─────────────────┐
│   Popup UI      │
│  (Updates View) │
└─────────────────┘
```

### Message Format

**Request (from Popup):**
```typescript
{
  type: 'GET_CHANNEL_DATA'
}
```

**Response (from Content Script):**
```typescript
{
  videos: VideoWithScore[],  // Videos with outlier scores
  medianViews: number,        // Median view count
  error: string | null        // Error message if any
}
```

## 🎯 User Interactions

### Filter Buttons
- **Hover**: Slight lift animation + shadow
- **Active**: Filled background with color + larger shadow
- **Click**: Instantly filters video list

### Video Rows
- **Hover**: Light background + slide-right animation
- **Click**: Opens video in new tab
- **Title Truncation**: Full title shown on hover

### Retry Button
- **Hover**: Filled gradient background + lift animation
- **Click**: Refetches data from current tab

## 📊 Statistics Calculation

The popup calculates the following from raw video data:

1. **Total Videos**: Count of all videos on the channel page
2. **Median Views**: Calculated from valid video view counts
3. **Top Score**: Maximum outlier score among all videos
4. **Average Score**: Mean of all outlier scores
5. **Tier Counts**:
   - Good: 2× ≤ score < 5×
   - Excellent: 5× ≤ score < 10×
   - Exceptional: score ≥ 10×

## 🔧 Development

### Building
```bash
npm run build        # Production build
npm run dev          # Watch mode for development
npm run dev:ui       # Popup UI only (localhost)
```

### Testing Locally
1. Build the extension: `npm run build`
2. Open Chrome → Extensions → Load unpacked
3. Select the `/dist` folder
4. Navigate to any YouTube channel's Videos tab
5. Click the extension icon to open the popup

### File Structure
```
packages/popup/
├── src/
│   ├── App.tsx                 # Main app component
│   ├── index.css               # Complete design system
│   ├── main.tsx                # Entry point
│   ├── components/
│   │   ├── Header.tsx          # Title bar
│   │   ├── Footer.tsx          # Version info
│   │   ├── StatsCard.tsx       # Metrics display
│   │   ├── FilterBar.tsx       # Filter buttons
│   │   ├── VideoList.tsx       # Results container
│   │   └── VideoRow.tsx        # Individual video
│   └── hooks/
│       ├── useLiveData.ts      # Data fetching
│       ├── useFilters.ts       # Filter logic
│       └── useAnimations.ts    # Animation helpers
```

## 🚀 Future Enhancements

Potential features to add:
- [ ] Export data to CSV
- [ ] Chart visualization of score distribution
- [ ] Historical tracking (save snapshots)
- [ ] Compare multiple channels
- [ ] Dark mode toggle
- [ ] Custom filter thresholds
- [ ] Video thumbnail previews
- [ ] Search within results

## 📝 Notes

- **Width**: 400px (increased from 320px for better readability)
- **Height**: 500-600px (scrollable if content exceeds)
- **Animation Duration**: 300-800ms (smooth but not sluggish)
- **Chrome API**: Uses `chrome.tabs` and `chrome.runtime.sendMessage`
- **Error Handling**: Graceful fallbacks for non-YouTube pages
- **Performance**: Minimal re-renders with proper React hooks

---

**Version**: 1.0.0  
**Design**: Apple-inspired, minimal, creator-focused  
**Philosophy**: Clean, smart, minimal — but quietly powerful

