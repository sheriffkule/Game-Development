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
}
