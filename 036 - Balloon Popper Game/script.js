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
    ctx.arc(this.x, this.y, this.radius0, 0, Math.PI * 2);
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
  updatedGame();
  setInterval(() => {
    if (gameRunning) spawnBallon();
  }, 1200);
}
