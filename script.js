const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 16; // 28 * 16 = 448, 31 * 16 = 496
const corridorScale = 1.25; // corridor (where Pac-Man moves) is 1.25x wider
const corridorTile = Math.round(tileSize * corridorScale); // 20
const wallSize = tileSize; // walls stay 16px
const cols = 28;
const rows = 31;

canvas.width = cols * corridorTile;
canvas.height = rows * corridorTile;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const highScoreEl = document.getElementById("highScore");
const levelEl = document.getElementById("level");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const soundToggleBtn = document.getElementById("soundToggle");

// 0: empty, 1: wall, 2: pellet, 3: power pellet
// Simple Pac-Man inspired layout (not 100% original map)
const levelLayout = [
  "1111111111111111111111111111",
  "1222222222112222222222222221",
  "1211112112112112112111112121",
  "1311112112112112112111112131",
  "1222222222222222222222222221",
  "1211112111112111112111112121",
  "1222222112222222211222222221",
  "1111112112111112112111111111",
  "0000012112110002112110000000",
  "1111112112111112112111111111",
  "1222222222222112222222222221",
  "1211112111112111112111112121",
  "1222212222222222222222122221",
  "1111212111110001111122111111",
  "0000212110000000000122110000",
  "1111212110111111101122111111",
  "1222222220222222202222222221",
  "1211112112111112112111112121",
  "1222222112222222211222222221",
  "1111112112111112112111111111",
  "0000012112110002112110000000",
  "1111112112111112112111111111",
  "1222222222222222222222222221",
  "1211112111112111112111112121",
  "1311112222222112222222112131",
  "1222222111112111111122222221",
  "1111112112222222212111111111",
  "1222222222112222112222222221",
  "1211111112112112111111112121",
  "1222222222222222222222222221",
  "1111111111111111111111111111",
];

let map = [];
let pelletsRemaining = 0;

const pacman = {
  x: 1, // start bottom-left
  y: 29,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  speed: 8, // tiles per second
  radius: tileSize * 0.6,
};

const ghosts = [
  { x: 13, y: 14, dirX: 1, dirY: 0, color: "#ff4b4b", mode: "normal", scaredTimer: 0, releaseTimer: 0 },
  { x: 14, y: 14, dirX: -1, dirY: 0, color: "#4bc6ff", mode: "normal", scaredTimer: 0, releaseTimer: 0 },
  { x: 13, y: 14, dirX: 0, dirY: -1, color: "#ffb8ff", mode: "normal", scaredTimer: 0, releaseTimer: 3 }, // Release after 3 seconds
  { x: 14, y: 14, dirX: 0, dirY: 1, color: "#ffb852", mode: "normal", scaredTimer: 0, releaseTimer: 6 }, // Release after 6 seconds
];

let score = 0;
let lives = 3;
let level = 1;
let highScore = localStorage.getItem('pacmanHighScore') || 0;
let gameOver = false;
let isPaused = false;
let soundEnabled = true;
let lastTime = 0;
let gameTime = 0; // for mouth animation
let powerModeActive = false;
let powerModeTimer = 0;

// --- Sound (Web Audio API, no external files) ---
let audioCtx = null;
let backgroundOsc = null;
let backgroundGain = null;
let backgroundInterval = null;
let backgroundStarted = false;

function getAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function startBackgroundSound() {
  if (backgroundStarted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    ctx.resume();
    backgroundOsc = ctx.createOscillator();
    backgroundGain = ctx.createGain();
    backgroundOsc.connect(backgroundGain);
    backgroundGain.connect(ctx.destination);
    backgroundOsc.type = "sawtooth";
    backgroundOsc.frequency.setValueAtTime(200, ctx.currentTime);
    backgroundGain.gain.setValueAtTime(0.04, ctx.currentTime);
    backgroundOsc.start(ctx.currentTime);
    backgroundStarted = true;
    // Siren: slowly rise and fall like original Pac-Man
    backgroundInterval = setInterval(() => {
      if (!backgroundOsc || !ctx) return;
      const t = Date.now() / 1000;
      const freq = 180 + 130 * Math.sin(t * 0.85);
      backgroundOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.08);
    }, 80);
  } catch (_) {}
}

function playPelletSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(680, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) {}
}

function playPowerPelletSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

function playEatGhostSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (_) {}
}

function playDeathSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch (_) {}
}

function initMap() {
  map = [];
  pelletsRemaining = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let val = Number(levelLayout[r][c]);
      if (val === 2 || val === 3) pelletsRemaining++;
      row.push(val);
    }
    map.push(row);
  }
}

function resetEntities() {
  pacman.x = 1;
  pacman.y = 29;
  pacman.dirX = 0;
  pacman.dirY = 0;
  pacman.nextDirX = 0;
  pacman.nextDirY = 0;

  ghosts[0].x = 13;
  ghosts[0].y = 14;
  ghosts[0].dirX = 1;
  ghosts[0].dirY = 0;
  ghosts[0].mode = "normal";
  ghosts[0].scaredTimer = 0;
  ghosts[0].releaseTimer = 0;

  ghosts[1].x = 14;
  ghosts[1].y = 14;
  ghosts[1].dirX = -1;
  ghosts[1].dirY = 0;
  ghosts[1].mode = "normal";
  ghosts[1].scaredTimer = 0;
  ghosts[1].releaseTimer = 0;

  ghosts[2].x = 13;
  ghosts[2].y = 14;
  ghosts[2].dirX = 0;
  ghosts[2].dirY = -1;
  ghosts[2].mode = "normal";
  ghosts[2].scaredTimer = 0;
  ghosts[2].releaseTimer = 3;

  ghosts[3].x = 14;
  ghosts[3].y = 14;
  ghosts[3].dirX = 0;
  ghosts[3].dirY = 1;
  ghosts[3].mode = "normal";
  ghosts[3].scaredTimer = 0;
  ghosts[3].releaseTimer = 6;
}

function restartGame() {
  score = 0;
  lives = 3;
  level = 1;
  gameOver = false;
  isPaused = false;
  powerModeActive = false;
  powerModeTimer = 0;
  initMap();
  resetEntities();
  updateUI();
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
  highScoreEl.textContent = highScore;
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pacmanHighScore', highScore);
    highScoreEl.textContent = highScore;
  }
}

function isWall(col, row) {
  if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
  return map[row][col] === 1;
}

function trySetDirection(dx, dy) {
  pacman.nextDirX = dx;
  pacman.nextDirY = dy;
}

function handleInput() {
  const centerCol = Math.round(pacman.x);
  const centerRow = Math.round(pacman.y);

  const offsetX = Math.abs(pacman.x - centerCol);
  const offsetY = Math.abs(pacman.y - centerRow);

  // Allow direction change when reasonably aligned, or when stopped so first keypress works
  const aligned = offsetX < 0.35 && offsetY < 0.35;
  const stopped = pacman.dirX === 0 && pacman.dirY === 0;

  if (aligned || stopped) {
    const targetCol = centerCol + pacman.nextDirX;
    const targetRow = centerRow + pacman.nextDirY;
    if (!isWall(targetCol, targetRow)) {
      pacman.dirX = pacman.nextDirX;
      pacman.dirY = pacman.nextDirY;
    }
  }
}

function movePacman(deltaSeconds) {
  handleInput();

  const speedPerFrame = pacman.speed * deltaSeconds;
  let newX = pacman.x + pacman.dirX * speedPerFrame;
  let newY = pacman.y + pacman.dirY * speedPerFrame;

  // Tunnel wrap
  if (newX < 0) newX = cols - 1;
  if (newX > cols - 1) newX = 0;

  const nextCol = Math.round(newX);
  const nextRow = Math.round(newY);

  if (isWall(nextCol, nextRow)) {
    // Block movement into wall; snap back to the corridor tile (the one we're in)
    const dx = pacman.dirX;
    const dy = pacman.dirY;
    pacman.dirX = 0;
    pacman.dirY = 0;
    pacman.x = nextCol - dx;
    pacman.y = nextRow - dy;
    return;
  }

  pacman.x = newX;
  pacman.y = newY;

  // Eat pellets
  const col = Math.round(pacman.x);
  const row = Math.round(pacman.y);
  if (map[row] && (map[row][col] === 2 || map[row][col] === 3)) {
    if (map[row][col] === 2) {
      playPelletSound();
      score += 10;
    } else if (map[row][col] === 3) {
      playPowerPelletSound();
      score += 50;
      activatePowerMode();
    }
    map[row][col] = 0;
    pelletsRemaining--;
    updateUI();

    if (pelletsRemaining <= 0) {
      nextLevel();
    }
  }
}

function activatePowerMode() {
  powerModeActive = true;
  powerModeTimer = 8; // 8 seconds of power mode
  ghosts.forEach(ghost => {
    ghost.mode = "scared";
    ghost.scaredTimer = powerModeTimer;
  });
}

function updatePowerMode(deltaSeconds) {
  if (powerModeActive) {
    powerModeTimer -= deltaSeconds;
    if (powerModeTimer <= 0) {
      powerModeActive = false;
      ghosts.forEach(ghost => {
        if (ghost.mode === "scared") {
          ghost.mode = "normal";
        }
      });
    } else {
      ghosts.forEach(ghost => {
        if (ghost.mode === "scared") {
          ghost.scaredTimer = powerModeTimer;
        }
      });
    }
  }
}

function nextLevel() {
  level++;
  score += 1000; // Level completion bonus
  initMap();
  resetEntities();
  
  // Increase difficulty
  ghosts.forEach(ghost => {
    ghost.speed = 6 + (level - 1) * 0.5; // Increase ghost speed
  });
  
  updateUI();
  setTimeout(() => {
    alert(`Level ${level} - Get ready!`);
  }, 100);
}

function moveGhost(ghost, deltaSeconds) {
  // Handle release timer for new ghosts
  if (ghost.releaseTimer > 0) {
    ghost.releaseTimer -= deltaSeconds;
    return; // Don't move ghost until released
  }
  
  let speed = 6 * deltaSeconds;
  
  // Ghosts move slower when scared
  if (ghost.mode === "scared") {
    speed *= 0.5;
  }
  
  // Increase speed with level
  speed *= (1 + (level - 1) * 0.1);
  
  let newX = ghost.x + ghost.dirX * speed;
  let newY = ghost.y + ghost.dirY * speed;

  const nextCol = Math.round(newX);
  const nextRow = Math.round(newY);

  if (isWall(nextCol, nextRow)) {
    // choose a new random direction (no 180° turn)
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const currentOppX = -ghost.dirX;
    const currentOppY = -ghost.dirY;

    const valid = dirs.filter(
      (d) => !(d.x === currentOppX && d.y === currentOppY)
    );
    const choice = valid[Math.floor(Math.random() * valid.length)];
    ghost.dirX = choice.x;
    ghost.dirY = choice.y;
    return;
  }

  ghost.x = newX;
  ghost.y = newY;

  // Tunnel wrap
  if (ghost.x < 0) ghost.x = cols - 1;
  if (ghost.x > cols - 1) ghost.x = 0;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function checkCollisions() {
  for (const ghost of ghosts) {
    // Don't check collisions for ghosts that haven't been released yet
    if (ghost.releaseTimer > 0) continue;
    
    if (distance(ghost, pacman) < 0.7) {
      if (ghost.mode === "scared") {
        // Eat the ghost
        playEatGhostSound();
        score += 200;
        updateUI();
        
        // Reset ghost to home position
        ghost.x = 13 + Math.floor(Math.random() * 2);
        ghost.y = 14;
        ghost.mode = "normal";
        ghost.scaredTimer = 0;
      } else {
        // Ghost eats Pac-Man
        playDeathSound();
        lives--;
        updateUI();
        if (lives <= 0) {
          gameOver = true;
          setTimeout(() => alert("Game Over!"), 100);
        }
        resetEntities();
        break;
      }
    }
  }
}

function drawMap() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = map[r][c];
      const x = c * corridorTile;
      const y = r * corridorTile;

      if (val === 1) {
        // Wall: draw at same size (wallSize), centered in the wider corridor cell
        const wallX = x + (corridorTile - wallSize) / 2;
        const wallY = y + (corridorTile - wallSize) / 2;
        ctx.fillStyle = "#001b4d";
        ctx.fillRect(wallX, wallY, wallSize, wallSize);
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX + 2, wallY + 2, wallSize - 4, wallSize - 4);
      } else {
        ctx.fillStyle = "#000016";
        ctx.fillRect(x, y, corridorTile, corridorTile);

        if (val === 2) {
          ctx.fillStyle = "#ffd966";
          ctx.beginPath();
          ctx.arc(
            x + corridorTile / 2,
            y + corridorTile / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (val === 3) {
          ctx.fillStyle = "#ffd966";
          ctx.beginPath();
          ctx.arc(
            x + corridorTile / 2,
            y + corridorTile / 2,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
}

function drawPacman() {
  // Draw centered in the corridor cell (corridorTile)
  const px = pacman.x * corridorTile + corridorTile / 2;
  const py = pacman.y * corridorTile + corridorTile / 2;

  const angleOffset =
    pacman.dirX === 1
      ? 0
      : pacman.dirX === -1
      ? Math.PI
      : pacman.dirY === -1
      ? -Math.PI / 2
      : pacman.dirY === 1
      ? Math.PI / 2
      : 0;

  // Animate mouth open/close (chomp) like the original game
  const chompSpeed = 18;
  const mouthOpen = 0.08 + 0.28 * (0.5 + 0.5 * Math.sin(gameTime * chompSpeed));

  ctx.fillStyle = "#ffd966";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(
    px,
    py,
    corridorTile * 0.6,
    angleOffset + mouthOpen,
    angleOffset + Math.PI * 2 - mouthOpen
  );
  ctx.closePath();
  ctx.fill();
}

function drawGhost(ghost) {
  // Don't draw ghosts that haven't been released yet
  if (ghost.releaseTimer > 0) return;
  
  // Draw centered on the ghost's tile so they don't appear half on wall
  const gx = (Math.round(ghost.x) * corridorTile) + corridorTile / 2;
  const gy = (Math.round(ghost.y) * corridorTile) + corridorTile / 2;
  const r = corridorTile * 0.6;

  // Set color based on mode
  if (ghost.mode === "scared") {
    // Flash when power mode is about to end
    if (ghost.scaredTimer < 2 && Math.floor(ghost.scaredTimer * 4) % 2 === 0) {
      ctx.fillStyle = "#fff";
    } else {
      ctx.fillStyle = "#00f";
    }
  } else {
    ctx.fillStyle = ghost.color;
  }
  
  ctx.beginPath();
  ctx.arc(gx, gy, r, Math.PI, 0);
  ctx.lineTo(gx + r, gy + r);
  ctx.lineTo(gx - r, gy + r);
  ctx.closePath();
  ctx.fill();

  // eyes (different for scared mode)
  if (ghost.mode === "scared") {
    // Scared eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(gx - r/3, gy - r/4, r/6, r/3);
    ctx.fillRect(gx + r/6, gy - r/4, r/6, r/3);
  } else {
    // Normal eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(gx - r / 3, gy - r / 4, r / 4, 0, Math.PI * 2);
    ctx.arc(gx + r / 3, gy - r / 4, r / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(gx - r / 3, gy - r / 4, r / 8, 0, Math.PI * 2);
    ctx.arc(gx + r / 3, gy - r / 4, r / 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  ghosts.forEach(drawGhost);
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  gameTime = timestamp / 1000;

  if (!gameOver && !isPaused) {
    movePacman(delta);
    ghosts.forEach((g) => moveGhost(g, delta));
    updatePowerMode(delta);
    checkCollisions();
  }

  draw();
  
  // Draw pause overlay
  if (isPaused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Press P or Space to resume", canvas.width / 2, canvas.height / 2 + 40);
  }
  
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  startBackgroundSound();
  
  // Pause functionality
  if (e.key === " " || e.key === "p" || e.key === "P") {
    e.preventDefault();
    if (!gameOver) {
      isPaused = !isPaused;
    }
    return;
  }
  
  if (isPaused) return; // Don't allow movement when paused
  
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      e.preventDefault();
      trySetDirection(0, -1);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      e.preventDefault();
      trySetDirection(0, 1);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      trySetDirection(-1, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      trySetDirection(1, 0);
      break;
    default:
      break;
  }
});

restartBtn.addEventListener("click", () => {
  startBackgroundSound();
  restartGame();
});

pauseBtn.addEventListener("click", () => {
  if (!gameOver) {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️" : "⏸️";
  }
});

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.textContent = soundEnabled ? "🔊" : "🔇";
  if (!soundEnabled && backgroundOsc) {
    backgroundGain.gain.setValueAtTime(0, audioCtx.currentTime);
  } else if (soundEnabled && backgroundOsc) {
    backgroundGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
  }
});

// Mobile controls
document.querySelectorAll('.control-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (isPaused || gameOver) return;
    
    const direction = btn.dataset.direction;
    switch(direction) {
      case 'up':
        trySetDirection(0, -1);
        break;
      case 'down':
        trySetDirection(0, 1);
        break;
      case 'left':
        trySetDirection(-1, 0);
        break;
      case 'right':
        trySetDirection(1, 0);
        break;
    }
  });
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  startBackgroundSound();
});

canvas.addEventListener('touchend', (e) => {
  if (isPaused || gameOver) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  
  const minSwipeDistance = 30;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > minSwipeDistance) {
      if (dx > 0) {
        trySetDirection(1, 0); // Right
      } else {
        trySetDirection(-1, 0); // Left
      }
    }
  } else {
    if (Math.abs(dy) > minSwipeDistance) {
      if (dy > 0) {
        trySetDirection(0, 1); // Down
      } else {
        trySetDirection(0, -1); // Up
      }
    }
  }
});

initMap();
resetEntities();
updateUI();
requestAnimationFrame(loop);

