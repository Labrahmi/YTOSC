# YouTube Outlier Score Calculator

A Chrome extension that analyzes YouTube channel videos and highlights outliers based on view count performance compared to neighboring videos.

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Build the extension**: `npm run build`
3. **Load in Chrome**: Open `chrome://extensions/`, enable Developer mode, and load the `dist` folder
4. **Test on YouTube**: Navigate to any YouTube channel's "Videos" tab to see outlier score badges

## 🏗️ Architecture

This project uses a modular monorepo architecture with clear separation of concerns:

- **`packages/core`**: Pure TypeScript business logic (view parsing, type definitions)
- **`packages/content-script`**: YouTube DOM interaction and score calculation
- **`packages/popup`**: React-based extension popup UI
- **`packages/ui`**: Shared React component library
- **`packages/background`**: Chrome extension service worker

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5
- **Bundler**: Vite 5
- **Manifest**: Chrome Manifest V3

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm

### Development Setup

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd YTOSC
   npm install
   ```

2. **Choose your development mode**:

   **UI Development** (Recommended for UI work):
   ```bash
   npm run dev:ui
   ```
   - Opens popup UI at `http://localhost:3000`
   - Hot module reloading
   - Mock Chrome APIs

   **Full Extension Development**:
   ```bash
   npm run dev
   ```
   - Build extension with watch mode
   - Load `dist` folder in `chrome://extensions/`
   - Full integration testing

### Production Build
```bash
npm run build
```

## 📁 Project Structure

```
YTOSC/
├── packages/
│   ├── core/              # Pure TypeScript (types, view parsing)
│   ├── content-script/    # YouTube DOM interaction & scoring
│   ├── popup/             # React popup UI
│   ├── ui/                # Shared React components
│   └── background/        # Chrome service worker
├── manifest.json          # Extension manifest
├── vite.config.ts         # Build configuration
└── package.json           # Workspace config
```

## 🎯 Key Features

- **🧮 Outlier Score Calculation**: Analyzes each video against 5 videos before + 5 after
- **🌍 International Support**: Parses view counts in multiple languages (1.2K, 12M, etc.)
- **🎨 Visual Badges**: Color-coded badges (🥇 Gold: 10x+, 🥈 Silver: 5x-10x, 🥉 Bronze: 2x-5x)
- **🔍 Smart Filtering**: Show only videos above thresholds (2x, 5x, 10x median)
- **📱 Automatic Sorting**: Filtered results sorted by score (highest first)

## 🧪 Testing

1. **Build the extension**: `npm run build`
2. **Load in Chrome**: `chrome://extensions/` → "Load unpacked" → select `dist` folder
3. **Test on YouTube**: Visit any channel's "Videos" tab (e.g., youtube.com/@mkbhd/videos)
4. **Verify badges**: Colored badges appear on video titles after ~1.5 seconds
5. **Test filtering**: Click extension icon → use "> 2x", "> 5x", "> 10x" buttons

## 🧮 Algorithm

**Formula**: `outlier_score = video_views / median(5 videos before + 5 videos after)`

**Edge Cases**:
- Videos at start/end automatically adjust neighbor selection
- Member-only/scheduled videos excluded from calculations
- Channels with <10 videos use all available neighbors

## 🚀 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:ui` | Start UI dev server (hot reload) |
| `npm run dev` | Build extension with watch mode |
| `npm run build` | Production build |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |
| `npm test` | Run tests |

## 🐛 Troubleshooting

**Badges not appearing?**
- Ensure you're on a YouTube channel's "Videos" tab
- Wait ~1.5 seconds for analysis to complete
- Check browser console (F12) for errors

**Filtering not working?**
- Click extension icon and select a filter
- Refresh YouTube page and wait for badges
- Verify extension permissions in `chrome://extensions/`

**Build issues?**
- Delete `node_modules` and `dist` folders
- Run `npm install` and `npm run build`

## 📄 License

MIT

---

**Ready to demonstrate?** Load the built extension from `dist/` and show off those outlier scores! 🎬
