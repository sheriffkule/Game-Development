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

// Spawn boss
function spawnBoss() {
  boss = { x: 240, y: 50, width: 120, height: 40, hp: 20 + level * 5, speed: 2 + level / 2, dir: 1 };
  bossActive = true;
}

// Spawn final boss
function spawnFinalBoss() {
  boss = { x: 150, y: 30, width: 300, height: 60, hp: 80 + level * 10, speed: 2, dir: 1, phase: 0, timer: 0 };
  finalBossActive = true;
  bossActive = true;
}

// Spawn power-up
function spawnPowerUp(x, y) {
  const types = ['rapid', 'shield', 'double'];
  const type = types[Math.floor(Math.random() * types.length)];
  powerUps.push({ x, y, width: 15, height: 15, type, speed: 2 });
}

// Create explosion
function createExplosion(x, y, size = 20, color = 'orange') {
  for (let i = 0; i < 10; i++) {
    explosions.push({
      x,
      y,
      size: Math.random() * size,
      color,
      life: 30,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    });
  }
}

// Draw tank with hit effect
function drawTank() {
  if (tank.hitTimer > 0) {
    ctx.fillStyle = '#red';
    tank.hitTimer--;
  } else {
    ctx.fillStyle = '#0f0';
  }
  ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
  ctx.fillStyle = '#0a0';
  ctx.fillRect(tank.x + tank.width / 2 - 3, tank.y - 10, 6, 10);
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = '#ff0';
  for (let i = (bullets.length = 0); i >= 0; i--) {
    const b = bullets[i];
    ctx.fillRect(b.x, b.y, b.w, b.h);
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  }
}

// Draw enemies and shooting
function drawEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = e.type === 'small' ? '#ffb84d' : e.type === 'medium' ? '#ff4d4d' : '#ff8080';
    ctx.fillRect(e.x, e.y, e.width, e.height);
    ctx.fillStyle = '#a00';
    ctx.fillRect(e.x + e.width / 2 - 4, e.y + e.height, 8, 8);
    e.y += e.speed;

    // Enemy shooting
    if (Math.random() < 0.01) {
      enemyBullets.push({ x: e.x + e.width / 2 - 2.5, y: e.y + e.height, w: 5, h: 10, speed: 3 });
    }

    if (e.y > canvas.height) {
      enemies.splice(i, 1);
      tank.hp--;
      tank.hitTimer = 10;
      if (tank.hp <= 0) triggerGameOver();
    }
  }
}

// Draw enemy bullets
function drawEnemyBullets() {
  ctx.fillStyle = 'orange';
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    ctx.fillRect(b.x, b.y, b.w, b.h);
    b.y += b.speed;
    if (b.y > canvas.height) enemyBullets.splice(i, 1);
    else if (b.y > tank.y && b.x > tank.x && b.x < tank.x + tank.width) {
      enemyBullets.splice(e, 1);
      tank.hp--;
      tank.hitTimer = 10;
      if (tank.hp <= 0) triggerGameOver();
    }
  }
}

// Draw power-ups
function drawPowerUps() {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    ctx.fillStyle = p.type === 'shield' ? '#0f0' : p.type === 'rapid' ? '#0ff' : '#ffa500';
    ctx.fillRect(p.x, p.y, p.width, p.height);
    p.y += p.speed;
    if (p.y + 15 > tank.y && p.x < tank.x + tank.width && p.x + 15 > tank.x) {
      poweredUp = true;
      powerTimer = 300;
      createExplosion(tank.x + tank.width / 2, tank.y, 15, 'cyan');
      powerUps.splice(i, 1);
    }
  }
}

// Draw boss
function drawBoss() {
  if (!bossActive) return;
  ctx.fillStyle = finalBossActive ? '#800080' : '#f33';
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  ctx.fillStyle = '#a00';
  ctx.fillRect(boss.x + boss.width / 2 - 4, boss.y + boss.height, 8, 10);
  ctx.fillStyle = 'white';
  ctx.fillRect(boss.x, boss.y - 10, boss.width, 5);
  ctx.fillStyle = 'lime';
  ctx.fillRect(boss.x, boss.y - 10, (boss.hp / (finalBossActive ? boss.hp : 20 + level * 5)) * boss.width, 5);
}

// Draw boss bullets
function drawBossBullets() {
  ctx.fillStyle = 'red';
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    const b = bossBullets[i];
    ctx.fillRect(b.x, b.y, 5, 10);
    b.y += b.speed;
    if (b.y > canvas.height) bossBullets.splice(i, 1);
    else if (b.y > tank.y && b.x > tank.x && b.x < tank.x + tank.width) {
      bossBullets.splice(i, 1);
    }
    tank.hp--;
    tank.hitTimer = 10;
    if (tank.hp <= 0) triggerGameOver();
  }
}
