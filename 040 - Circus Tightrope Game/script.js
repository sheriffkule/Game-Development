/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const confettiCanvas = document.getElementById('confettiCanvas');
const cctx = confettiCanvas.getContext('2d');
confettiCanvas.width = canvas.width;
confettiCanvas.height = canvas.height;

const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

let score = 0;
let level = 0;
let gameOver = false;
let gameStarted = false;
const baseY = canvas.height * 0.7;

class Player {
  constructor() {
    this.x = 150;
    this.y = baseY;
    this.angle = 0;
    this.onRope = true;
    this.jump = false;
    this.vy = 0;
    this.rot = 0;
    this.falling = 0;
  }
  update() {
    if (this.falling) {
      this.y += this.vy;
      this.vy += 0.5;
      this.rot += 0.2;
      if (this.y > canvas.height * 0.5) gameOver = true;
      return;
    }
    if (this.onRope) {
      this.angle += (Math.random() - 0.5) * 0.01 * level;
      if (keys.left) this.angle -= 0.05;
      if (keys.right) this.angle += 0.05;
      if (Math.abs(this.angle) > 0.6) this.startFalling();
    }
    if (this.jump) {
      this.y += this.vy;
      this.vy += 0.5;
      this.rot += 0.5;
      if (this.y >= baseY) {
        this.y = baseY;
        this.jump = false;
        this.vy = 0;
        this.rot = 0;
      }
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + this.rot);
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill(); // head
    ctx.fillStyle = 'blue';
    ctx.fillRect(-10, -5, 20, 30); // body
    ctx.fillStyle = 'red';
    ctx.fillRect(-30, -2, 60, 5); // pole
    ctx.restore();
  }
  doJump() {
    if (!this.jump && this.onRope && !this.falling) {
      this.jump = true;
      this.vy = -10;
    }
  }
  startFalling() {
    this.falling = true;
    this.vy = 2;
    this.rot = 0;
  }
}

class Obstacle {
  constructor() {
    this.x = canvas.width;
    this.y = baseY;
    this.size = 25;
    this.speed = 3 + level * 0.5;
    this.frame = 0;
  }
  update() {
    this.x -= this.speed;
    this.frame++;
  }
  draw() {
    let flick = Math.sin(this.frame * 0.3) * 5;
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(this.x, this.y - flick, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y - flick - 10, this.size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // sparks
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.x + (Math.random() * 10 - 5), this.y - flick - Math.random() * 20, 2, 2);
    }
  }
}

let player = new Player();
let obstacles = [];
let timer = 0;
let confetti = [];
const keys = { left: false, right: false };


function getNextSpawn() {
  const base = Math.max(40, 100 - level * 6); 
  const jitter = Math.floor(Math.random() * 80);
  return base + jitter;
}
let nextSpawn = getNextSpawn();

let spotlightAngle = 0;

let stars = [];
let starTimer = 0;
let starNextMove = 2 + Math.floor(Math.random() * 3); // 2 or 3 frames

function initStars() {
  stars = [];
  for (let i = 0; i < 40; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      size: Math.floor(Math.random() * 5) + 1,
    });
  }
}
initStars();

function drawBackground() {
  // sky
  ctx.fillStyle = '#001';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Stars (stateful; only move every 2-3 frames)
  ctx.fillStyle = 'white';
  starTimer++;
  if (starTimer >= starNextMove) {
    stars.forEach((s) => {
      s.x += (Math.random() - 0.5) * 2; // small horizontal jitter
      s.y += (Math.random() - 0.5) * 1; // small vertical drift
      if (s.x < 10) s.x = 0;
      if (s.x > canvas.width) s.x = canvas.width;
      if (s.y < 10) s.y = 0;
      if (s.y > canvas.height * 0.5) s.y = canvas.height * 0.5;
    });
    starTimer = 0;
    starNextMove = 2 + Math.floor(Math.random() * 3); // 2 or 3 frames next time
  }
  
  stars.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    if (s.size > 1) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  // Spotlight
  spotlightAngle += 0.01;
  drawSpotlight(canvas.width / 2 - 200, 0, spotlightAngle);
  drawSpotlight(canvas.width / 2 + 200, 0, -spotlightAngle);

  // Circus tent stripes (draw on top of spotlights for visibility)
  const stripeW = 80;
  ctx.lineWidth = 2;
  for (let i = 0; i < Math.ceil(canvas.width / stripeW) + 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * stripeW, canvas.height);
    ctx.lineTo((i + 0.5) * stripeW, canvas.height * 0.2); // slightly higher peak
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#e53935' : '#ffd54f'; // brighter red/yellow
    ctx.fill();

    // darker outline for contrast
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.stroke();

    // thin highlight to make edges pop
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}

function drawSpotlight(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
  grad.addColorStop(0, 'rgba(255,255,200,0.5)');
  grad.addColorStop(1, 'rgba(255,255,200,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.lineTo(100, 0);
  ctx.lineTo(200, 500);
  ctx.lineTo(-200, 500);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
} 

function spawnConfetti() {
  for (let i = 0; i < 120; i++) {
    confetti.push({
      x: Math.floor(Math.random() * canvas.width),
      y: Math.floor(Math.random() * canvas.height),
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 2,
      size: Math.floor(Math.random() * 6 + 3),
      color: `hsl(${Math.floor(Math.random() * 360)},100%,50%)`,
      rot: 0,
      dr: (Math.random() - 0.5) * 0.2,
    });
  }
}

function updateConfetti() {
  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confetti.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.dr;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    cctx.restore();
  });
  confetti = confetti.filter((p) => p.y < canvas.height);
}

function levelUp() {
  level++;
  levelEl.textContent = level;
  overlay.style.opacity = 1;
  spawnConfetti();
  setTimeout(() => (overlay.style.opacity = 0), 1500);
}

function restart() {
  score = 0;
  level = 1;
  gameOver = false;
  obstacles = [];
  player = new Player();
  timer = 0;
  nextSpawn = getNextSpawn();
  confetti = [];
  // reset star motion timing and positions
  starTimer = 0;
  starNextMove = 2 + Math.floor(Math.random() * 2);
  initStars();
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

function loop() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, baseY + 20, canvas.width, 5);

  player.update();
  player.draw();

  if (!player.falling) {
    timer++;
    if (timer > nextSpawn) {
      obstacles.push(new Obstacle());
      timer = 0;
      nextSpawn = getNextSpawn();
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      let o = obstacles[i];
      o.update();
      o.draw();
      if (o.x < -50) obstacles.splice(i, 1);
      if (Math.abs(player.x - o.x) < 25 && Math.abs(player.y - o.y) < 25 && !player.jump) {
        player.startFalling();
      }
    }
  }

  if (player.onRope && !player.falling) {
    score++;
    scoreEl.textContent = score;
    if (score % 500 === 0) levelUp();
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over - Press R to Restart', canvas.width / 2, canvas.height / 2);
  }

  updateConfetti();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'Space') player.doJump();
  if (e.key.toLowerCase() === 'r' && gameOver) restart();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
});

startButton.addEventListener('click', () => {
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  confettiCanvas.style.display = 'block';
  document.getElementById('hud').style.display = 'block';
  gameStarted = true;
  loop();
});
