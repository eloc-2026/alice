# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Exercise Tracker** - a gamified fitness app that helps users track daily workouts, build streaks, earn points, unlock stickers, and compete with friends. Built with Vite using vanilla JavaScript, modern CSS, and Web Audio API for sound effects.

## Development Commands

```bash
# Start development server (accessible on 0.0.0.0 for remote access)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

- **Entry point**: `index.html` loads `main.js` as an ES module
- **Styling**: Modern CSS with responsive design, no frameworks
- **Tech Stack**: Vite + Vanilla JavaScript (ES6 classes)
- **Data Persistence**: LocalStorage with separate keys for user, sessions, exercises, friends, stickers, and settings
- **Build tool**: Vite handles dev server, hot module replacement, and production builds
- **Server config**: Vite dev server is configured to listen on `0.0.0.0` with `allowedHosts: true` in `vite.config.js`
- **Output**: Production builds are written to `dist/` directory

## Application Structure

### Screens
- **Home/Dashboard**: Streak counter, daily stats, progress bars, motivational messages
- **Exercise Logger**: Exercise type selector, rep counter with tap buttons, optional duration timer
- **Profile**: User stats, level, sticker collection grid
- **Friends**: Leaderboard (sortable by points or streak), add friends feature
- **History**: Past workout sessions with dates and points

### Overlays
- **Success**: Post-workout celebration showing points earned, streak, newly unlocked stickers
- **Sticker Detail**: Shows sticker info, unlock progress, or unlocked status
- **Add Friend**: Simple form to add friends to leaderboard
- **Settings**: Sound toggle, daily/weekly goal customization

### JavaScript Classes

- **`AppState`**: Core data management, handles all localStorage operations, user profile, sessions, exercises, friends, stickers, settings
- **`SessionBuilder`**: Constructs workout sessions before saving, tracks exercises and duration
- **`StatsTracker`**: Static utility class for analytics (streak calculation, activity filtering, exercise breakdown)
- **`AchievementEngine`**: Handles sticker unlock logic, checks conditions, tracks progress
- **`ScreenManager`**: Controls screen navigation, rendering, and overlay display
- **`AnimationController`**: Visual feedback (celebrations, confetti, count-ups, shake effects)
- **`SoundSystem`**: Web Audio API synthesizer for sound effects (log, unlock, streak, level-up)
- **`App`**: Main application controller, event listeners, screen updates, user interactions

## Key Features

### Gamification System
- **Daily Streaks**: Track consecutive days of workouts with fire emoji counter
- **Points System**: Earn points per rep (varies by exercise difficulty), bonus points for daily check-ins and streaks
- **Level System**: Progress through levels based on total points (level = floor(sqrt(totalPoints / 50)) + 1)
- **Sticker Unlocks**: 12 achievement stickers unlocked by meeting conditions (session count, streak milestones, exercise totals, point thresholds, variety)
- **Friend Leaderboard**: Add friends and compete on points or streak rankings

### Exercise Tracking
- **6 Default Exercises**: Push-ups (1 pt), Pull-ups (2 pts), Squats (1 pt), Sit-ups (1 pt), Plank (2 pts/sec), Burpees (3 pts)
- **Rep Counter**: Quick tap buttons (+1, +5, +10, -1, -5, -10) for fast logging
- **Session Builder**: Log multiple exercises in one session before completing
- **Optional Timer**: Track total workout duration

### Data Model (LocalStorage)

**Keys**:
- `exerciseTrackerUser`: User profile (name, totalPoints, currentStreak, longestStreak, level, unlockedStickers, joinedDate, lastCheckIn)
- `exerciseTrackerSessions`: Array of workout sessions (id, date, exercises, totalPoints, duration, notes)
- `exerciseTrackerExercises`: Exercise library object (type → {name, icon, pointsPerRep, category})
- `exerciseTrackerFriends`: Array of friends (id, name, totalPoints, currentStreak, level, lastSeen)
- `exerciseTrackerStickers`: Sticker/achievement definitions (id → {name, description, icon, condition})
- `exerciseTrackerSettings`: App settings (soundMuted, dailyGoal, weeklyGoal, theme)

## Motivation & Psychology

- **Streak Counter**: Prominently displayed to leverage loss aversion (don't break the streak!)
- **Progress Bars**: Daily and weekly goals with visual progress tracking
- **Motivational Messages**: Dynamic messages based on activity and goals
- **Celebratory Animations**: Confetti on sticker unlock, count-up animations for points
- **Immediate Feedback**: Sounds and visual effects for every action
- **Social Comparison**: Friend leaderboard for healthy competition

## UI/UX Patterns

- **Screen-based Navigation**: Bottom navigation bar with Home, Profile, Friends, History
- **Modal Overlays**: Float above screens for success, sticker detail, settings, add friend
- **Responsive Design**: Mobile-first approach with responsive grids and flexible layouts
- **Color Scheme**: Dark green-tinted theme (#0a1510 background) with emerald green (#10b981) and cyan blue (#06b6d4) accents
- **Accessibility**: Keyboard navigation support, reduced motion support, high contrast support

## Development Notes

- **No Framework**: Pure vanilla JavaScript with ES6 classes
- **No Backend**: All data stored locally in localStorage (friend sync is local-only)
- **Defensive Data Handling**: Try/catch wrapped localStorage operations with fallbacks
- **Event Delegation**: Sticker grid uses event delegation for dynamic elements
- **Audio Context**: Initialized on first user click due to browser autoplay policies
- **Session Management**: Sessions must have at least one exercise to be completed
