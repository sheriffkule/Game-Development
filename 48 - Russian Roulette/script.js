let bulletPosition;
let chamberPosition;
let currentPlayer;
let totalPlayers;
let survivors = [];
let deadPlayers = [];
let gameOver = false;

const spinBtn = document.getElementById('spin');
const triggerBtn = document.getElementById('trigger');
const restartBtn = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const playerInput = document.getElementById('playerCount');
const startBtn = document.getElementById('startGame');
const winnerBanner = document.getElementById('winnerBanner');
const bulletEl = document.querySelector('.bullet');

function updateLeaderboard() {
  const survivorListEl = document.getElementById('survivorList');
  const deadListEl = document.getElementById('deadList');

  survivorListEl.textContent = '✓ Survivors: ' + (survivors.length > 0 ? survivors.join(', ') : 'None');

  deadListEl.innerHTML =
    '☠ Dead: ' +
    (deadPlayers.length > 0
      ? deadPlayers
          .map((p) => {
            return `<span class="dead-name">${p}<span class="dead-blood"></span></span>`;
          })
          .join(', ')
      : 'None');

  if (survivors.length === 1) {
    winnerBanner.textContent = `🏆 Player ${survivors[0]} Wins!`;
    winnerBanner.style.display = 'block';
    restartBtn.style.display = 'block';
    disableButtons(true);
  } else {
    winnerBanner.style.display = 'none';
  }
}

function triggerPassOut() {
  overlay.style.opacity = 1;
  setTimeout(() => {
    overlay.style.opacity = 0;
  }, 1000);
}

function resetGame() {
  totalPlayers = Math.min(Math.max(parseInt(playerInput.value) || 2, 2), 6);
  currentPlayer = 1;
  bulletPosition = Math.floor(Math.random() * 6) + 1;
  chamberPosition = Math.floor(Math.random() * 6) + 1;
  survivors = Array.from({ length: totalPlayers }, (_, i) => i + 1);
  deadPlayers = [];
  gameOver = false;

  playerInput.disabled = true;
  startBtn.disabled = true;
  document.getElementById('message').textContent = `Player 1, it's your turn! Spin or pull.`;
  restartBtn.style.display = 'none';
  winnerBanner.style.display = 'none';
  bulletEl.style.transform = 'rotate(0deg) translate(38px) rotate(0deg)';

  disableButtons(false);
  updateLeaderboard();
}

function resetToSetup() {
  playerInput.disabled = false;
  startBtn.disabled = false;
  spinBtn.disabled = true;
  triggerBtn.disabled = true;
  restartBtn.style.display = 'none';
  winnerBanner.style.display = 'none';
  document.getElementById('message').textContent = 'Set players and start the game...';
  survivors = [];
  deadPlayers = [];
  bulletEl.style.transform = 'rotate(0deg)';
  document.getElementById('survivorList').textContent = '✓ Survivors: ';
  document.getElementById('deadList').textContent = '☠ Dead: ';
  gameOver = false;
}

function disableButtons(state) {
  spinBtn.disabled = state;
  triggerBtn.disabled = state;
}

function nextPlayer() {
  if (gameOver) return;
  do {
    currentPlayer++;
    if (currentPlayer > totalPlayers) currentPlayer = 1;
  } while (!survivors.includes(currentPlayer));
  setTimeout(() => {
    if (!gameOver)
      document.getElementById('message').textContent =
        `Player ${currentPlayer}, it is your turn! Spin or pull!`;
  }, 1200);
}

function spinChamber() {
  if (gameOver) return;
  disableButtons(true);
  document.getElementById('message').textContent = `Player ${currentPlayer} spins the chamber...`;

  const totalRotations = Math.floor(Math.random() * 20 + 30);
  let step = 0;
  const radius = 38;

  function spinStep() {
    if (step >= totalRotations) {
      bulletPosition = Math.floor(Math.random() * 6) + 1;
      bulletEl.style.transform = `rotate(0deg) translate(${radius}px) rotate(0deg)`;
      document.getElementById('message').textContent = `Player ${currentPlayer} feels lucky...`;
      disableButtons(false);
      return;
    }
    const angle = (step * 360) / 6;
    bulletEl.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
    step++;
    requestAnimationFrame(spinStep);
  }
  requestAnimationFrame(spinStep);
}

function pullTrigger() {
  if (gameOver) return;
  if (!survivors.includes(currentPlayer)) {
    alert('Dead players cannot play.');
    return;
  }

  bulletEl.classList.remove('shake-chamber', 'shake-bullet');
  void bulletEl.offsetWidth;
  bulletEl.classList.add('shake-chamber', 'shake-bullet');

  disableButtons(true);
  document.getElementById('message').textContent = `Player ${currentPlayer} pulls the trigger...`;
  setTimeout(() => {
    if (chamberPosition === bulletPosition) {
      document.getElementById('message').textContent = `Player ${currentPlayer} is dead!`;
      deadPlayers.push(currentPlayer);
      survivors = survivors.filter((p) => p !== currentPlayer);
      triggerPassOut();
      updateLeaderboard();
      if (survivors.length <= 1) {
        gameOver = true;
        restartBtn.style.display = 'block';
        disableButtons(true);
        return;
      }
    } else {
      document.getElementById('message').textContent = `Click! Player ${currentPlayer} survives.`;
      updateLeaderboard();
    }
    chamberPosition = (chamberPosition % 6) + 1;
    nextPlayer();
    disableButtons(false);
  }, 1500);
}

spinBtn.addEventListener('click', spinChamber);
triggerBtn.addEventListener('click', pullTrigger);
restartBtn.addEventListener('click', resetToSetup);
startBtn.addEventListener('click', resetGame);

disableButtons(true);
