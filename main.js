// ========================================
// CONSTANTS & DEFAULT DATA
// ========================================

const STORAGE_KEYS = {
  USER: 'exerciseTrackerUser',
  SESSIONS: 'exerciseTrackerSessions',
  EXERCISES: 'exerciseTrackerExercises',
  FRIENDS: 'exerciseTrackerFriends',
  STICKERS: 'exerciseTrackerStickers',
  SETTINGS: 'exerciseTrackerSettings'
};

const DEFAULT_EXERCISES = {
  "push-ups": { name: "Push-ups", icon: "💪", pointsPerRep: 1, category: "upper-body" },
  "pull-ups": { name: "Pull-ups", icon: "🏋️", pointsPerRep: 2, category: "upper-body" },
  "squats": { name: "Squats", icon: "🦵", pointsPerRep: 1, category: "lower-body" },
  "sit-ups": { name: "Sit-ups", icon: "🔥", pointsPerRep: 1, category: "core" },
  "plank": { name: "Plank", icon: "⏱️", pointsPerRep: 2, category: "core", unit: "seconds" },
  "burpees": { name: "Burpees", icon: "⚡", pointsPerRep: 3, category: "full-body" }
};

const DEFAULT_STICKERS = {
  "first-workout": {
    name: "First Steps",
    description: "Complete your first workout",
    icon: "🌟",
    condition: { type: "session-count", value: 1 }
  },
  "streak-7": {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    condition: { type: "streak", value: 7 }
  },
  "streak-30": {
    name: "Monthly Master",
    description: "30-day streak",
    icon: "💎",
    condition: { type: "streak", value: 30 }
  },
  "100-pushups": {
    name: "Century Club",
    description: "100 total push-ups",
    icon: "💯",
    condition: { type: "exercise-total", exercise: "push-ups", value: 100 }
  },
  "50-pullups": {
    name: "Pull-up Pro",
    description: "50 total pull-ups",
    icon: "🎯",
    condition: { type: "exercise-total", exercise: "pull-ups", value: 50 }
  },
  "points-1000": {
    name: "Bronze Champion",
    description: "Earn 1,000 points",
    icon: "🥉",
    condition: { type: "total-points", value: 1000 }
  },
  "points-5000": {
    name: "Silver Champion",
    description: "Earn 5,000 points",
    icon: "🥈",
    condition: { type: "total-points", value: 5000 }
  },
  "points-10000": {
    name: "Gold Champion",
    description: "Earn 10,000 points",
    icon: "🥇",
    condition: { type: "total-points", value: 10000 }
  },
  "variety-5": {
    name: "Variety Master",
    description: "Do 5 different exercises in one week",
    icon: "🎨",
    condition: { type: "variety-weekly", value: 5 }
  },
  "sessions-10": {
    name: "Dedicated",
    description: "Complete 10 workouts",
    icon: "💪",
    condition: { type: "session-count", value: 10 }
  },
  "sessions-50": {
    name: "Committed",
    description: "Complete 50 workouts",
    icon: "🏆",
    condition: { type: "session-count", value: 50 }
  },
  "sessions-100": {
    name: "Legendary",
    description: "Complete 100 workouts",
    icon: "👑",
    condition: { type: "session-count", value: 100 }
  }
};

const DEFAULT_USER = {
  name: "Athlete",
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  level: 1,
  unlockedStickers: [],
  joinedDate: new Date().toISOString(),
  lastCheckIn: null
};

const DEFAULT_SETTINGS = {
  soundMuted: false,
  dailyGoal: 50,
  weeklyGoal: 500,
  theme: "dark"
};

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateDayDifference(date1String, date2String) {
  const d1 = new Date(date1String);
  const d2 = new Date(date2String);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

// ========================================
// CLASSES
// ========================================

class SessionBuilder {
  constructor() {
    this.exercises = [];
    this.startTime = null;
    this.totalPoints = 0;
  }

  start() {
    this.startTime = new Date();
  }

  addExercise(type, reps, points) {
    this.exercises.push({ type, reps, points });
    this.totalPoints += points;
  }

  removeExercise(index) {
    if (index >= 0 && index < this.exercises.length) {
      this.totalPoints -= this.exercises[index].points;
      this.exercises.splice(index, 1);
    }
  }

  calculateTotal() {
    return this.totalPoints;
  }

  getDuration() {
    if (!this.startTime) return 0;
    return Math.floor((new Date() - this.startTime) / 1000);
  }

  build() {
    return {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      exercises: [...this.exercises],
      totalPoints: this.totalPoints,
      duration: this.getDuration(),
      notes: ""
    };
  }
}

class StatsTracker {
  static calculateStreak(sessions, today = new Date()) {
    if (!sessions || sessions.length === 0) return 0;

    // Sort sessions by date descending
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get unique workout dates
    const workoutDates = [...new Set(sortedSessions.map(s => s.date.split('T')[0]))];

    if (workoutDates.length === 0) return 0;

    const todayStr = today.toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date(todayStr);

    for (let i = 0; i < workoutDates.length; i++) {
      const workoutDateStr = workoutDates[i];
      const daysDiff = calculateDayDifference(workoutDateStr, checkDate.toISOString().split('T')[0]);

      if (daysDiff === 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (daysDiff === 1 && streak === 0) {
        // If we haven't worked out today but did yesterday, count from yesterday
        checkDate = new Date(workoutDateStr);
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  static getTodaysActivity(sessions) {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter(s => s.date.split('T')[0] === today);
  }

  static getWeeklyActivity(sessions) {
    const weekStart = getWeekStart();
    return sessions.filter(s => new Date(s.date) >= weekStart);
  }

  static getExerciseBreakdown(sessions) {
    const breakdown = {};
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (!breakdown[exercise.type]) {
          breakdown[exercise.type] = 0;
        }
        breakdown[exercise.type] += exercise.reps;
      });
    });
    return breakdown;
  }

  static getPersonalRecords(sessions) {
    const records = {};
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (!records[exercise.type] || exercise.reps > records[exercise.type]) {
          records[exercise.type] = exercise.reps;
        }
      });
    });
    return records;
  }
}

class AchievementEngine {
  constructor(stickers, user, sessions) {
    this.stickers = stickers;
    this.user = user;
    this.sessions = sessions;
  }

  checkAllConditions() {
    const newlyUnlocked = [];

    Object.keys(this.stickers).forEach(stickerId => {
      if (!this.user.unlockedStickers.includes(stickerId)) {
        if (this.checkCondition(this.stickers[stickerId])) {
          newlyUnlocked.push(stickerId);
          this.unlockSticker(stickerId);
        }
      }
    });

    return newlyUnlocked;
  }

  checkCondition(sticker) {
    const { condition } = sticker;

    switch (condition.type) {
      case 'session-count':
        return this.sessions.length >= condition.value;

      case 'streak':
        return this.user.currentStreak >= condition.value;

      case 'exercise-total': {
        const breakdown = StatsTracker.getExerciseBreakdown(this.sessions);
        return (breakdown[condition.exercise] || 0) >= condition.value;
      }

      case 'total-points':
        return this.user.totalPoints >= condition.value;

      case 'variety-weekly': {
        const weekSessions = StatsTracker.getWeeklyActivity(this.sessions);
        const uniqueExercises = new Set();
        weekSessions.forEach(session => {
          session.exercises.forEach(ex => uniqueExercises.add(ex.type));
        });
        return uniqueExercises.size >= condition.value;
      }

      default:
        return false;
    }
  }

  unlockSticker(stickerId) {
    if (!this.user.unlockedStickers.includes(stickerId)) {
      this.user.unlockedStickers.push(stickerId);
    }
  }

  getProgress(stickerId) {
    const sticker = this.stickers[stickerId];
    if (!sticker) return 0;

    const { condition } = sticker;
    let current = 0;

    switch (condition.type) {
      case 'session-count':
        current = this.sessions.length;
        break;

      case 'streak':
        current = this.user.currentStreak;
        break;

      case 'exercise-total': {
        const breakdown = StatsTracker.getExerciseBreakdown(this.sessions);
        current = breakdown[condition.exercise] || 0;
        break;
      }

      case 'total-points':
        current = this.user.totalPoints;
        break;

      case 'variety-weekly': {
        const weekSessions = StatsTracker.getWeeklyActivity(this.sessions);
        const uniqueExercises = new Set();
        weekSessions.forEach(session => {
          session.exercises.forEach(ex => uniqueExercises.add(ex.type));
        });
        current = uniqueExercises.size;
        break;
      }
    }

    return Math.min(100, Math.floor((current / condition.value) * 100));
  }

  getNextToUnlock(limit = 3) {
    const locked = Object.keys(this.stickers)
      .filter(id => !this.user.unlockedStickers.includes(id))
      .map(id => ({
        id,
        ...this.stickers[id],
        progress: this.getProgress(id)
      }))
      .sort((a, b) => b.progress - a.progress);

    return locked.slice(0, limit);
  }
}

class AppState {
  constructor() {
    this.user = null;
    this.sessions = [];
    this.exercises = {};
    this.friends = [];
    this.stickers = {};
    this.settings = {};
    this.currentSession = null;
  }

  init() {
    this.loadUserProfile();
    this.loadSessions();
    this.loadExercises();
    this.loadStickers();
    this.loadFriends();
    this.loadSettings();
  }

  loadUserProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      this.user = stored ? JSON.parse(stored) : { ...DEFAULT_USER };
    } catch (e) {
      console.error('Failed to load user profile:', e);
      this.user = { ...DEFAULT_USER };
    }
  }

  saveUserProfile() {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  }

  loadSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      this.sessions = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load sessions:', e);
      this.sessions = [];
    }
  }

  saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  }

  loadExercises() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      this.exercises = stored ? JSON.parse(stored) : { ...DEFAULT_EXERCISES };
    } catch (e) {
      console.error('Failed to load exercises:', e);
      this.exercises = { ...DEFAULT_EXERCISES };
    }
  }

  loadStickers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STICKERS);
      this.stickers = stored ? JSON.parse(stored) : { ...DEFAULT_STICKERS };
    } catch (e) {
      console.error('Failed to load stickers:', e);
      this.stickers = { ...DEFAULT_STICKERS };
    }
  }

  loadFriends() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      this.friends = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load friends:', e);
      this.friends = [];
    }
  }

  saveFriends() {
    try {
      localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(this.friends));
    } catch (e) {
      console.error('Failed to save friends:', e);
    }
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.error('Failed to load settings:', e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  startSession() {
    this.currentSession = new SessionBuilder();
    this.currentSession.start();
  }

  addExerciseToSession(type, reps) {
    if (!this.currentSession) {
      this.startSession();
    }

    const exercise = this.exercises[type];
    if (!exercise) return;

    const points = this.calculatePoints(type, reps);
    this.currentSession.addExercise(type, reps, points);
  }

  completeSession() {
    if (!this.currentSession || this.currentSession.exercises.length === 0) {
      return null;
    }

    const session = this.currentSession.build();
    this.sessions.push(session);
    this.saveSessions();

    // Update user stats
    this.user.totalPoints += session.totalPoints;
    this.updateStreak();
    this.user.level = this.calculateLevel(this.user.totalPoints);

    // Check for unlocked stickers
    const achievementEngine = new AchievementEngine(this.stickers, this.user, this.sessions);
    const newStickers = achievementEngine.checkAllConditions();

    this.saveUserProfile();

    // Reset current session
    this.currentSession = null;

    return { session, newStickers };
  }

  cancelSession() {
    this.currentSession = null;
  }

  calculatePoints(exerciseType, reps) {
    const exercise = this.exercises[exerciseType];
    if (!exercise) return 0;

    let points = reps * exercise.pointsPerRep;

    // Bonus for first workout today
    const todaysSessions = StatsTracker.getTodaysActivity(this.sessions);
    if (todaysSessions.length === 0 && (!this.currentSession || this.currentSession.exercises.length === 0)) {
      points += 10;
    }

    // Streak bonus
    if (this.user.currentStreak > 0) {
      const streakBonus = Math.min(this.user.currentStreak * 5, 50);
      points += streakBonus;
    }

    return points;
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = this.user.lastCheckIn ? this.user.lastCheckIn.split('T')[0] : null;

    if (!lastCheckIn) {
      this.user.currentStreak = 1;
    } else {
      const daysSinceLastCheckIn = calculateDayDifference(lastCheckIn, today);

      if (daysSinceLastCheckIn === 0) {
        // Same day, no change to streak
      } else if (daysSinceLastCheckIn === 1) {
        // Next day, increment streak
        this.user.currentStreak += 1;
      } else {
        // Missed days, reset streak
        this.user.currentStreak = 1;
      }
    }

    this.user.lastCheckIn = new Date().toISOString();
    this.user.longestStreak = Math.max(this.user.longestStreak, this.user.currentStreak);
  }

  checkStickerUnlocks() {
    const achievementEngine = new AchievementEngine(this.stickers, this.user, this.sessions);
    return achievementEngine.checkAllConditions();
  }

  calculateLevel(totalPoints) {
    return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
  }

  getTodaysPoints() {
    const todaysSessions = StatsTracker.getTodaysActivity(this.sessions);
    return todaysSessions.reduce((sum, session) => sum + session.totalPoints, 0);
  }

  getWeeklyPoints() {
    const weeklySessions = StatsTracker.getWeeklyActivity(this.sessions);
    return weeklySessions.reduce((sum, session) => sum + session.totalPoints, 0);
  }

  getExerciseTotal(exerciseType) {
    const breakdown = StatsTracker.getExerciseBreakdown(this.sessions);
    return breakdown[exerciseType] || 0;
  }

  getPersonalRecords() {
    return StatsTracker.getPersonalRecords(this.sessions);
  }
}

class ScreenManager {
  constructor() {
    this.screens = {
      home: document.getElementById('homeScreen'),
      logger: document.getElementById('loggerScreen'),
      profile: document.getElementById('profileScreen'),
      friends: document.getElementById('friendsScreen'),
      history: document.getElementById('historyScreen')
    };

    this.overlays = {
      success: document.getElementById('successOverlay'),
      sticker: document.getElementById('stickerOverlay'),
      addFriend: document.getElementById('addFriendOverlay'),
      settings: document.getElementById('settingsOverlay')
    };

    this.currentScreen = 'home';
  }

  showScreen(name) {
    this.hideAllScreens();
    if (this.screens[name]) {
      this.screens[name].classList.remove('hidden');
      this.currentScreen = name;
      this.updateNavigation(name);
    }
  }

  hideAllScreens() {
    Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
  }

  showOverlay(name) {
    if (this.overlays[name]) {
      this.overlays[name].classList.remove('hidden');
    }
  }

  hideOverlay(name) {
    if (this.overlays[name]) {
      this.overlays[name].classList.add('hidden');
    }
  }

  updateNavigation(screenName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.screen === screenName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateStreakDisplay(streak) {
    const streakCount = document.getElementById('streakCount');
    if (streakCount) {
      streakCount.textContent = streak;
    }
  }

  updateProgressBar(elementId, current, goal) {
    const progressBar = document.getElementById(elementId);
    const progressText = document.getElementById(elementId + 'Text');

    if (progressBar) {
      const percentage = Math.min(100, Math.floor((current / goal) * 100));
      progressBar.style.width = percentage + '%';

      if (progressText) {
        progressText.textContent = `${current}/${goal}`;
      }
    }
  }

  renderStickerGrid(stickers, unlockedIds) {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;

    grid.innerHTML = '';

    Object.keys(stickers).forEach(id => {
      const sticker = stickers[id];
      const isUnlocked = unlockedIds.includes(id);

      const card = document.createElement('div');
      card.className = `sticker-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.dataset.stickerId = id;

      const icon = document.createElement('div');
      icon.className = 'sticker-icon';
      icon.textContent = sticker.icon;

      const name = document.createElement('div');
      name.className = 'sticker-name';
      name.textContent = sticker.name;

      if (!isUnlocked) {
        const lock = document.createElement('span');
        lock.className = 'sticker-lock';
        lock.textContent = '🔒';
        card.appendChild(lock);
      }

      card.appendChild(icon);
      card.appendChild(name);
      grid.appendChild(card);
    });
  }

  renderLeaderboard(friends, currentUser, sortBy = 'points') {
    const leaderboard = document.getElementById('leaderboard');
    const emptyState = document.getElementById('friendsEmptyState');

    if (!leaderboard) return;

    if (friends.length === 0) {
      leaderboard.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Combine friends and current user
    const allUsers = [
      ...friends,
      {
        id: 'current-user',
        name: currentUser.name,
        totalPoints: currentUser.totalPoints,
        currentStreak: currentUser.currentStreak,
        level: currentUser.level,
        isCurrentUser: true
      }
    ];

    // Sort by selected criteria
    allUsers.sort((a, b) => {
      if (sortBy === 'points') {
        return b.totalPoints - a.totalPoints;
      } else {
        return b.currentStreak - a.currentStreak;
      }
    });

    leaderboard.innerHTML = '';

    allUsers.forEach((user, index) => {
      const card = document.createElement('div');
      card.className = `friend-card ${user.isCurrentUser ? 'current-user' : ''}`;

      const rank = document.createElement('div');
      rank.className = 'friend-rank';
      if (index === 0) rank.textContent = '🥇';
      else if (index === 1) rank.textContent = '🥈';
      else if (index === 2) rank.textContent = '🥉';
      else rank.textContent = index + 1;

      const info = document.createElement('div');
      info.className = 'friend-info';

      const name = document.createElement('div');
      name.className = 'friend-name';
      name.textContent = user.name + (user.isCurrentUser ? ' (You)' : '');

      const stats = document.createElement('div');
      stats.className = 'friend-stats';
      stats.textContent = `Level ${user.level} • ${user.currentStreak} day streak`;

      info.appendChild(name);
      info.appendChild(stats);

      const score = document.createElement('div');
      score.className = 'friend-score';
      score.textContent = sortBy === 'points' ? user.totalPoints : user.currentStreak;

      card.appendChild(rank);
      card.appendChild(info);
      card.appendChild(score);

      leaderboard.appendChild(card);
    });
  }

  showMotivationalMessage(message) {
    const messageEl = document.getElementById('motivationalMessage');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
}

class AnimationController {
  celebrateWorkout(element) {
    element.classList.add('celebrate');
    setTimeout(() => element.classList.remove('celebrate'), 600);
  }

  celebrateStickerUnlock(element) {
    element.classList.add('celebrate');
    setTimeout(() => element.classList.remove('celebrate'), 600);
  }

  countUpPoints(element, from, to, duration = 500) {
    const start = Date.now();
    const range = to - from;

    const update = () => {
      const now = Date.now();
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      const current = Math.floor(from + range * progress);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

  pulseStreak(element) {
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'pulse 2s ease-in-out infinite';
    }, 10);
  }

  showConfetti() {
    const colors = ['#4a9eff', '#6eb5ff', '#2196f3', '#1976d2', '#ffd700', '#ff6b6b'];

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), 3000);
      }, i * 30);
    }
  }

  shakeError(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 300);
  }
}

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.muted = false;

    // Initialize audio context on user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    }, { once: true });
  }

  playSound(type) {
    if (this.muted || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      switch (type) {
        case 'log':
          oscillator.frequency.value = 400;
          gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.1);
          break;

        case 'unlock':
          oscillator.frequency.value = 800;
          oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.3);
          break;

        case 'streak':
          oscillator.frequency.value = 600;
          gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.15);
          break;

        case 'level-up':
          oscillator.frequency.value = 600;
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.5);
          break;

        default:
          oscillator.frequency.value = 440;
          gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.1);
      }
    } catch (e) {
      console.error('Sound playback failed:', e);
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }
}

// ========================================
// MAIN APP
// ========================================

class App {
  constructor() {
    this.state = new AppState();
    this.screenManager = new ScreenManager();
    this.sound = new SoundSystem();
    this.animator = new AnimationController();

    // Logger state
    this.currentExerciseType = null;
    this.currentReps = 0;
    this.sessionTimer = null;
    this.sessionDuration = 0;
    this.timerRunning = false;

    this.init();
  }

  init() {
    this.state.init();
    this.sound.setMuted(this.state.settings.soundMuted);
    this.setupEventListeners();
    this.updateDashboard();
    this.screenManager.showScreen('home');
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigateToScreen(btn.dataset.screen);
      });
    });

    // Home screen
    const logWorkoutBtn = document.getElementById('logWorkoutBtn');
    if (logWorkoutBtn) {
      logWorkoutBtn.addEventListener('click', () => this.handleQuickLog());
    }

    // Logger screen
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.state.currentSession && this.state.currentSession.exercises.length > 0) {
          if (confirm('Discard current session?')) {
            this.state.cancelSession();
            this.navigateToScreen('home');
          }
        } else {
          this.navigateToScreen('home');
        }
      });
    }

    const completeSessionBtn = document.getElementById('completeSessionBtn');
    if (completeSessionBtn) {
      completeSessionBtn.addEventListener('click', () => this.handleCompleteSession());
    }

    const logExerciseBtn = document.getElementById('logExerciseBtn');
    if (logExerciseBtn) {
      logExerciseBtn.addEventListener('click', () => this.handleLogExercise());
    }

    // Rep counter buttons
    document.querySelectorAll('.rep-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.delta);
        this.handleRepChange(delta);
      });
    });

    // Timer toggle
    const timerToggleBtn = document.getElementById('timerToggleBtn');
    if (timerToggleBtn) {
      timerToggleBtn.addEventListener('click', () => this.handleTimerToggle());
    }

    // Success overlay
    const successContinueBtn = document.getElementById('successContinueBtn');
    if (successContinueBtn) {
      successContinueBtn.addEventListener('click', () => {
        this.screenManager.hideOverlay('success');
        this.navigateToScreen('home');
      });
    }

    // Sticker overlay
    const closeStickerBtn = document.getElementById('closeStickerBtn');
    if (closeStickerBtn) {
      closeStickerBtn.addEventListener('click', () => {
        this.screenManager.hideOverlay('sticker');
      });
    }

    // Sticker grid clicks (delegated)
    document.addEventListener('click', (e) => {
      const stickerCard = e.target.closest('.sticker-card');
      if (stickerCard) {
        const stickerId = stickerCard.dataset.stickerId;
        this.handleViewSticker(stickerId);
      }
    });

    // Friends screen
    const addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', () => {
        this.screenManager.showOverlay('addFriend');
      });
    }

    const closeAddFriendBtn = document.getElementById('closeAddFriendBtn');
    if (closeAddFriendBtn) {
      closeAddFriendBtn.addEventListener('click', () => {
        this.screenManager.hideOverlay('addFriend');
      });
    }

    const addFriendForm = document.getElementById('addFriendForm');
    if (addFriendForm) {
      addFriendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('friendNameInput');
        if (input && input.value.trim()) {
          this.handleAddFriend(input.value.trim());
          input.value = '';
          this.screenManager.hideOverlay('addFriend');
        }
      });
    }

    // Sort toggle
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateFriendsScreen(btn.dataset.sort);
      });
    });

    // Settings
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        this.openSettings();
      });
    }

    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener('click', () => {
        this.screenManager.hideOverlay('settings');
      });
    }

    const soundToggleBtn = document.getElementById('soundToggleBtn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        this.handleToggleSound();
      });
    }

    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.handleSaveSettings();
      });
    }
  }

  navigateToScreen(screenName) {
    this.screenManager.showScreen(screenName);

    // Update screen content when navigating
    switch (screenName) {
      case 'home':
        this.updateDashboard();
        break;
      case 'logger':
        this.updateLoggerScreen();
        break;
      case 'profile':
        this.updateProfileScreen();
        break;
      case 'friends':
        this.updateFriendsScreen();
        break;
      case 'history':
        this.updateHistoryScreen();
        break;
    }
  }

  handleQuickLog() {
    this.state.startSession();
    this.navigateToScreen('logger');
  }

  handleSelectExercise(type) {
    this.currentExerciseType = type;
    this.currentReps = 0;

    // Update UI
    const repCounterSection = document.getElementById('repCounterSection');
    const selectedIcon = document.getElementById('selectedExerciseIcon');
    const selectedName = document.getElementById('selectedExerciseName');
    const repDisplay = document.getElementById('repDisplay');

    if (repCounterSection) repCounterSection.classList.remove('hidden');

    const exercise = this.state.exercises[type];
    if (selectedIcon) selectedIcon.textContent = exercise.icon;
    if (selectedName) selectedName.textContent = exercise.name;
    if (repDisplay) repDisplay.textContent = this.currentReps;

    // Highlight selected exercise
    document.querySelectorAll('.exercise-card').forEach(card => {
      if (card.dataset.exerciseType === type) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    this.updatePointsPreview();
  }

  handleRepChange(delta) {
    this.currentReps = Math.max(0, this.currentReps + delta);

    const repDisplay = document.getElementById('repDisplay');
    if (repDisplay) {
      repDisplay.textContent = this.currentReps;
    }

    this.updatePointsPreview();
  }

  handleTimerToggle() {
    const timerToggleBtn = document.getElementById('timerToggleBtn');

    if (!this.timerRunning) {
      // Start timer
      this.timerRunning = true;
      this.sessionTimer = setInterval(() => {
        this.sessionDuration++;
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
          timerDisplay.textContent = formatTime(this.sessionDuration);
        }
      }, 1000);

      if (timerToggleBtn) timerToggleBtn.textContent = 'Stop';
    } else {
      // Stop timer
      this.timerRunning = false;
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer);
        this.sessionTimer = null;
      }

      if (timerToggleBtn) timerToggleBtn.textContent = 'Start';
    }
  }

  handleLogExercise() {
    if (!this.currentExerciseType || this.currentReps === 0) {
      this.animator.shakeError(document.getElementById('repDisplay'));
      return;
    }

    this.state.addExerciseToSession(this.currentExerciseType, this.currentReps);
    this.sound.playSound('log');

    // Reset counter
    this.currentReps = 0;
    this.currentExerciseType = null;

    // Update UI
    const repDisplay = document.getElementById('repDisplay');
    if (repDisplay) repDisplay.textContent = 0;

    const repCounterSection = document.getElementById('repCounterSection');
    if (repCounterSection) repCounterSection.classList.add('hidden');

    document.querySelectorAll('.exercise-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Show session summary
    this.updateSessionSummary();
  }

  handleCompleteSession() {
    const result = this.state.completeSession();

    if (!result) {
      alert('Add at least one exercise to complete the session!');
      return;
    }

    // Stop timer if running
    if (this.timerRunning) {
      this.handleTimerToggle();
    }
    this.sessionDuration = 0;

    // Show success overlay
    this.showSuccessOverlay(result.session, result.newStickers);

    // Reset logger screen
    this.resetLoggerScreen();

    // Play sounds
    this.sound.playSound('streak');
    if (result.newStickers.length > 0) {
      setTimeout(() => this.sound.playSound('unlock'), 300);
    }
  }

  handleAddFriend(name) {
    // Generate mock friend data
    const friend = {
      id: `friend-${Date.now()}`,
      name: name,
      totalPoints: Math.floor(Math.random() * 2000),
      currentStreak: Math.floor(Math.random() * 20),
      level: Math.floor(Math.random() * 8) + 1,
      lastSeen: new Date().toISOString()
    };

    this.state.friends.push(friend);
    this.state.saveFriends();

    this.updateFriendsScreen();
  }

  handleViewSticker(stickerId) {
    const sticker = this.state.stickers[stickerId];
    if (!sticker) return;

    const isUnlocked = this.state.user.unlockedStickers.includes(stickerId);

    // Update sticker detail overlay
    document.getElementById('stickerDetailIcon').textContent = sticker.icon;
    document.getElementById('stickerDetailName').textContent = sticker.name;
    document.getElementById('stickerDetailDescription').textContent = sticker.description;

    const progressSection = document.getElementById('stickerProgressSection');
    const unlockedSection = document.getElementById('stickerUnlockedSection');

    if (isUnlocked) {
      progressSection.classList.add('hidden');
      unlockedSection.classList.remove('hidden');
    } else {
      const achievementEngine = new AchievementEngine(this.state.stickers, this.state.user, this.state.sessions);
      const progress = achievementEngine.getProgress(stickerId);

      const progressBar = document.getElementById('stickerProgressBar');
      const progressText = document.getElementById('stickerProgressText');

      if (progressBar) progressBar.style.width = progress + '%';
      if (progressText) progressText.textContent = progress + '%';

      progressSection.classList.remove('hidden');
      unlockedSection.classList.add('hidden');
    }

    this.screenManager.showOverlay('sticker');
  }

  handleToggleSound() {
    this.state.settings.soundMuted = !this.state.settings.soundMuted;
    this.sound.setMuted(this.state.settings.soundMuted);

    const soundIcon = document.getElementById('soundIcon');
    const soundStatus = document.getElementById('soundStatus');

    if (soundIcon) {
      soundIcon.textContent = this.state.settings.soundMuted ? '🔇' : '🔊';
    }

    if (soundStatus) {
      soundStatus.textContent = this.state.settings.soundMuted ? 'Off' : 'On';
    }
  }

  handleSaveSettings() {
    const dailyGoalInput = document.getElementById('dailyGoalInput');
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');

    if (dailyGoalInput) {
      this.state.settings.dailyGoal = parseInt(dailyGoalInput.value) || 50;
    }

    if (weeklyGoalInput) {
      this.state.settings.weeklyGoal = parseInt(weeklyGoalInput.value) || 500;
    }

    this.state.saveSettings();
    this.screenManager.hideOverlay('settings');
    this.updateDashboard();

    this.sound.playSound('log');
  }

  openSettings() {
    // Populate current settings
    const dailyGoalInput = document.getElementById('dailyGoalInput');
    const weeklyGoalInput = document.getElementById('weeklyGoalInput');
    const soundIcon = document.getElementById('soundIcon');
    const soundStatus = document.getElementById('soundStatus');

    if (dailyGoalInput) dailyGoalInput.value = this.state.settings.dailyGoal;
    if (weeklyGoalInput) weeklyGoalInput.value = this.state.settings.weeklyGoal;

    if (soundIcon) {
      soundIcon.textContent = this.state.settings.soundMuted ? '🔇' : '🔊';
    }

    if (soundStatus) {
      soundStatus.textContent = this.state.settings.soundMuted ? 'Off' : 'On';
    }

    this.screenManager.showOverlay('settings');
  }

  updateDashboard() {
    // Update streak
    this.screenManager.updateStreakDisplay(this.state.user.currentStreak);

    // Update stats
    const pointsToday = this.state.getTodaysPoints();
    const totalPoints = this.state.user.totalPoints;
    const level = this.state.user.level;

    document.getElementById('pointsToday').textContent = pointsToday;
    document.getElementById('totalPoints').textContent = totalPoints;
    document.getElementById('userLevel').textContent = level;

    // Update progress bars
    const weeklyPoints = this.state.getWeeklyPoints();
    this.screenManager.updateProgressBar('dailyProgress', pointsToday, this.state.settings.dailyGoal);
    this.screenManager.updateProgressBar('weeklyProgress', weeklyPoints, this.state.settings.weeklyGoal);

    // Update motivational message
    const message = this.getMotivationalMessage();
    this.screenManager.showMotivationalMessage(message);
  }

  updateLoggerScreen() {
    // Render exercise grid
    const exerciseGrid = document.getElementById('exerciseGrid');
    if (exerciseGrid) {
      exerciseGrid.innerHTML = '';

      Object.keys(this.state.exercises).forEach(type => {
        const exercise = this.state.exercises[type];

        const card = document.createElement('div');
        card.className = 'exercise-card';
        card.dataset.exerciseType = type;

        const icon = document.createElement('span');
        icon.className = 'exercise-icon';
        icon.textContent = exercise.icon;

        const name = document.createElement('div');
        name.className = 'exercise-name';
        name.textContent = exercise.name;

        const points = document.createElement('div');
        points.className = 'exercise-points';
        points.textContent = `${exercise.pointsPerRep} pt per ${exercise.unit || 'rep'}`;

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(points);

        card.addEventListener('click', () => this.handleSelectExercise(type));

        exerciseGrid.appendChild(card);
      });
    }

    // Reset counter
    const repCounterSection = document.getElementById('repCounterSection');
    if (repCounterSection) repCounterSection.classList.add('hidden');

    const sessionSummary = document.getElementById('sessionSummary');
    if (sessionSummary) sessionSummary.classList.add('hidden');
  }

  updateProfileScreen() {
    // Update user info
    document.getElementById('userName').textContent = this.state.user.name;
    document.getElementById('profileTotalPoints').textContent = this.state.user.totalPoints;
    document.getElementById('profileLevel').textContent = this.state.user.level;
    document.getElementById('profileWorkouts').textContent = this.state.sessions.length;
    document.getElementById('profileLongestStreak').textContent = this.state.user.longestStreak;

    // Render sticker grid
    this.screenManager.renderStickerGrid(this.state.stickers, this.state.user.unlockedStickers);
  }

  updateFriendsScreen(sortBy = 'points') {
    this.screenManager.renderLeaderboard(this.state.friends, this.state.user, sortBy);
  }

  updateHistoryScreen() {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('historyEmptyState');

    if (!historyList) return;

    if (this.state.sessions.length === 0) {
      historyList.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    historyList.innerHTML = '';

    // Show sessions in reverse chronological order
    const sortedSessions = [...this.state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedSessions.forEach(session => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const date = document.createElement('div');
      date.className = 'history-date';
      date.textContent = formatDate(session.date);

      const exercises = document.createElement('div');
      exercises.className = 'history-exercises';
      exercises.textContent = session.exercises.map(ex => {
        const exerciseName = this.state.exercises[ex.type]?.name || ex.type;
        return `${exerciseName}: ${ex.reps}`;
      }).join(', ');

      const points = document.createElement('div');
      points.className = 'history-points';
      points.textContent = `${session.totalPoints} points`;

      item.appendChild(date);
      item.appendChild(exercises);
      item.appendChild(points);

      historyList.appendChild(item);
    });
  }

  updateSessionSummary() {
    const sessionSummary = document.getElementById('sessionSummary');
    const sessionExerciseList = document.getElementById('sessionExerciseList');
    const sessionTotalPoints = document.getElementById('sessionTotalPoints');

    if (!this.state.currentSession || this.state.currentSession.exercises.length === 0) {
      if (sessionSummary) sessionSummary.classList.add('hidden');
      return;
    }

    if (sessionSummary) sessionSummary.classList.remove('hidden');

    // Render exercise list
    if (sessionExerciseList) {
      sessionExerciseList.innerHTML = '';

      this.state.currentSession.exercises.forEach((ex, index) => {
        const item = document.createElement('div');
        item.className = 'session-exercise-item';

        const exerciseName = this.state.exercises[ex.type]?.name || ex.type;
        const name = document.createElement('span');
        name.textContent = `${exerciseName}: ${ex.reps}`;

        const pointsSpan = document.createElement('span');
        pointsSpan.textContent = `${ex.points} pts`;

        item.appendChild(name);
        item.appendChild(pointsSpan);

        sessionExerciseList.appendChild(item);
      });
    }

    // Update total
    if (sessionTotalPoints) {
      sessionTotalPoints.textContent = this.state.currentSession.calculateTotal();
    }
  }

  updatePointsPreview() {
    if (!this.currentExerciseType || this.currentReps === 0) {
      const previewPoints = document.getElementById('previewPoints');
      if (previewPoints) previewPoints.textContent = '0';
      return;
    }

    const points = this.state.calculatePoints(this.currentExerciseType, this.currentReps);
    const previewPoints = document.getElementById('previewPoints');
    if (previewPoints) previewPoints.textContent = points;
  }

  resetLoggerScreen() {
    this.currentExerciseType = null;
    this.currentReps = 0;

    const repCounterSection = document.getElementById('repCounterSection');
    if (repCounterSection) repCounterSection.classList.add('hidden');

    const sessionSummary = document.getElementById('sessionSummary');
    if (sessionSummary) sessionSummary.classList.add('hidden');

    const repDisplay = document.getElementById('repDisplay');
    if (repDisplay) repDisplay.textContent = 0;

    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) timerDisplay.textContent = '00:00';

    document.querySelectorAll('.exercise-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  showSuccessOverlay(session, newStickers) {
    const pointsEarned = document.getElementById('pointsEarned');
    const successStreakCount = document.getElementById('successStreakCount');
    const newStickersSection = document.getElementById('newStickersSection');
    const newStickersList = document.getElementById('newStickersList');
    const successMessage = document.getElementById('successMessage');

    // Animate points count-up
    if (pointsEarned) {
      this.animator.countUpPoints(pointsEarned, 0, session.totalPoints, 800);
    }

    // Update streak
    if (successStreakCount) {
      successStreakCount.textContent = this.state.user.currentStreak;
    }

    // Show new stickers
    if (newStickers.length > 0) {
      if (newStickersSection) newStickersSection.classList.remove('hidden');
      if (newStickersList) {
        newStickersList.innerHTML = '';
        newStickers.forEach(stickerId => {
          const sticker = this.state.stickers[stickerId];
          if (sticker) {
            const item = document.createElement('div');
            item.className = 'new-sticker-item';
            item.textContent = sticker.icon;
            this.animator.celebrateStickerUnlock(item);
            newStickersList.appendChild(item);
          }
        });
      }

      // Show confetti
      this.animator.showConfetti();
    } else {
      if (newStickersSection) newStickersSection.classList.add('hidden');
    }

    // Motivational message
    if (successMessage) {
      const messages = [
        "Keep up the great work!",
        "You're crushing it!",
        "Awesome session!",
        "One step closer to your goals!",
        "Consistency is key!",
        "You're on fire! 🔥"
      ];
      successMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    }

    this.screenManager.showOverlay('success');
  }

  getMotivationalMessage() {
    const todaysPoints = this.state.getTodaysPoints();
    const streak = this.state.user.currentStreak;

    if (todaysPoints === 0) {
      if (streak > 0) {
        return `Keep your ${streak}-day streak alive! 🔥`;
      }
      return "Ready to start tracking? Log your first workout!";
    }

    if (todaysPoints >= this.state.settings.dailyGoal) {
      return `Daily goal crushed! ${todaysPoints} points today! 💪`;
    }

    const remaining = this.state.settings.dailyGoal - todaysPoints;
    return `${remaining} more points to hit your daily goal!`;
  }
}

// ========================================
// INITIALIZE APP
// ========================================

let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
