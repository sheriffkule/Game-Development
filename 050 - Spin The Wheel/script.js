// Elements & state
const wheelCanvas = document.getElementById('wheelCanvas');
const wheelCtx = wheelCanvas.getContext('2d');

const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');

const playerNameInput = document.getElementById('playerName');
const spinBtn = document.getElementById('spinBtn');

const manageBtn = document.getElementById('manageBtn');
const manageModal = document.getElementById('manageModal');
const prizeListEl = document.getElementById('prizeList');
const newPrizeInput = document.getElementById('newPrizeInput');
const closeMenageBtn = document.getElementById('closeMenageBtn');
const closeManageBtn = document.getElementById('closeManageBtn');
const savePrizeBtn = document.getElementById('savePrizeBtn');

const resultModal = document.getElementById('resultModal');
const winnerText = document.getElementById('winnerText');
const prizeText = document.getElementById('prizeText');
const playAgainBtn = document.getElementById('playAgainBtn');
const closeResultBtn = document.getElementById('closeResultBtn');

const clickSound = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
const winSound = new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');

let prizes = ['5$ Gift Card', 'Free Coffee', 'Extra Spin', 'Sticker Pack', '20% Off', 'Mystery Box'];
const colors = ['#ffd6e8', '#e0f7fa', '#fff7c0', '#e8f6e9', '#fdefef', '#e8eaf6', '#fbe9e7', '#e6f0ff'];

let displaySize = 460;
let dpr = Math.max(window.devicePixelRatio || 1, 1);
let center = { x: 0, y: 0 };
let radius = 0;
let currentRotation = 0; // radians
let spinning = false;
let lastSliceSound = -1;

// Resize
function resizeAll() {
  dpr = Math.max(window.devicePixelRatio || 1, 1);
  const shown = Math.min(window.innerWidth * 0.9, 520);
  displaySize = Math.round(shown);

  // Wheel canvas
  wheelCanvas.style.width = displaySize + 'px';
  wheelCanvas.style.height = displaySize + 'px';
  wheelCanvas.width = displaySize * dpr;
  wheelCanvas.height = displaySize * dpr;
  wheelCanvas.setTransform(dpr, 0, 0, dpr, 0, 0);

  center.x = displaySize / 2;
  center.y = displaySize / 2;
  radius = displaySize / 2 - 18;

  // Confetti canvas fullscreen
  confettiCanvas.style.width = window.innerWidth + 'px';
  confettiCanvas.style.height = window.innerHeight + 'px';
  confettiCanvas.width = Math.round(window.innerWidth * dpr);
  confettiCanvas.height = Math.round(window.innerHeight * dpr);
  confettiCanvas.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Redraw
  drawWheel(currentRotation);
}

// Draw wheel (rotation in radians) and optional highlighted slice
function drawWheel(rotationRad = 0, highlighIndex = null, highlighAlpha = 0) {
  const ctx = wheelCtx;
  ctx.clearRect(0, 0, displaySize, displaySize);

  const slice = (2 * Math.PI) / prizes.length;

  // Draw wheel rotated
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(rotationRad);
  ctx.translate(-center.x, -center.y);

  for (let i = 0; i < prizes.length; i++) {
    const start = i * slice;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, start, start + slice);
    ctx.closePath();
    ctx.fill();

    // label
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = '#2b2b2b';
    ctx.font = `${Math.max(12, displaySize / 24)}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText(prizes[i], radius - 12, 6);
    ctx.restore();
  }

  // highlight overlay in wheel's rotated coordinate system
  if (highlighIndex !== null && highlighAlpha > 0) {
    const start = highlighIndex * slice;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,230,100,${Math.min(1, highlighAlpha)})`;
    ctx.fill();
  }

  ctx.restore();

  // fixed pointer on top
  drawPointer();
}

function drawPointer() {
  /** @type {HTMLCanvasElement} */
  const ctx = wheelCtx;
  ctx.save();
  const pointerHalf = Math.max(8, displaySize * 0.03);
  const y = center.y - radius - 4;
  ctx.beginPath();
  ctx.moveTo(center.x - pointerHalf, y);
  ctx.lineTo(center.x + pointerHalf, y);
  ctx.lineTo(center.x, y + Math.max(18, displaySize * 0.06));
  ctx.closePath();
  ctx.fillStyle = '#616161';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  ctx.restore();
}

// convert rotation - index (slice under top pointer)
function rotationToIndex(rotationRad) {
  const rotDeg = ((((rotationRad * 180) / Math.PI) % 360) + 360) % 360;
  const pointerDeg = (270 - rotDeg + 360) % 360; // top = 270 deg
  const sliceDeg = 360 / prizes.length;
  let idx = Math.floor(pointerDeg / sliceDeg);
  idx = ((idx % prizes.length) + prizes.length) % prizes.length;
  return idx;
}

// spin logic (choose target index, animate)
function spinWheel() {
  if (spinning) return;
  const playerName = usingPlayerName !== undefined ? usingPlayerName : (playerNameInput.value || '').trim();
  if (!playerName) {
    alert('Please enter your name to spin the wheel!');
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  manageBtn.disabled = true;
  // hide name while spinning
  playerNameInput.style.visibility = 'hidden';

  // pick a random index
  const chosenIndex = Math.floor(Math.random() * prizes.length);

  // compute target rotation so chosenIndex center end under top pointer
  const sliceDeg = 360 / prizes.length;
  const desiredPointerDeg = (chosenIndex + 0.5) * sliceDeg; // center of slice
  const desiredWheelDegNormalized = (270 - desiredPointerDeg + 360) % 360;

  const currentDeg = ((((currentRotation * 180) / Math.PI) % 360) + 360) % 360;
  let deltaDeg = (desiredWheelDegNormalized - currentDeg + 360) % 360;

  const extraSpins = 4 + Math.floor(Math.random() * 3);
  const totalDeg = extraSpins * 360 + deltaDeg;
  const targetRotation = currentRotation + (totalDeg * Math.PI) / 180;

  const duration = 4200 + Math.floor(Math.random() * 800);
  const startRot = currentRotation;
  let startTime = null;
  lastSliceSound = -1;

  function step(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - t, 3); // ease out cubic
    const nowRot = startRot + (targetRotation - startRot) * ease;

    drawWheel(nowRot);

    // Click sound when we move across slices
    const idx = rotationToIndex(nowRot);
    if (idx !== lastSliceSound) {
      lastSliceSound = idx;
      try {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
      } catch (e) {
        // ignore play errors, usually due to not being allowed to autoplay sound
      }
    }

    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }

    // Finished spinning
    currentRotation = targetRotation % (2 * Math.PI);
    drawWheel(currentRotation);

    const winningIndex = rotationToIndex(currentRotation);

    // Pulse the winning slice then show modal
    pulseHighlight(winningIndex, 3, 700, () => {
      showResultModal(playerName, prizes[winningIndex]);
      // keep controls locked until modal is closed
    });
  }
}
