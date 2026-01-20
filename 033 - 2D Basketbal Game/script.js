const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let lives = 3;

// Ball
let ball = { x: 200, y: 500, r: 22, vx: 0, vy: 0, inAir: false, scored: false };

// Hoop + backboard
let rim = { x: 150, y: 160, w: 100, h: 8 };
let board = { x: 140, y: 100, w: 120, h: 70 };

// Rim edges
let rimLeft = { x: rim.x, y: rim.y + rim.h / 2, r: 6 };
let rimRight = { x: rim.x + rim.w, y: rim.y + rim.h / 2, r: 6 };

// Net
let net = Array.from({ length: 6 }, (_, i) => ({
  x: rim.x + (i * rim.w) / 5,
  y: rim.y + rim.h,
  baseY: rim.y + rim.h,
}));

// Floating texts
let texts = [];

// Input handling
let dragging = false,
  startX,
  startY;

// Start drag
function startDrag(x, y) {
  if (!ball.inAir) {
    dragging = true;
    startX = x;
    startY = y;
  }
}

// Release drag
function releaseDrag(x, y) {
  if (dragging && !ball.inAir) {
    let dx = startX - x;
    let dy = startY - y;

    // Curved scaling for smoother control
    let forceX = Math.sign(-dx) * Math.sqrt(Math.abs(dx) * 0.9);
    let forceY = Math.sign(-dy) * Math.sqrt(Math.abs(dy) * 1.1);

    // Clamp velocity
    ball.vx = Math.max(Math.min(forceX, 12), -12);
    ball.vy = Math.max(Math.min(forceY, -10), -18);

    ball.inAir = true;
    ball.scored = false;
  }
  dragging = false;
}

// Mouse events
canvas.addEventListener('mousedown', (e) => startDrag(e.offsetX, e.offsetY));
canvas.addEventListener('mouseup', (e) => releaseDrag(e.offsetX, e.offsetY));

// Touch events
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  startDrag(t.clientX - rect.left, t.clientY - rect.top);
});

canvas.addEventListener('touchend', (e) => {
  const rect = canvas.getBoundingClientRect();
  const t = e.changedTouches[0];
  releaseDrag(t.clientX - rect.left, t.clientY - rect.top);
});
