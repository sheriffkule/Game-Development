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

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStickman();
  drawBow();

  if (flashTimer > 0) flashTimer--;

  requestAnimationFrame(gameLoop);
}
gameLoop();
