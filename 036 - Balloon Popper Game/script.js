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
}
