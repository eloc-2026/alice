// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

const TILE_TYPES = {
  WALL: 'wall',
  PATH: 'path',
  PLAYER: 'player',
  EXIT: 'exit',
  KEY: 'key',
  DOOR: 'door',
  ENEMY: 'enemy',
  TELEPORT: 'teleport',
  SPEEDBOOST: 'speedboost'
};

const DIRECTIONS = {
  UP: { dx: 0, dy: -1, name: 'up' },
  DOWN: { dx: 0, dy: 1, name: 'down' },
  LEFT: { dx: -1, dy: 0, name: 'left' },
  RIGHT: { dx: 1, dy: 0, name: 'right' }
};

const INITIAL_LIVES = 3;
const MOVE_ANIMATION_MS = 150;
const ENEMY_MOVE_INTERVAL = 800;

// Hand-crafted tutorial levels (1-5)
const LEVELS = [
  // Level 1: Simple 5x5 maze
  {
    width: 5,
    height: 5,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'player', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'path', 'wall'],
      ['wall', 'path', 'path', 'exit', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall']
    ],
    enemies: [],
    keys: 0
  },
  // Level 2: 7x7 with decision point
  {
    width: 7,
    height: 7,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'player', 'path', 'wall', 'path', 'path', 'wall'],
      ['wall', 'path', 'path', 'wall', 'path', 'wall', 'wall'],
      ['wall', 'wall', 'path', 'path', 'path', 'path', 'wall'],
      ['wall', 'path', 'path', 'wall', 'wall', 'path', 'wall'],
      ['wall', 'path', 'wall', 'wall', 'path', 'exit', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
    ],
    enemies: [],
    keys: 0
  },
  // Level 3: 8x8 with dead ends
  {
    width: 8,
    height: 8,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'player', 'path', 'path', 'wall', 'path', 'path', 'wall'],
      ['wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall'],
      ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'wall', 'wall', 'wall', 'path', 'wall'],
      ['wall', 'path', 'path', 'wall', 'path', 'path', 'path', 'wall'],
      ['wall', 'wall', 'path', 'path', 'path', 'wall', 'exit', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
    ],
    enemies: [],
    keys: 0
  },
  // Level 4: 10x10 with keys and doors
  {
    width: 10,
    height: 10,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'player', 'path', 'path', 'wall', 'path', 'path', 'path', 'key', 'wall'],
      ['wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'path', 'path', 'path', 'path', 'path', 'wall', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'wall', 'wall', 'door', 'wall', 'path', 'wall', 'wall'],
      ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'path', 'wall'],
      ['wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'path', 'wall'],
      ['wall', 'key', 'path', 'path', 'path', 'path', 'path', 'wall', 'path', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'path', 'exit', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
    ],
    enemies: [],
    keys: 2
  },
  // Level 5: 10x10 with special tiles
  {
    width: 10,
    height: 10,
    grid: [
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'player', 'path', 'path', 'wall', 'path', 'teleport', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'path', 'wall'],
      ['wall', 'path', 'path', 'path', 'path', 'path', 'path', 'speedboost', 'path', 'wall'],
      ['wall', 'wall', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'path', 'wall'],
      ['wall', 'path', 'wall', 'wall', 'wall', 'path', 'wall', 'wall', 'path', 'wall'],
      ['wall', 'path', 'teleport', 'path', 'path', 'path', 'path', 'wall', 'exit', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall'],
      ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall']
    ],
    enemies: [],
    keys: 0,
    teleports: [[1, 6], [7, 2]] // Paired teleport positions
  }
];

// ========================================
// MAZE GENERATOR CLASS
// ========================================

class MazeGenerator {
  static generateMaze(width, height, level) {
    // Create grid filled with walls
    const grid = Array(height).fill(null).map(() => Array(width).fill(TILE_TYPES.WALL));

    // Recursive backtracker algorithm
    const visited = Array(height).fill(null).map(() => Array(width).fill(false));

    function carve(x, y) {
      visited[y][x] = true;
      grid[y][x] = TILE_TYPES.PATH;

      const directions = [
        [0, -2], [0, 2], [-2, 0], [2, 0]
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && !visited[ny][nx]) {
          grid[y + dy / 2][x + dx / 2] = TILE_TYPES.PATH;
          carve(nx, ny);
        }
      }
    }

    // Start carving from position (1, 1)
    carve(1, 1);

    // Set player start and exit
    grid[1][1] = TILE_TYPES.PLAYER;
    grid[height - 2][width - 2] = TILE_TYPES.EXIT;

    // Add keys in dead ends (for level 6+)
    const numKeys = Math.min(Math.floor(level / 2), 3);
    const deadEnds = [];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (grid[y][x] === TILE_TYPES.PATH) {
          const neighbors = [
            grid[y - 1][x], grid[y + 1][x], grid[y][x - 1], grid[y][x + 1]
          ].filter(cell => cell !== TILE_TYPES.WALL).length;

          if (neighbors === 1) deadEnds.push([y, x]);
        }
      }
    }

    for (let i = 0; i < numKeys && deadEnds.length > 0; i++) {
      const idx = Math.floor(Math.random() * deadEnds.length);
      const [y, x] = deadEnds.splice(idx, 1)[0];
      grid[y][x] = TILE_TYPES.KEY;
    }

    // Add enemies (for level 6+)
    const numEnemies = Math.max(0, level - 5);
    const enemies = [];

    for (let i = 0; i < numEnemies; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 50) {
        const x = Math.floor(Math.random() * (width - 2)) + 1;
        const y = Math.floor(Math.random() * (height - 2)) + 1;

        if (grid[y][x] === TILE_TYPES.PATH &&
            Math.abs(x - 1) + Math.abs(y - 1) > 3) {
          grid[y][x] = TILE_TYPES.ENEMY;
          enemies.push({ x, y, path: this.generatePatrolPath(grid, x, y) });
          placed = true;
        }
        attempts++;
      }
    }

    return { grid, enemies, keys: numKeys };
  }

  static generatePatrolPath(grid, startX, startY) {
    // Simple patrol: move in available directions
    const path = [[startX, startY]];
    let x = startX, y = startY;

    for (let i = 0; i < 4; i++) {
      const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0]
      ].filter(([dx, dy]) => {
        const nx = x + dx, ny = y + dy;
        return grid[ny] && grid[ny][nx] && grid[ny][nx] !== TILE_TYPES.WALL;
      });

      if (directions.length > 0) {
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        x += dx;
        y += dy;
        path.push([x, y]);
      }
    }

    return path;
  }
}

// ========================================
// GAME STATE CLASS
// ========================================

class GameState {
  constructor() {
    this.currentLevel = 1;
    this.maxLevelUnlocked = 1;
    this.playerPos = { x: 1, y: 1 };
    this.mazeGrid = [];
    this.lives = INITIAL_LIVES;
    this.keysCollected = 0;
    this.keysRequired = 0;
    this.timer = 0;
    this.moves = 0;
    this.enemies = [];
    this.teleports = [];
    this.isMoving = false;
    this.speedBoostActive = false;
    this.timerInterval = null;
  }

  loadLevel(levelNum) {
    this.currentLevel = levelNum;
    this.lives = INITIAL_LIVES;
    this.keysCollected = 0;
    this.timer = 0;
    this.moves = 0;
    this.isMoving = false;
    this.speedBoostActive = false;

    if (levelNum <= LEVELS.length) {
      // Hand-crafted level
      const level = LEVELS[levelNum - 1];
      this.mazeGrid = level.grid.map(row => [...row]);
      this.keysRequired = level.keys;
      this.enemies = level.enemies.map(e => ({ ...e }));
      this.teleports = level.teleports || [];

      // Find player position
      for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
          if (this.mazeGrid[y][x] === TILE_TYPES.PLAYER) {
            this.playerPos = { x, y };
          }
        }
      }
    } else {
      // Procedurally generated level
      const size = Math.min(16, 10 + (levelNum - 5) * 2);
      const generated = MazeGenerator.generateMaze(size, size, levelNum);
      this.mazeGrid = generated.grid;
      this.enemies = generated.enemies;
      this.keysRequired = generated.keys;
      this.playerPos = { x: 1, y: 1 };
      this.teleports = [];
    }
  }

  resetLevel() {
    this.loadLevel(this.currentLevel);
  }

  movePlayer(direction) {
    if (this.isMoving) return false;

    const newX = this.playerPos.x + direction.dx;
    const newY = this.playerPos.y + direction.dy;

    const collision = this.checkCollision(newX, newY);

    if (collision === TILE_TYPES.WALL) {
      return false;
    }

    if (collision === TILE_TYPES.DOOR) {
      if (this.keysCollected === 0) {
        return false;
      }
      // Open door
      this.mazeGrid[newY][newX] = TILE_TYPES.PATH;
      this.keysCollected--;
    }

    // Clear old position
    this.mazeGrid[this.playerPos.y][this.playerPos.x] = TILE_TYPES.PATH;

    // Move player
    this.playerPos.x = newX;
    this.playerPos.y = newY;
    this.moves++;

    // Handle special tiles
    const tileType = this.mazeGrid[newY][newX];

    if (tileType === TILE_TYPES.KEY) {
      this.keysCollected++;
    } else if (tileType === TILE_TYPES.SPEEDBOOST) {
      this.speedBoostActive = true;
      setTimeout(() => { this.speedBoostActive = false; }, 3000);
    } else if (tileType === TILE_TYPES.TELEPORT) {
      this.handleTeleport();
    }

    // Update grid
    this.mazeGrid[newY][newX] = TILE_TYPES.PLAYER;

    return true;
  }

  handleTeleport() {
    if (this.teleports.length < 2) return;

    const [pos1, pos2] = this.teleports;
    const [y1, x1] = pos1;
    const [y2, x2] = pos2;

    // Teleport to the other pad
    if (this.playerPos.x === x1 && this.playerPos.y === y1) {
      this.mazeGrid[y1][x1] = TILE_TYPES.TELEPORT;
      this.playerPos.x = x2;
      this.playerPos.y = y2;
      this.mazeGrid[y2][x2] = TILE_TYPES.PLAYER;
    } else if (this.playerPos.x === x2 && this.playerPos.y === y2) {
      this.mazeGrid[y2][x2] = TILE_TYPES.TELEPORT;
      this.playerPos.x = x1;
      this.playerPos.y = y1;
      this.mazeGrid[y1][x1] = TILE_TYPES.PLAYER;
    }
  }

  checkCollision(x, y) {
    if (y < 0 || y >= this.mazeGrid.length || x < 0 || x >= this.mazeGrid[0].length) {
      return TILE_TYPES.WALL;
    }
    return this.mazeGrid[y][x];
  }

  checkWin() {
    const tile = this.mazeGrid[this.playerPos.y][this.playerPos.x];
    return tile === TILE_TYPES.EXIT ||
           this.checkCollision(this.playerPos.x, this.playerPos.y) === TILE_TYPES.EXIT;
  }

  loseLife() {
    this.lives--;
    if (this.lives > 0) {
      this.resetPlayerPosition();
    }
    return this.lives;
  }

  resetPlayerPosition() {
    // Find original start position
    for (let y = 0; y < this.mazeGrid.length; y++) {
      for (let x = 0; x < this.mazeGrid[0].length; x++) {
        if (this.mazeGrid[y][x] === TILE_TYPES.PLAYER) {
          this.mazeGrid[y][x] = TILE_TYPES.PATH;
        }
      }
    }

    // Reset to start (typically 1,1)
    if (this.currentLevel <= LEVELS.length) {
      const level = LEVELS[this.currentLevel - 1];
      for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
          if (level.grid[y][x] === TILE_TYPES.PLAYER) {
            this.playerPos = { x, y };
            this.mazeGrid[y][x] = TILE_TYPES.PLAYER;
            return;
          }
        }
      }
    } else {
      this.playerPos = { x: 1, y: 1 };
      this.mazeGrid[1][1] = TILE_TYPES.PLAYER;
    }
  }

  startTimer() {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

// ========================================
// RENDERER CLASS
// ========================================

class Renderer {
  constructor() {
    this.mazeContainer = document.getElementById('mazeContainer');
    this.screens = {
      start: document.getElementById('startScreen'),
      game: document.getElementById('gameScreen'),
      victory: document.getElementById('victoryScreen')
    };
    this.overlays = {
      pause: document.getElementById('pauseOverlay'),
      gameOver: document.getElementById('gameOverOverlay')
    };
  }

  renderMaze(grid) {
    this.mazeContainer.innerHTML = '';
    const height = grid.length;
    const width = grid[0].length;

    this.mazeContainer.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    this.mazeContainer.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = document.createElement('div');
        cell.className = `cell ${grid[y][x]}`;
        cell.dataset.x = x;
        cell.dataset.y = y;
        this.mazeContainer.appendChild(cell);
      }
    }
  }

  updateMaze(grid) {
    const cells = this.mazeContainer.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const tileType = grid[y][x];
      cell.className = `cell ${tileType}`;
    });
  }

  renderHUD(state) {
    document.getElementById('levelNum').textContent = state.currentLevel;
    document.getElementById('timer').textContent = this.formatTime(state.timer);
    document.getElementById('moves').textContent = state.moves;
    document.getElementById('keys').textContent = state.keysCollected;

    // Lives display
    const livesDisplay = document.getElementById('livesDisplay');
    livesDisplay.innerHTML = '❤️'.repeat(state.lives) + '🖤'.repeat(INITIAL_LIVES - state.lives);

    // Show/hide keys display
    document.getElementById('keysDisplay').style.display =
      state.keysRequired > 0 ? 'inline' : 'none';
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  showScreen(name) {
    Object.values(this.screens).forEach(screen => screen.classList.add('hidden'));
    Object.values(this.overlays).forEach(overlay => overlay.classList.add('hidden'));

    if (this.screens[name]) {
      this.screens[name].classList.remove('hidden');
    }
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

  renderLevelGrid(maxLevel) {
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';

    const totalLevels = Math.max(maxLevel + 1, 10);

    for (let i = 1; i <= totalLevels; i++) {
      const btn = document.createElement('button');
      btn.className = 'level-btn';
      btn.textContent = i;
      btn.dataset.level = i;

      if (i > maxLevel) {
        btn.classList.add('locked');
        btn.disabled = true;
      }

      levelGrid.appendChild(btn);
    }
  }

  showVictoryScreen(state, bestTime) {
    document.getElementById('finalTime').textContent = this.formatTime(state.timer);
    document.getElementById('finalMoves').textContent = state.moves;
    document.getElementById('bestTime').textContent =
      bestTime ? this.formatTime(bestTime) : this.formatTime(state.timer);

    this.showScreen('victory');
  }

  playAnimation(type, element) {
    if (type === 'shake') {
      this.mazeContainer.classList.add('shake');
      setTimeout(() => this.mazeContainer.classList.remove('shake'), 300);
    } else if (type === 'flash') {
      this.mazeContainer.classList.add('flash-red');
      setTimeout(() => this.mazeContainer.classList.remove('flash-red'), 300);
    }
  }
}

// ========================================
// INPUT HANDLER CLASS
// ========================================

class InputHandler {
  constructor(onInput) {
    this.onInput = onInput;
    this.touchStart = null;
    this.inputQueue = [];
    this.setupControls();
  }

  setupControls() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      const keyMap = {
        'ArrowUp': DIRECTIONS.UP,
        'ArrowDown': DIRECTIONS.DOWN,
        'ArrowLeft': DIRECTIONS.LEFT,
        'ArrowRight': DIRECTIONS.RIGHT,
        'w': DIRECTIONS.UP,
        'W': DIRECTIONS.UP,
        's': DIRECTIONS.DOWN,
        'S': DIRECTIONS.DOWN,
        'a': DIRECTIONS.LEFT,
        'A': DIRECTIONS.LEFT,
        'd': DIRECTIONS.RIGHT,
        'D': DIRECTIONS.RIGHT
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        this.queueInput(keyMap[e.key]);
      }
    });

    // D-Pad buttons
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dirName = btn.dataset.direction;
        const direction = Object.values(DIRECTIONS).find(d => d.name === dirName);
        if (direction) this.queueInput(direction);
      });

      // Touch events for mobile
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.style.backgroundColor = '#2196f3';
      });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.style.backgroundColor = '';
        const dirName = btn.dataset.direction;
        const direction = Object.values(DIRECTIONS).find(d => d.name === dirName);
        if (direction) this.queueInput(direction);
      });
    });

    // Swipe detection
    const mazeWrapper = document.querySelector('.maze-wrapper');
    if (mazeWrapper) {
      mazeWrapper.addEventListener('touchstart', (e) => {
        this.touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      });

      mazeWrapper.addEventListener('touchend', (e) => {
        if (!this.touchStart) return;

        const touchEnd = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY
        };

        const dx = touchEnd.x - this.touchStart.x;
        const dy = touchEnd.y - this.touchStart.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > 30 || absDy > 30) {
          if (absDx > absDy) {
            this.queueInput(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
          } else {
            this.queueInput(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
          }
        }

        this.touchStart = null;
      });
    }
  }

  queueInput(direction) {
    this.onInput(direction);
  }
}

// ========================================
// SOUND SYSTEM
// ========================================

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.muted = this.loadMuteSetting();
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  playSound(type) {
    if (this.muted || !this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    switch (type) {
      case 'move':
        osc.frequency.value = 300;
        gainNode.gain.value = 0.1;
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
        break;
      case 'collect':
        osc.frequency.value = 600;
        gainNode.gain.value = 0.15;
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
        break;
      case 'damage':
        osc.frequency.value = 150;
        osc.type = 'square';
        gainNode.gain.value = 0.2;
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
        break;
      case 'win':
        osc.frequency.value = 800;
        gainNode.gain.value = 0.2;
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
        break;
      case 'bump':
        osc.frequency.value = 100;
        osc.type = 'square';
        gainNode.gain.value = 0.05;
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
        break;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this.saveMuteSetting();
    return this.muted;
  }

  loadMuteSetting() {
    try {
      const settings = JSON.parse(localStorage.getItem('mazeEscapeSettings') || '{}');
      return settings.soundMuted || false;
    } catch {
      return false;
    }
  }

  saveMuteSetting() {
    try {
      const settings = JSON.parse(localStorage.getItem('mazeEscapeSettings') || '{}');
      settings.soundMuted = this.muted;
      localStorage.setItem('mazeEscapeSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings');
    }
  }
}

// ========================================
// GAME CONTROLLER
// ========================================

class Game {
  constructor() {
    this.state = new GameState();
    this.renderer = new Renderer();
    this.sound = new SoundSystem();
    this.inputHandler = new InputHandler((dir) => this.handleInput(dir));
    this.animationFrame = null;
    this.lastEnemyUpdate = 0;
    this.enemyIndex = 0;

    this.setupEventListeners();
    this.loadProgress();
    this.init();
  }

  init() {
    this.renderer.renderLevelGrid(this.state.maxLevelUnlocked);
    this.updateSoundIcon();
    this.renderer.showScreen('start');
  }

  setupEventListeners() {
    // Start screen
    document.getElementById('continueBtn').addEventListener('click', () => {
      this.startLevel(this.state.currentLevel);
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.sound.toggleMute();
      this.updateSoundIcon();
    });

    document.getElementById('levelGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('level-btn') && !e.target.classList.contains('locked')) {
        const level = parseInt(e.target.dataset.level);
        this.startLevel(level);
      }
    });

    // Game screen
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.pauseGame();
    });

    // Pause overlay
    document.getElementById('resumeBtn').addEventListener('click', () => {
      this.resumeGame();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
      this.renderer.hideOverlay('pause');
      this.startLevel(this.state.currentLevel);
    });

    document.getElementById('quitBtn').addEventListener('click', () => {
      this.quitToMenu();
    });

    // Victory screen
    document.getElementById('replayBtn').addEventListener('click', () => {
      this.startLevel(this.state.currentLevel);
    });

    document.getElementById('nextLevelBtn').addEventListener('click', () => {
      this.startLevel(this.state.currentLevel + 1);
    });

    document.getElementById('levelSelectBtn').addEventListener('click', () => {
      this.quitToMenu();
    });

    // Game over overlay
    document.getElementById('retryBtn').addEventListener('click', () => {
      this.renderer.hideOverlay('gameOver');
      this.startLevel(this.state.currentLevel);
    });

    document.getElementById('quitGameOverBtn').addEventListener('click', () => {
      this.quitToMenu();
    });

    // Page visibility (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.renderer.screens.game.classList.contains('hidden') === false) {
        this.pauseGame();
      }
    });
  }

  startLevel(levelNum) {
    this.state.loadLevel(levelNum);
    this.renderer.showScreen('game');
    this.renderer.renderMaze(this.state.mazeGrid);
    this.renderer.renderHUD(this.state);

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.gameLoop();
  }

  handleInput(direction) {
    if (this.state.isMoving) return;

    const moved = this.state.movePlayer(direction);

    if (moved) {
      this.state.isMoving = true;

      if (this.state.moves === 1) {
        this.state.startTimer();
      }

      this.renderer.updateMaze(this.state.mazeGrid);
      this.renderer.renderHUD(this.state);
      this.sound.playSound('move');

      setTimeout(() => {
        this.state.isMoving = false;

        // Check for enemy collision
        if (this.checkEnemyCollision()) {
          this.handleEnemyCollision();
        }

        // Check win condition
        if (this.checkWinCondition()) {
          this.handleWin();
        }
      }, this.state.speedBoostActive ? MOVE_ANIMATION_MS / 2 : MOVE_ANIMATION_MS);
    } else {
      this.sound.playSound('bump');
      this.renderer.playAnimation('shake');
    }
  }

  checkEnemyCollision() {
    return this.state.enemies.some(enemy =>
      enemy.x === this.state.playerPos.x && enemy.y === this.state.playerPos.y
    );
  }

  handleEnemyCollision() {
    this.sound.playSound('damage');
    this.renderer.playAnimation('flash');

    const lives = this.state.loseLife();
    this.renderer.renderHUD(this.state);

    if (lives === 0) {
      this.state.stopTimer();
      setTimeout(() => {
        this.renderer.showOverlay('gameOver');
      }, 500);
    } else {
      this.renderer.updateMaze(this.state.mazeGrid);
    }
  }

  checkWinCondition() {
    const atExit = this.state.checkCollision(this.state.playerPos.x, this.state.playerPos.y) === TILE_TYPES.EXIT;
    return atExit;
  }

  handleWin() {
    this.state.stopTimer();
    this.sound.playSound('win');

    // Update progress
    if (this.state.currentLevel >= this.state.maxLevelUnlocked) {
      this.state.maxLevelUnlocked = this.state.currentLevel + 1;
    }

    const bestTime = this.saveLevelStats();
    this.saveProgress();

    setTimeout(() => {
      this.renderer.showVictoryScreen(this.state, bestTime);
    }, 500);
  }

  pauseGame() {
    this.state.stopTimer();
    this.renderer.showOverlay('pause');
  }

  resumeGame() {
    this.renderer.hideOverlay('pause');
    if (this.state.moves > 0) {
      this.state.startTimer();
    }
  }

  quitToMenu() {
    this.state.stopTimer();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.renderer.hideOverlay('pause');
    this.renderer.hideOverlay('gameOver');
    this.renderer.renderLevelGrid(this.state.maxLevelUnlocked);
    this.renderer.showScreen('start');
  }

  gameLoop() {
    // Update enemies (for level 6+)
    const now = Date.now();
    if (this.state.enemies.length > 0 && now - this.lastEnemyUpdate > ENEMY_MOVE_INTERVAL) {
      this.updateEnemies();
      this.lastEnemyUpdate = now;
    }

    this.animationFrame = requestAnimationFrame(() => this.gameLoop());
  }

  updateEnemies() {
    this.state.enemies.forEach(enemy => {
      if (!enemy.path || enemy.path.length === 0) return;

      // Clear old position
      if (this.state.mazeGrid[enemy.y][enemy.x] === TILE_TYPES.ENEMY) {
        this.state.mazeGrid[enemy.y][enemy.x] = TILE_TYPES.PATH;
      }

      // Move to next position in path
      this.enemyIndex = (this.enemyIndex + 1) % enemy.path.length;
      const [newX, newY] = enemy.path[this.enemyIndex];

      enemy.x = newX;
      enemy.y = newY;

      // Don't overwrite player
      if (this.state.mazeGrid[newY][newX] !== TILE_TYPES.PLAYER) {
        this.state.mazeGrid[newY][newX] = TILE_TYPES.ENEMY;
      }
    });

    this.renderer.updateMaze(this.state.mazeGrid);

    // Check collision after enemy movement
    if (!this.state.isMoving && this.checkEnemyCollision()) {
      this.handleEnemyCollision();
    }
  }

  saveProgress() {
    try {
      const data = {
        maxLevel: this.state.maxLevelUnlocked,
        currentLevel: this.state.currentLevel
      };
      localStorage.setItem('mazeEscapeProgress', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress');
    }
  }

  loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem('mazeEscapeProgress') || '{}');
      this.state.maxLevelUnlocked = data.maxLevel || 1;
      this.state.currentLevel = data.currentLevel || 1;
    } catch {
      this.state.maxLevelUnlocked = 1;
      this.state.currentLevel = 1;
    }
  }

  saveLevelStats() {
    try {
      const stats = JSON.parse(localStorage.getItem('mazeEscapeLevelStats') || '{}');
      const levelKey = this.state.currentLevel.toString();

      const currentBest = stats[levelKey]?.bestTime;

      if (!currentBest || this.state.timer < currentBest) {
        stats[levelKey] = {
          bestTime: this.state.timer,
          bestMoves: this.state.moves
        };
        localStorage.setItem('mazeEscapeLevelStats', JSON.stringify(stats));
      }

      return currentBest;
    } catch {
      return null;
    }
  }

  updateSoundIcon() {
    const icon = document.getElementById('soundIcon');
    icon.textContent = this.sound.muted ? '🔇' : '🔊';
  }
}

// ========================================
// INITIALIZE GAME
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});
