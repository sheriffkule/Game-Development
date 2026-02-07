/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas?.getContext('2d');

if (!canvas || !ctx) {
  console.error('Canvas not found or could not be initialized');
}

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
  enemies = [];
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
  keys = { left: false, right: false, shoot: false };
  enemyFrame = 0;
}

// Start Game
function startGame() {
  initGame();
  loop();
}

// Controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ') keys.shoot = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ') keys.shoot = false;
});

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
  let speed = 1.4;

  if (typeRand < 0.2) {
    type = 'heavy';
    hp = 3;
    width = 40;
    speed = 1.1;
  } else if (typeRand < 0.6) {
    type = 'medium';
    hp = 2;
    width = 40;
    speed = 1.1;
  }
  const x = Math.random() * (canvas.width - width);
  enemies.push({ x, y: -20, width, height: 20, hp, speed, type });
}

// Spawn boss
function spawnBoss() {
  boss = { x: 240, y: 50, width: 120, height: 40, hp: 20 + level * 5, maxHp: 20 + level * 5, speed: 2 + level / 2, dir: 1 };
  bossActive = true;
}

// Spawn final boss
function spawnFinalBoss() {
  boss = { x: 150, y: 30, width: 300, height: 60, hp: 80 + level * 10, maxHp: 80 + level * 10, speed: 2, dir: 1, phase: 0, timer: 0 };
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
    ctx.fillStyle = 'red';
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
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    ctx.fillRect(b.x, b.y, b.w, b.h);
    b.y -= b.speed;
    if (b.y < 0) bullets.splice(i, 1);
  }
}

// Draw enemies and shooting
function drawEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    ctx.fillStyle = e.type === 'small' ? '#ffb84d' : e.type === 'medium' ? '#ff4d4d' : '#ff8080';
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
    if (b.y > canvas.height) {
      enemyBullets.splice(i, 1);
    } else if (b.y > tank.y && b.x > tank.x && b.x < tank.x + tank.width) {
      enemyBullets.splice(i, 1);
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
    if (p.y + p.height > tank.y && p.x < tank.x + tank.width && p.x + p.width > tank.x) {
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
  ctx.fillRect(boss.x, boss.y - 10, (boss.hp / boss.maxHp) * boss.width, 5);
}

// Draw boss bullets
function drawBossBullets() {
  ctx.fillStyle = 'red';
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    const b = bossBullets[i];
    ctx.fillRect(b.x, b.y, 5, 10);
    b.y += b.speed;
    if (b.y > canvas.height) {
      bossBullets.splice(i, 1);
    } else if (b.y > tank.y && b.x > tank.x && b.x < tank.x + tank.width) {
      bossBullets.splice(i, 1);
      tank.hp--;
      tank.hitTimer = 10;
      if (tank.hp <= 0) triggerGameOver();
    }
  }
}

// Draw explosions
function drawExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const e = explosions[i];
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * (e.life / 30), 0, Math.PI * 2);
    ctx.fillStyle = e.color;
    ctx.fill();
    e.x += e.vx;
    e.y += e.vy;
    e.life--;
    if (e.life <= 0) explosions.splice(i, 1);
  }
}

// Move tank & boss
function moveTank() {
  if (keys.left && tank.x > 0) tank.x -= tank.speed;
  if (keys.right && tank.x + tank.width < canvas.width) tank.x += tank.speed;
  if (keys.shoot) shootBullet();
  if (tank.fireCoolDown > 0) tank.fireCoolDown--;
}

function moveBoss() {
  if (!bossActive) return;
  if (finalBossActive) {
    boss.x += boss.speed * boss.dir;
    boss.timer++;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.dir *= -1;
    if (boss.timer % 60 === 0) {
      for (let i = 0; i < 5; i++) {
        bossBullets.push({ x: boss.x + Math.random() * boss.width, y: boss.y + boss.height, speed: 4 });
      }
    }
  } else {
    boss.x += boss.speed * boss.dir;
    if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.dir *= -1;
  }
}

// Check collisions
function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
        e.hp -= poweredUp ? 2 : 1;
        bullets.splice(i, 1);
        createExplosion(b.x, b.y, 10, 'yellow');
        if (e.hp <= 0) {
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, 20, 'red');
          score++;
          if (Math.random() < 0.3) spawnPowerUp(e.x + e.width / 2, e.y + e.height);
          enemies.splice(j, 1);
        }
        break;
      }
    }
    if (
      bossActive &&
      b.x > boss.x &&
      b.x < boss.x + boss.width &&
      b.y > boss.y &&
      b.y < boss.y + boss.height
    ) {
      boss.hp -= poweredUp ? 2 : 1;
      bullets.splice(i, 1);
      createExplosion(b.x, b.y, 10, 'yellow');
      if (boss.hp <= 0) {
        bossActive = false;
        createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 50, 'red');
        for (let n = 0; n < 10; n++)
          createExplosion(
            boss.x + Math.random() * boss.width,
            boss.y + Math.random() * boss.height,
            20 + Math.random() * 10,
            ['orange', 'yellow', 'red'][Math.floor(Math.random() * 3)],
          );
        score += finalBossActive ? 20 : 5;
        spawnPowerUp(boss.x + boss.width / 2, boss.y + boss.height);
        if (!finalBossActive) level++;
      }
    }
  }
}
// Draw UI with HP percentage
function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${score} | Level: ${level}`, 20, 20);

  const hpPercent = (tank.hp / tank.maxHp) * 100;
  ctx.fillStyle = 'red';
  ctx.fillRect(500, 15, 100, 10);
  ctx.fillStyle = 'lime';
  ctx.fillRect(500, 15, hpPercent, 10);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(500, 15, 100, 10);

  if (poweredUp) {
    ctx.fillStyle = 'cyan';
    ctx.fillRect(20, 30, (powerTimer / 300) * 100, 10);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(20, 30, 100, 10);
  }
}

// Game over
function triggerGameOver() {
  gameOver = true;
  restartBtn.style.display = 'inline-block';
}

// Main loop
function loop() {
  if (gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = '32px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 30, canvas.height / 2 + 30);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTank();
  drawBullets();
  drawEnemies();
  drawEnemyBullets();
  drawPowerUps();
  drawBoss();
  drawBossBullets();
  drawExplosions();
  drawUI();

  moveTank();
  moveBoss();
  checkCollisions();

  enemyFrame++;
  if (enemyFrame > 120) {
    spawnEnemy();
    enemyFrame = 0;
  }

  // Spawn boss based on score and level
  if (!bossActive && score >= 10 * level) {
    if (level >= 3 && !finalBossActive) {
      spawnFinalBoss();
    } else {
      spawnBoss();
    }
  }

  if (poweredUp) {
    powerTimer--;
    if (powerTimer <= 0) poweredUp = false;
  }

  requestAnimationFrame(loop);
}
