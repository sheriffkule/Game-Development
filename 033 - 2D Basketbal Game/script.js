const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let lives = 5;

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

// Physics
const GRAVITY = 0.45;
const BOUNCE = 0.7;

function update() {
  if (ball.inAir) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vy += GRAVITY;

    // Bounce walls
    if (ball.x - ball.r < 0) {
      ball.x = ball.r;
      ball.vx *= -BOUNCE;
    }
    if (ball.x + ball.r > canvas.width) {
      ball.x = canvas.width - ball.r;
      ball.vx *= -BOUNCE;
    }

    // Floor (lose life)
    if (ball.y + ball.r > canvas.height) {
      lives--;
      if (lives <= 0) {
        alert('Game Over! Final Score: ' + score);
        score = 0;
        lives = 5;
      }
      resetBall();
    }

    // Strict scoring check (reset only ball, not lives)
    let rimInnerLeft = rim.x + 12;
    let rimInnerRight = rim.x + rim.w - 12;
    if (
      !ball.scored &&
      ball.vy > 0 &&
      ball.x > rimInnerLeft &&
      ball.x < rimInnerRight &&
      ball.y - ball.r > rim.y &&
      ball.y - ball.r < rim.y + 15
    ) {
      score += 2;
      ball.scored = true;
      texts.push({ x: ball.x, y: rim.y + 30, text: '+2', alpha: 1 });

      // Reset only the ball, keep lives the same
      setTimeout(() => {
        resetBall();
      }, 600);
    }

    // Rim collisions
    collideCircle(rimLeft);
    collideCircle(rimRight);

    // Net interaction
    net.forEach((n) => {
      if (ball.x > n.x - 10 && ball.x < n.x + 10 && ball.y + ball.r > n.y && ball.y - ball.r < n.y + 20) {
        ball.vy *= 0.9;
        n.y += 10;
      }
    });
  }

  // Relax net back
  net.forEach((n) => (n.y += (n.baseY - n.y) * 0.1));

  // Floating texts
  texts.forEach((t) => {
    t.y -= 1;
    t.alpha -= 0.02;
  });
  texts = texts.filter((t) => t.alpha > 0);
}

function collideCircle(c) {
  let dx = ball.x - c.x;
  let dy = ball.y - c.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < ball.r + c.r) {
    let overlap = ball.r + c.r - dist;
    let nx = dx / dist;
    let ny = dy / dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    let dot = ball.vx * nx + ball.vy * ny;
    ball.vx -= 2 * dot * nx;
    ball.vy -= 2 * dot * ny;

    ball.vx *= BOUNCE;
    ball.vy *= BOUNCE;
  }
}

function resetBall() {
  ball.x = 200;
  ball.y = 500;
  ball.vx = 0;
  ball.vy = 0;
  ball.inAir = false;
  ball.scored = false;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Backboard (draw behind rim)
  ctx.fillStyle = '#444';
  ctx.fillRect(board.x, board.y, board.w, board.h);

  // RIm
  ctx.fillStyle = 'orange';
  ctx.fillRect(rim.x, rim.y, rim.w, rim.h);

  // Rim edges
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(rimLeft.x, rimLeft.y, rimLeft.r, 0, Math.PI * 2);
  ctx.arc(rimRight.x, rimRight.y, rimRight.r, 0, Math.PI * 2);

  // Net colored ropes
  for (let i = 0; i < net.length; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'red' : 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(net[i].x, rim.y + rim.h);
    ctx.lineTo(net[i].x, net[i].y);
    ctx.stroke();
  }

  // Ball
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // ScoreBoard
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 20, 30);
  ctx.fillText('Lives: ' + lives, 20, 55);

  // Floating texts
  texts.forEach((t) => {
    ctx.globalAlpha = t.alpha;
    ctx.fillStyle = 'green';
    ctx.font = '24px Arial Black';
    ctx.fillText(t.text, t.x - 15, t.y);
    ctx.globalAlpha = 1;
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
