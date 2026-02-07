/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Buttons
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game variables
let tank;
let bullets;
let enemyBullets;
let bossBullets;
let enemies;
let boss;
let bossActive;
let finalBossActive;

let powerUps;
let poweredUp;
let powerTimer;
let explosions;

let score;
let level;
let gameOver;

let keys;
let enemyFrame;

// Controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ') keys.shot = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ') keys.shot = false;
});

// Start Game
startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  startGame();
});

// Restart Game (only visible after game over)
restartBtn.addEventListener('click', () => {
  restartBtn.style.display = 'none';
  startGame();
});

// Initialize game variables
function initGame() {
  tank = { x: 275, y: 360, width: 50, height: 20, speed: 5, hp: 3, maxHp: 3, fireCoolDown: 0, hitTimer: 0 };
  bullets = [];
  enemyBullets = [];
  bossBullets = [];
  boss = null;
  bossActive = false;
  finalBossActive = false;
  powerUps = [];
  poweredUp = false;
  powerTimer = 0;
  explosions = [];
  score = 0;
  level = 1;
  gameOver = false;
  keys = { left: false, right: false, shot: false };
  enemyFrame = 0;
}

// Start Game
function starGame() {
  initGame();
  loop();
}

// Shoot bullet
function shootBullet() {
  if (tank.fireCoolDown > 0) return;
  tank.fireCoolDown = poweredUp ? 10 : 20;
  if (poweredUp && Math.random() < 0.5) {
    bullets.push({ x: tank.x + 8, y: tank.y, w: 5, h: 10, speed: 7 });
    bullets.push({ x: tank.x + tank.width - 13, y: tank.y, w: 5, h: 10, speed: 7 });
  } else {
    bullets.push({ x: tank.x + tank.width / 2 - 2.5, y: tank.y, w: 5, h: 10, speed: 7 });
  }
}

// Spawn enemy
function spawnEnemy() {
  const typeRand = Math.random();
  let type = 'small';
  let hp = 1;
  let width = 30;
  let speed = 1.5;

  if (typeRand < 0.2) {
    type = 'heavy';
    hp = 3;
    width = 40;
    speed = 1.2;
  } else if (typeRand < 0.6) {
    type = 'medium';
    hp = 2;
    width = 40;
    speed = 1.2;
  }
  const x = Math.random() * (canvas.width - width);
  enemies.push({ x, y: -20, width, height: 20, hp, speed, type });
}
