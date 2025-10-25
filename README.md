# YouTube Outlier Score Calculator

A Chrome extension that calculates and displays outlier scores for YouTube videos based on view counts.

## Architecture

This project follows a modular, monorepo-like architecture with clear separation of concerns:

- **`packages/core`**: Pure TypeScript business logic (view parsing, outlier score calculation)
- **`packages/content-script`**: DOM interaction layer for YouTube pages
- **`packages/popup`**: React-based extension popup UI
- **`packages/ui`**: Shared React component library
- **`packages/background`**: Chrome extension background service worker

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5
- **Bundler**: Vite 5
- **Manifest**: Chrome Manifest V3

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd YTOSC
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

#### Option 1: UI Development (Recommended for UI work)

The fastest way to work on the popup UI with hot module reloading:

```bash
npm run dev:ui
```

This will:
- Start a dev server at `http://localhost:3000`
- Open the popup UI in your browser
- Enable hot module reloading (instant updates on save)
- Mock Chrome APIs for development

**Perfect for:** Styling, layout, and React component development

#### Option 2: Full Extension Development

For testing the complete extension with content scripts:

1. Start the development build with watch mode:
   ```bash
   npm run dev
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. The extension will automatically rebuild when you make changes. You'll need to:
   - Click the reload icon on the extension card in `chrome://extensions/`
   - Or reload the YouTube page to see content script updates

### Production Build

Build the extension for production:
```bash
npm run build
```

The built extension will be in the `dist` folder.

## Project Structure

```
YTOSC/
├── packages/
│   ├── core/              # Business logic (pure TypeScript)
│   ├── content-script/    # YouTube DOM interaction
│   ├── popup/             # Extension popup UI (React)
│   ├── ui/                # Shared React components
│   └── background/        # Service worker
├── manifest.json          # Chrome extension manifest
├── vite.config.ts         # Vite bundler configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Workspace configuration
```

## Development Scripts

- `npm run dev:ui` - **Start UI dev server** (Hot reload, opens in browser)
- `npm run dev` - Build extension with watch mode
- `npm run build` - Build for production
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Features

### Core Functionality
- **Outlier Score Calculation**: Analyzes each video's view count against its neighboring videos (5 before + 5 after)
- **Smart Edge Handling**: Automatically adjusts neighbor selection for videos at the start/end of a channel
- **International Support**: Parses view counts in multiple formats (1.2K, 12M, 1,5M, etc.) across different languages
- **Member-Only & Scheduled Videos**: Automatically excludes videos without public view counts from calculations

### Visual Display
- **Color-Coded Badges**: Videos are marked with gradient badges based on their outlier score:
  - 🥇 Gold: 10x+ the median
  - 🥈 Silver: 5x-10x the median
  - 🥉 Bronze: 2x-5x the median
  - Default: Below 2x
- **In-Page Injection**: Badges appear directly on video titles on YouTube channel pages

### Filtering
- **Filter by Threshold**: Show only videos above 2x, 5x, or 10x the median
- **Automatic Sorting**: Filtered results are sorted by outlier score (highest first)
- **Reset Filter**: Return to viewing all videos

## How to Test

1. **Build the extension** (if not already done):
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Test on YouTube**:
   - Navigate to any YouTube channel (e.g., https://www.youtube.com/@mkbhd)
   - Click on the "Videos" tab
   - Wait ~1.5 seconds for the extension to analyze videos
   - You should see colored badges (e.g., "2.3x") appear before each video title

4. **Test Filtering**:
   - Click the extension icon in Chrome toolbar
   - Click "> 2x", "> 5x", or "> 10x" buttons
   - Videos below the threshold will be hidden
   - Remaining videos will be sorted by score (descending)
   - Click "Reset Filter" to show all videos again

## Outlier Score Formula

```
outlier_score = video_views / median(5 videos before + 5 videos after)
```

**Edge Cases**:
- If fewer than 10 neighbors exist, the algorithm uses all available videos
- Videos without view counts (member-only, scheduled, etc.) are excluded from median calculation
- If a video is at the start/end of the list, more neighbors are taken from the opposite side

## Troubleshooting

### Badges not appearing?
- Make sure you're on a YouTube channel's "Videos" tab (not Home, Shorts, or Live)
- Wait a few seconds for YouTube's dynamic content to load
- Check browser console for any errors (F12 → Console)

### Filtering not working?
- Ensure you're clicking the extension icon and selecting a filter
- Refresh the YouTube page and wait for badges to appear
- Check that the extension has the required permissions in `chrome://extensions/`

### Build errors?
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Try `npm run build` again

## Development Notes

### Adding New Features
- **Core logic**: Edit files in `packages/core/src/`
- **YouTube integration**: Edit `packages/content-script/src/index.ts`
- **Popup UI**: Edit files in `packages/popup/src/`
- **Shared components**: Edit files in `packages/ui/src/`

### Type Safety
All packages are written in TypeScript with strict type checking. Run `npm run type-check` to verify types without building.

### Code Quality
- ESLint for linting: `npm run lint`
- Prettier for formatting: `npm run format`

## License

MIT
