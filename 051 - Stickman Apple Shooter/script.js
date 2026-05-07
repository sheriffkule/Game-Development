/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let arrows = [];
let bloodDrops = [];
let bloodPools = [];
let popMessages = [];

let isCharging = false;
let power = 0;
let score = 0;
let angle = -Math.PI / 6;
let level = 1;
let wind = 0;
let lives = 3;
let flashTimer = 0;

let isDead = false;
let fallAngle = 0;
let hasCollapsed = false;

const stickman = { x: 600, y: 300 };

// Bow release animation
let releaseAnim = { active: false, pull: 0 };

// Drawing function
function drawStickman() {
  ctx.save();
  ctx.translate(stickman.x, stickman.y);
  ctx.rotate(isDead ? fallAngle : 0);

  ctx.lineWidth = 3;
  ctx.strokeStyle = flashTimer > 0 ? 'red' : 'black';

  // Head
  ctx.beginPath();
  ctx.arc(0, -60, 20, 0, Math.PI * 2);
  ctx.stroke();

  // Eyes
  ctx.beginPath();
  ctx.arc(7, -64, 3, 0, Math.PI * 2);
  ctx.arc(-7, -64, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'brown';
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.moveTo(-8, -50);
  ctx.lineTo(8, -50);
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.moveTo(0, -40);
  ctx.lineTo(0, 40);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(-30, 20 + (isDead ? 20 : 0));
  ctx.moveTo(0, -20);
  ctx.lineTo(30, 20 + (isDead ? 20 : 0));
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(-25, 100 + (isDead ? 15 : 0));
  ctx.moveTo(0, 40);
  ctx.lineTo(25, 100 + (isDead ? 15 : 0));
  ctx.stroke();

  // Apple
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(0, -92, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'green';
  ctx.fillRect(-2, -105, 4, 10);

  // Draw stuck arrows
  arrows.forEach((a) => {
    if (a.stuck && !a.stuckInApple) drawArrowRelative(a.relX, a.relY, a.angle);
  });

  // Arrow in apple
  arrows.forEach((a) => {
    if (a.stuckInApple) {
      ctx.save();
      ctx.translate(0, -90);
      drawArrowRelative(a.relX, a.relY, a.angle);
      ctx.restore();
    }
  });

  ctx.restore();
}

function drawBow() {
  let bowX = 60;
  let bowY = 320;
  let radius = 50;

  ctx.strokeStyle = 'brown';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(bowX, bowY, radius, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.stroke();

  // Bow string
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bowX, bowY - radius);

  let pull = 0;
  if (isCharging) pull = power * 0.3;
  else if (releaseAnim.active) pull = releaseAnim.pull;

  let pullX = bowX - pull * Math.cos(angle);
  let pullY = bowY - pull * Math.sin(angle);

  ctx.lineTo(pullX, pullY);
  ctx.lineTo(bowX, bowY + radius);
  ctx.stroke();

  // Draw arrow nocked
  if (isCharging || releaseAnim.active) drawArrow({ x: pullX, y: pullY, angle: angle });

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.moveTo(bowX, bowY);
  ctx.lineTo(bowX + 100 * Math.cos(angle), bowY + 100 * Math.sin(angle));
  ctx.stroke();
}

function drawArrow(arrow) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(arrow.x, arrow.y);
  ctx.lineTo(arrow.x - 28 * Math.cos(arrow.angle), arrow.y - 28 * Math.sin(arrow.angle));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(arrow.x, arrow.y);
  ctx.lineTo(arrow.x - 10 * Math.cos(arrow.angle - 0.3), arrow.y - 10 * Math.sin(arrow.angle - 0.3));
  ctx.lineTo(arrow.x - 10 * Math.cos(arrow.angle + 0.3), arrow.y - 10 * Math.sin(arrow.angle + 0.3));
  ctx.closePath();
  ctx.fillStyle = 'black';
  ctx.fill();
}

function drawArrowRelative(relX, relY, angle) {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(relX, relY);
  ctx.lineTo(relX - 28 * Math.cos(angle), relY - 28 * Math.sin(angle));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(relX, relY);
  ctx.lineTo(relX - 10 * Math.cos(angle - 0.3), relX - 10 * Math.sin(angle - 0.3));
  ctx.lineTo(relX - 10 * Math.cos(angle + 0.3), relX - 10 * Math.sin(angle + 0.3));
  ctx.closePath();
  ctx.fillStyle = 'black';
  ctx.fill();
}

// Blood
function drawBlood() {
  bloodDrops.forEach((d) => {
    ctx.fillStyle = 'rba(200,0,0,0.9)';
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateBlood() {
  bloodDrops.forEach((d) => {
    d.vy += 0.1;
    d.x += d.vx;
    d.y += d.vy;
    if (d.size > 0.5) d.size *= 0.98;
    if (d.y > canvas.height - 5) {
      addBloodPool(d.x, canvas.height - 5, d.size);
      d.remove = true;
    }
  });
  bloodDrops = bloodDrops.filter((d) => !d.remove);
}

function makeBlood(x, y) {
  for (let i = 0; i < 4; i++) {
    let angle = Math.random() * Math.PI;
    let speed = Math.random() * 2 + 1;
    bloodDrops.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed * 0.5,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2 + 1,
      remove: false,
    });
  }
}

function addBloodPool(x, y, size) {
  let pool = bloodPools.find((p) => Math.abs(p.x - x) < 20);
  if (pool) pool.radius += size * 0.5;
  else bloodPools.push({ x: x, y: y, radius: size * 2 });
}

function drawBloodPools() {
  bloodPools.forEach((p) => {
    if (isDead && p.radius < 100) p.radius += 0.15;
    let gradient = ctx.createRadialGradient(p.x, p.y, p.radius * 0.3, p.x, p.y, p.radius);
    gradient.addColorStop(0, 'rgba(150,0,0,0.9)');
    gradient.addColorStop(1, 'rgba(100,0,0,0.4)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function bleedFromStuckArrows() {
  arrows.forEach((a) => {
    if (a.stuck && !a.stuckInApple) {
      if (Math.random() < 0.2) makeBlood(stickman.x + a.relX, stickman.y + a.relY);
      if (isDead && Math.random() < 0.6) {
        for (let i = 0; i < 2; i++) {
          makeBlood(stickman.x + a.relX, stickman.y + a.relY);
          addBloodPool(stickman.x + a.relX, canvas.height - 5, 2);
        }
      }
    }
  });
  if (isDead && hasCollapsed && Math.random() < 0.8) {
    addBloodPool(stickman.x, canvas.height - 5, 3);
  }
}

// Arrow Mechanics
function shootArrow() {
  if (isDead) return;
  let speed = power * 0.5 * 0.95 ** (level - 1);
  arrows.push({
    x: 60,
    y: 320,
    vx: speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
    angle: angle,
    stuck: false,
    stuckInApple: false,
    prevX: 60,
    prevY: 320,
  });
  releaseAnim.active = true;
  releaseAnim.pull = power * 0.3;
  power = 0;
}

function updateArrows() {
  arrows.forEach((a) => {
    if (a.stuck) return;

    // Move arrow
    a.prevX = a.x;
    a.prevY = a.y;
    a.x += a.vx;
    a.y += a.vy;
    a.vx += wind;
    a.vy += 0.2;
    a.angle = Math.atan2(a.vy, a.vx);

    // Collision Check
    checkCollisionLine(a, stickman.x, stickman.y - 60, 20); // head
    checkCollisionLine(a, stickman.x, stickman.y, 40); // body
    checkCollisionLine(a, stickman.x, stickman.y + 60, 40); // legs

    // Apple collision
    let dx = a.x - stickman.x;
    let dy = a.y - (stickman.y - 90);
    if (Math.sqrt(dx * dx + dy * dy) < 12 && !isDead) {
      a.stuckInApple = true;
      a.stuck = true;
      a.vx = 0;
      a.vy = 0;
      a.relX = 0;
      a.relY = 0;
      popMessages.push({ x: stickman.x, y: stickman.y - 120, text: 'Good Shot!', life: 60 });
      setTimeout(() => {
        score += 100;
        if (score === 1000) {
          popMessages.push({
            x: stickman.x - 100,
            y: stickman.y - 150,
            text: 'Fantastic, You are nailing it!',
            life: 120,
          });
        }
        level++;
        lives++;
        stickman.x += 50;
        if (stickman.x > canvas.width - 50) stickman.x = canvas.width - 50;
        wind = (Math.random() - 0.5) * 0.05;
        arrows = [];
        bloodDrops = [];
        bloodPools = [];
      }, 1500);
    }
  });
}

// Collision function
function checkCollisionLine(arrow, cx, cy, radius) {
  let dist = distanceToSegment(
    { x: arrow.prevX, y: arrow.prevY },
    { x: arrow.x, y: arrow.y },
    { x: cx, y: cy },
  );
  if (dist < radius && !arrow.stuck && !isDead) hitStickman(arrow);
}

function distanceToSegment(p1, p2, c) {
  let A = p2.x - p1.x;
  let B = p2.y - p1.y;
  let dot = ((c.x - p1.x) * A + (c.y - p1.y) * B) / (A * A + B * B);
  dot = Math.max(0, Math.min(1, dot));
  let closestX = p1.x + dot * A;
  let closestY = p1.y + dot * B;
  return Math.hypot(c.x - closestX, c.y - closestY);
}

function hitStickman(arrow) {
  if (arrow.stuck || isDead) return;
  arrow.stuck = true;
  arrow.vx = 0;
  arrow.vy = 0;
  arrow.relX = arrow.x - stickman.x;
  arrow.relY = arrow.y - stickman.y;
  makeBlood(arrow.x, arrow.y);
  flashTimer = 20;
  lives--;
  if (lives <= 0) {
    isDead = true;
    setTimeout(gameOver, 6000);
  }
}

function gameOver() {
  alert('Stickman died!\nFinal Score: ' + score + ' | Level: ' + level);
  score = 0;
  level = 0;
  stickman.x = 600;
  wind = 0;
  lives = 3;
  arrows = [];
  bloodDrops = [];
  bloodPools = [];
  flashTimer = 0;
  isDead = false;
  fallAngle = 0;
  hasCollapsed = false;
}

function drawArrows() {
  arrows.forEach((a) => {
    if (!a.stuck) drawArrow(a);
  });
}

function drawPowerBar() {
  if (isCharging) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(30, 250, power, 10);
  }
}

function drawUI() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Bangers';
  ctx.letterSpacing = '1px';
  ctx.fillText('Score: ' + score, 20, 30);
  ctx.fillText('Level: ' + level, 20, 55);
  ctx.fillText('Lives: ' + lives, 20, 80);
  ctx.fillText('Wind: ' + wind.toFixed(3), 20, 105);
}

function drawPopMessages() {
  for (let i = popMessages.length - 1; i >= 0; i--) {
    let m = popMessages[i];
    ctx.fillStyle = 'green';
    ctx.font = '20px Bangers';
    ctx.letterSpacing = '2px';
    ctx.fillText(m.text, m.x - 40, m.y);
    m.y -= 0.5;
    m.life--;
    if (m.life <= 0) popMessages.splice(i, 1);
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStickman();
  drawBow();
  drawArrows();
  updateArrows();
  drawBlood();
  updateBlood();
  drawBloodPools();
  bleedFromStuckArrows();
  drawUI();
  drawPowerBar();
  drawPopMessages();

  if (flashTimer > 0) flashTimer--;
  if (releaseAnim.active) {
    releaseAnim.pull *= 0.85;
    if (releaseAnim.pull < 1) releaseAnim.active = false;
  }
  if (isDead) {
    if (fallAngle < Math.PI * 0.4) fallAngle += 0.02;
    else if (!hasCollapsed) {
      hasCollapsed = true;
      for (let i = 0; i < 15; i++) {
        addBloodPool(stickman.x + (Math.random() * 50 - 25), canvas.height - 5, 5);
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') isCharging = true;
  if (e.code === 'ArrowUp') angle -= 0.05;
  if (e.code === 'ArrowDown') angle += 0.05;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') {
    isCharging = false;
    shootArrow();
  }
});

setInterval(() => {
  if (isCharging && power < 100) power += 2;
}, 50);

gameLoop();
