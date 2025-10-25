# YouTube Outlier Score - Popup Visual Preview

## 🎨 Complete Visual Layout

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  YouTube Outlier Score                 ┃  ← Purple gradient header
┃  Analyze your video performance        ┃     (#6D4AFF → #A46DFF)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
┌────────────────────────────────────────┐
│ 🔹 Live Channel Snapshot               │  ← White card with shadow
│                                        │
│  Videos analyzed    Median views       │  ← 2×2 grid
│  54                 23.1K              │     Animated numbers
│                                        │
│  Top outlier        Avg score          │
│  12.4×              3.6×               │  ← Gradient highlight
│                                        │
│  ─────────────────────────────────     │  ← Divider line
│  Exceptional: 5 | Excellent: 9 | Good  │  ← Color-coded counts
│                                        │     Red  | Orange | Yellow
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 🎯 Filter Videos                       │  ← White card with shadow
│                                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌─────┐         │  ← Pill-shaped buttons
│  │≥2× │ │≥5× │ │≥10×│ │Reset│         │     Colored borders
│  │Good│ │Exc.│ │Exp.│ │     │         │     Active state = filled
│  └────┘ └────┘ └────┘ └─────┘         │
│   🟡     🟠     🔴      ⚪            │  ← Color indicators
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 📈 Top Results        (54 videos)      │  ← White card with shadow
│                                        │
│  1.  12.4× | How I Built My Studio    │  ← Clickable rows
│  2.  8.9×  | 100 Days of Shorts       │     Hover effect
│  3.  6.1×  | Lighting Tutorial        │     Color-coded scores
│  4.  5.2×  | My Favorite Gear         │
│  5.  4.8×  | Behind the Scenes        │
│  6.  3.7×  | Camera Settings Guide    │
│  7.  3.2×  | Editing Workflow         │
│  8.  2.9×  | Q&A Session              │
│  9.  2.4×  | Studio Tour              │
│  10. 2.1×  | Monthly Vlog             │
│                                        │
│      +44 more videos                   │  ← More indicator
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ ℹ️  Data updates from current tab·v1.0│  ← Footer
└────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
```
┌──────────────────┐
│  Header          │  #6D4AFF → #A46DFF (Gradient)
└──────────────────┘

┌──────────────────┐
│  Background      │  #FAFAFA (Soft gray)
└──────────────────┘

┌──────────────────┐
│  Cards           │  #FFFFFF (White)
└──────────────────┘
```

### Score Colors
```
🟡 Good (≥2×)        #EAB308 (Yellow)
🟠 Excellent (≥5×)   #EA580C (Orange)
🔴 Exceptional (≥10×) #DC2626 (Red)
```

### Text Colors
```
███ Primary Text    #1C1C1E (Near-black)
███ Secondary Text  #6E6E73 (Gray)
███ Dividers        #E5E5EA (Light gray)
```

---

## 🎬 Animation Showcase

### On Popup Open
```
Frame 1:  Opacity: 0%    ┌───────────┐
                         │           │  ← Invisible
                         └───────────┘

Frame 2:  Opacity: 50%   ┌───────────┐
                         │    fade   │  ← Fading in
                         └───────────┘

Frame 3:  Opacity: 100%  ┌───────────┐
                         │  visible  │  ← Fully visible
                         └───────────┘

Duration: 300ms
```

### Number Count-Up
```
Frame 1:  0              ← Start at zero
Frame 2:  12
Frame 3:  27
Frame 4:  45
Frame 5:  54             ← Reach target

Duration: 600-800ms
Easing: Ease-out cubic
```

### Filter Button Hover
```
Normal:   ┌────┐         Border: #EAB308
          │≥2× │         Background: transparent
          └────┘

Hover:    ┌────┐         Border: #EAB308
          │≥2× │  ↑      Background: rgba(234,179,8,0.1)
          └────┘         Transform: translateY(-1px)
                         Shadow: 0 1px 3px rgba(0,0,0,0.05)

Active:   ┌────┐         Border: #EAB308
          │≥2× │  ↑↑     Background: rgba(234,179,8,0.1)
          └────┘         Transform: translateY(-2px)
                         Shadow: 0 2px 10px rgba(0,0,0,0.05)
```

### Video Row Hover
```
Normal:   1.  12.4× | How I Built My Studio
          ────────────────────────────────

Hover:    1.  12.4× | How I Built My Studio →
          ████████████████████████████████
          Background: #FAFAFA
          Transform: translateX(2px)
```

---

## 📐 Dimensions & Spacing

```
┌─ 400px ──────────────────────────────┐
│                                      │
│  Header: 20px padding                │  ↕ ~60px
│                                      │
├──────────────────────────────────────┤
│  ↕ 16px gap                          │
│                                      │
│  Card 1: Stats                       │  ↕ ~140px
│  Padding: 16px                       │
│  Border-radius: 14px                 │
│  Shadow: 0 2px 10px rgba(0,0,0,0.05) │
│                                      │
│  ↕ 16px gap                          │
│                                      │
│  Card 2: Filters                     │  ↕ ~90px
│  Padding: 16px                       │
│                                      │
│  ↕ 16px gap                          │
│                                      │
│  Card 3: Videos                      │  ↕ ~280px
│  Padding: 16px                       │  (scrollable)
│  Overflow-y: auto                    │
│                                      │
│  ↕ 16px gap                          │
│                                      │
├──────────────────────────────────────┤
│  Footer: 12px padding                │  ↕ ~35px
│                                      │
└──────────────────────────────────────┘
Total: 500-600px (max-height with scroll)
```

---

## 🔮 State Variations

### Loading State
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  YouTube Outlier Score                 ┃
┃  Analyze your video performance        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

            ◠◡◠◡◠
           Loading...                 ← Spinning animation
      
     Loading channel data...
```

### Error State
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  YouTube Outlier Score                 ┃
┃  Analyze your video performance        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

              ⚠️

     Not a YouTube page              ← Error message
      
   Visit a YouTube channel's         ← Helpful hint
   Videos tab to see analytics.

        ┌─────────┐
        │  Retry  │                  ← Retry button
        └─────────┘
```

### Empty Filter State
```
┌────────────────────────────────────────┐
│ 📈 Top Results        (0 videos)       │
│                                        │
│                                        │
│  No videos found matching your filter. │  ← Empty state
│                                        │
│                                        │
└────────────────────────────────────────┘
```

---

## 🎯 Interactive Elements

### Clickable Areas
```
┌────────────────────────────────────────┐
│ [Click]  12.4× | How I Built My...     │  → Opens video
│ [Hover]  8.9×  | 100 Days of Short...  │  → Shows full title
│          6.1×  | Lighting Tutorial     │
└────────────────────────────────────────┘

┌────┐ ┌────┐ ┌────┐ ┌─────┐
│≥2× │ │≥5× │ │≥10×│ │Reset│              → Filters instantly
└────┘ └────┘ └────┘ └─────┘
[Click to filter]

┌─────────┐
│  Retry  │                              → Refetches data
└─────────┘
[Click on error]
```

### Tooltips
```
┌────┐
│≥2× │  ← Hover shows: "54 videos with score ≥2×"
└────┘

12.4× | How I Built My Studio Setup...
       ← Hover shows full title
```

---

## 📱 Responsive Behavior

### Scrolling
```
┌────────────────────┐
│ Video 1            │  ← Visible
│ Video 2            │
│ Video 3            │
│ Video 4            │
│ Video 5            │
├────────────────────┤  ← Scroll boundary
│ Video 6            │  ↓ Scroll down
│ Video 7            │
│ ...                │
│ +44 more           │  ← More indicator
└────────────────────┘

Custom scrollbar:
  - Width: 6px
  - Color: #E5E5EA
  - Hover: #6E6E73
```

---

## 🎨 Design Philosophy

**"Clean, smart, minimal — but quietly powerful"**

1. **Clean**: White cards on soft gray, clear hierarchy
2. **Smart**: Real-time data, intelligent filtering, helpful errors
3. **Minimal**: No clutter, essential info only, breathing room
4. **Powerful**: Full analytics, sorting, filtering, quick access

---

**Dimensions**: 400×500-600px  
**Design System**: Apple-inspired  
**Color Scheme**: Purple primary with tier colors  
**Typography**: SF Pro Display / Inter  
**Animations**: 300-800ms smooth transitions

