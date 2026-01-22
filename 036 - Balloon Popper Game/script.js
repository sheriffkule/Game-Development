/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverText = document.getElementById('gameOverText');

let balloons = [];
let clouds = [];
let sparkles = [];
let particles = [];
let scorePopups = [];
let fragments = [];

let score = 0;
let lives = 5;
let gameRunning = false;

const colors = ['red', 'green', 'yellow', 'orange', 'purple', 'pink'];
const rareColors = ['gold'];

class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 2 + 1;
    this.alpha = 1;
  }
  update() {
    this.alpha -= 0.03;
    this.x += 0.2;
    this.draw();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,215,0,${this.alpha})`;
    ctx.fill();
    ctx.closePath();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 3 + 2;
    this.color = color;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.05;
    this.draw();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
    ctx.closePath();
  }
}

class Fragment {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;
    this.color = color;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.05;
    this.draw();
  }
  draw() {
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

class ScorePopup {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.alpha = 1;
    this.color = color;
  }
  update() {
    this.y -= 0.5;
    this.alpha -= 0.02;
    this.draw();
  }
  draw() {
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.font = '16px Arial';
    ctx.fillText(this.text, this.x, this.y);
  }
}

class Balloon {
  constructor(x, y, radius, color, isRare = false) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speed = isRare ? Math.random() * 0.8 + 0.5 : Math.random() * 1.5 + 1;
    this.isRare = isRare;
    this.popping = false;
    this.popFrames = 0;
    this.glowPhase = Math.random() * Math.PI * 2;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.stringPhase = Math.random() * Math.PI * 2;
    this.windPhase = Math.random() * Math.PI * 2;
    if (isRare) this.pointValue = 20;
    else if (radius >= 40) this.pointValue = 10;
    else if (radius >= 30) this.pointValue = 5;
    else if (radius >= 20) this.pointValue = 3;
    else this.pointValue = 1;
  }
  draw() {
    const windX = Math.sin(this.windPhase) * 1.5;
    this.windPhase += 0.005;

    const stringSway = Math.sin(this.stringPhase) * 5;
    this.stringPhase += 0.02;
    ctx.beginPath();
    ctx.moveTo(this.x + stringSway + windX, this.y + this.radius);
    ctx.lineTo(this.x + stringSway + windX, this.y + this.radius + 40);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    if (this.isRare) {
      this.glowPhase += 0.05;
      ctx.shadowBlur = 15 + 5 * Math.sin(this.glowPhase);
      ctx.shadowColor = 'gold';
      if (Math.random() < 0.2) sparkles.push(new Sparkle(this.x, this.y + this.radius));
    } else {
      ctx.shadowBlur = 0;
    }

    this.swayPhase += 0.02;
    const swayX = Math.sin(this.swayPhase) * 5;
    ctx.beginPath();
    ctx.arc(this.x + swayX + windX, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.closePath();
    ctx.shadowBlur = 0;

    if (this.popping) {
      ctx.beginPath();
      ctx.arc(this.x + swayX + windX, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    }
  }
  update() {
    if (!this.popping) {
      this.y -= this.speed;
    } else {
      this.popFrames++;
    }
  }
}

class Cloud {
  constructor(x, y, size, speed, dir) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.size = size;
    this.speed = speed;
    this.dir = dir;
    this.morphPhase = Math.random() * Math.PI * 2;
  }
  draw() {
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 1.5, this.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.x += this.speed * this.dir;
    if (this.dir === 1 && this.x - this.size * 1.5 > canvas.width) this.x = -this.size * 2;
    if (this.dir === -1 && this.x + this.size * 1.5 < 0) this.x = canvas.width + this.size * 2;
    this.morphPhase += 0.01;
    this.size = this.baseSize + Math.sin(this.morphPhase) * (this.baseSize * 0.1);
  }
}

function spawnBallon() {
  const radius = Math.random() * 25 + 15;
  const x = Math.random() * (canvas.width - radius * 2) + radius;
  const y = canvas.height + radius;
  const isRare = Math.random() < 0.03;
  const color = isRare ? rareColors[0] : colors[Math.floor(Math.random() * colors.length)];
  balloons.push(new Balloon(x, y, radius, color, isRare));
}

function spawnClouds() {
  for (let i = 0; i < 6; i++) {
    let size = Math.random() * 30 + 30;
    let x = Math.random() * canvas.width;
    let y = Math.random() * (canvas.height / 2);
    let speed = Math.random() * 0.3 + 0.1;
    let dir = Math.random() < 0.5 ? 1 : -1;
    clouds.push(new Cloud(x, y, size, speed, dir));
  }
}

function drawHUD() {
  // HUD background with glow
  ctx.shadowColor = 'rgba(255,255,255,0.7)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(10, 10, 160, 40);
  ctx.fillRect(canvas.width - 140, 10, 130, 40);
  ctx.shadowBlur = 0;

  // HUD text
  ctx.fillStyle = '#222';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 20, 35);
  ctx.fillText('Lives: ' + lives, canvas.width - 130, 35);
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clouds.forEach((cloud) => {
    cloud.update();
    cloud.draw();
  });
  balloons.forEach((b, i) => {
    b.update();
    b.draw();
    if (!b.popping && b.y + b.radius < 0) {
      balloons.splice(i, 1);
      lives--;
      if (lives <= 0) endGame();
    }
    if (b.popping && b.popFrames > 10) balloons.splice(i, 1);
  });
  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].update();
    if (sparkles[i].alpha <= 0) sparkles.splice(i, 1);
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    scorePopups[i].update();
    if (scorePopups[i].alpha <= 0) scorePopups.splice(i, 1);
  }
  for (let i = fragments.length - 1; i >= 0; i--) {
    fragments[i].update();
    if (fragments[i].alpha <= 0) fragments.splice(i, 1);
  }
  drawHUD();
  if (gameRunning) requestAnimationFrame(updateGame);
}

function endGame() {
  gameRunning = false;
  gameOverText.style.opacity = 1;
  restartBtn.style.display = 'block';
}

canvas.addEventListener('click', (e) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  balloons.forEach((b) => {
    const dist = Math.hypot(mouseX - b.x, mouseY - b.y);
    if (dist < b.radius && !b.popping) {
      b.popping = true;
      score += b.pointValue;
      for (let i = 0; i < 10; i++)
        particles.push(new Particle(b.x, b.y, b.color === 'gold' ? '255,215,0' : '255,0,0'));
      scorePopups.push(
        new ScorePopup(b.x, b.y, '+' + b.pointValue, b.color === 'gold' ? '255,215,0' : '255,0,0'),
      );
      for (let i = 0; i < 8; i++)
        fragments.push(new Fragment(b.x, b.y, b.color === 'gold' ? '255,215,0' : '255,0,0'));
    }
  });
});

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  startGame();
});

restartBtn.addEventListener('click', () => {
  restartBtn.style.display = 'none';
  gameOverText.style.opacity = 0;
  startGame();
});

function startGame() {
  balloons = [];
  clouds = [];
  sparkles = [];
  particles = [];
  scorePopups = [];
  fragments = [];
  score = 0;
  lives = 5;

  spawnClouds();
  gameRunning = true;
  updateGame();
  setInterval(() => {
    if (gameRunning) spawnBallon();
  }, 1200);
}
