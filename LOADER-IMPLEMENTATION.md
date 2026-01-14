# Smart Loader Implementation

## Overview
Added a modern loader that displays for exactly 3 seconds on first visit while content loads in the background.

## Features

### ⏱️ Fixed Timing
- **Exact 3-second display**: Loader shows for precisely 3 seconds
- **Background loading**: Products and categories load while loader is visible
- **Smooth transition**: Content is ready when loader disappears
- **Session-based**: Shows only once per browser session

### 🎨 Visual Design
- **Gradient background**: Smooth green-to-white gradient (z-index: 100)
- **Animated shopping bag icon**: Bouncing animation in gradient card
- **App branding**: "Shree Grocery Mart" with gradient text
- **Loading dots**: Three bouncing dots with staggered animation
- **Progress bar**: 3-second animated progress indicator
- **Smooth fade-out**: 500ms transition when hiding

### 💾 Session Management
- **sessionStorage tracking**: Shows only once per browser session
- **Respects user**: Won't show again after first load in same session
- **New tab/window**: Will show again in new browser tabs

## Technical Implementation

### Files Modified
1. **components/AppLoader.tsx** - Main loader component (z-index: 100)
2. **app/layout.tsx** - Added loader to root layout
3. **app/page.tsx** - Fetches data immediately on mount

### How It Works
```
Timeline:
0ms:   - User opens app
       - Loader displays (visible)
       - Background: Header/Footer render
       - Background: API calls start (products, categories, banners)

0-3000ms:
       - Loader shows with animated progress bar
       - Background: Data fetches and renders behind loader
       - Content builds in DOM (invisible under loader)

3000ms:
       - Loader fades out (500ms transition)
       - Fully rendered content revealed
       - sessionStorage flag set

Next visit (same session):
       - Loader hidden instantly
       - Content displays immediately
```

### Z-Index Structure
```
z-100:  AppLoader (covers everything during first 3 seconds)
z-10:   Content (Header, Pages, Footer, BottomNav)
z-0:    BackgroundPattern
```

### Integration
```typescript
// app/page.tsx - Starts loading immediately
useEffect(() => {
  setMounted(true)
  fetchData() // Fetches while loader shows
}, [])
```

## User Experience
- **First visit (new session)**: 
  - Loader shows for 3 seconds
  - Content loads in background
  - Smooth reveal of fully loaded page
  
- **Same session**: 
  - No loader (instant display)
  - sessionStorage prevents re-show
  
- **New session/tab**: 
  - Loader shows again
  - Fresh experience for new visits

## Performance
- Content renders immediately (not blocked by loader)
- API calls start on component mount
- 3-second window ensures content is ready
- Zero impact after first load (early return)
- Efficient cleanup on unmount

## Customization
Adjust timing in `AppLoader.tsx`:
```typescript
const timer = setTimeout(() => {
  setIsVisible(false)
  sessionStorage.setItem('hasVisited', 'true')
}, 3000) // Change this value (in milliseconds)
```

Progress bar animation in CSS:
```css
.animate-progress {
  animation: progress 3s ease-out forwards; // Match timer duration
}
```

