// DOM Elements
const colorGrid = document.getElementById('colorGrid');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const modalRestartBtn = document.getElementById('modalRestartBtn');
const welcomeStartBtn = document.getElementById('welcomeStartBtn');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const heartsDisplay = document.querySelector('.lives .heart');
const gameOverModal = document.getElementById('gameOverModal');
const welcomeModal = document.getElementById('welcomeModal');
const finalScoreDisplay = document.getElementById('finalScore');
const scoreList = document.getElementById('scoreList');
const difficultyProgress = document.querySelector('.difficulty-progress');
const colorblindToggle = document.getElementById('colorblindToggle');

// Game variables
let score = 0;
let lives = 3;
let timeLeft = 60;
let timer;
let differentColorIndex;
let difficulty = 1;
const maxDifficulty = 10;
let colorblindMode = false;
let highScores = JSON.parse(localStorage.getItem('colorSpotterHighScores')) || [];

// Initialize the game
function init() {
  updateHighScoresDisplay();
  welcomeModal.classList.add('active');
}

// Start the game
function startGame() {
  score = 0;
  lives = 3;
  timeLeft = 60;
  difficulty = 1;
  updateDisplays();
  generateColors();
  startTimer();
  startBtn.disabled = true;
  restartBtn.disabled = false;
  welcomeModal.classList.remove('active');
}

// Generate colors for the grid
function generateColors() {
  colorGrid.innerHTML = '';

  // Always start with 2x2 (4 boxes) for first round
  // Then increase grid size every 2 difficulty levels (3x3 at difficulty 3, 4x4 at 5, etc.)
  const gridSize = difficulty <= 2 ? 2 : difficulty <= 4 ? 3 : difficulty <= 6 ? 4 : difficulty <= 8 ? 5 : 6;

  const totalBoxes = gridSize * gridSize;

  // Update grid template
  colorGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  // Adjust box size based on grid size (smaller boxes for larger grids)
  const boxSize = Math.max(40, 150 - gridSize * 15); // Larger starting size for 2x2
  document.querySelectorAll('.color-box').forEach((box) => {
    box.style.minHeight = `${boxSize}px`;
  });

  const colorVariation = getColorVariation();

  // Generate base color
  const baseColor = generateRandomColor();

  // Generate slightly different color
  const differentColor = generateSimilarColor(baseColor, colorVariation);

  // Randomly select which box will have the different color
  differentColorIndex = Math.floor(Math.random() * totalBoxes);

  // Create color boxes
  for (let i = 0; i < totalBoxes; i++) {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor =
      i === differentColorIndex
        ? colorblindMode
          ? applyColorblindFilter(differentColor)
          : differentColor
        : colorblindMode
          ? applyColorblindFilter(baseColor)
          : baseColor;

    // Set dynamic size
    colorBox.style.minHeight = `${boxSize}px`;

    colorBox.addEventListener(click, () => handleColorClick(i));
    colorGrid.appendChild(colorBox);
  }

  // Update difficulty indicator
  difficultyProgress.style.width = `${(difficulty / maxDifficulty) * 100}`;
}

// Handle color box click
function handleColorClick(index) {
  if (index === differentColorIndex) {
    // Correct answer
    score += Math.floor(10 * difficulty);
    difficulty = Math.min(difficulty + 0.5, maxDifficulty);

    // Visual feedback
    const boxes = document.querySelectorAll('.color-box');
    boxes[index].classList.add('correct');

    // Generate new colors after a short delay
    setTimeout(() => {
      generateColors();
      document.querySelector('.game-container').classList.add('pulse');
      setTimeout(() => {
        document.querySelector('.game-container').classList.remove('pulse');
      }, 300);
    }, 500);
  } else {
    // Wrong answer
    lives--;

    // Visual feedback
    const boxes = document.querySelectorAll('.color-box');
    boxes[index].classList.add('shake');
    setTimeout(() => {
      boxes[index].classList.remove('shake');
    }, 500);

    if (lives <= 0) endGame();
  }

  updateDisplays();
}

// Update all displays
function updateDisplays() {
  timeDisplay.textContent = timeLeft;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;

  // Update hearts display
  heartsDisplay.textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives);
}

// Start the timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) endGame();
  }, 1000);
}

// End the game
function endGame() {
  clearInterval(timer);
  startBtn.disabled = false;

  // Show game over modal
  finalScoreDisplay.textContent = score;
  gameOverModal.classList.add('active');

  // Add score to high scores
  addHighScore(score);
}

// Restart the game
function restartGame() {
  gameOverModal.classList.remove('active');
  startGame();
}

// Generate a random RGB color
function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// Generate a similar color with slight variation
function generateSimilarColor(baseColor, variation) {
  const match = baseColor.match(/\d+/g);
  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  // Randomly decide which color channel to modify
  const channel = Math.floor(Math.random() * 3);
  let newR = r,
    newG = g,
    newB = b;

  if (channel === 0) newR = Math.max(0, Math.min(255, r + variation));
  else if (channel === 1) newG = Math.max(0, Math.min(255, g + variation));
  else newB = Math.max(0, Math.min(255, b + variation));

  return `rgb(${newR}, ${newG}, ${newB})`;
}
