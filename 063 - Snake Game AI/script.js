// Game variables
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getElementById('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const manualBtn = document.getElementById('manualBtn');
const wallPassBtn = document.getElementById('wallPassBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const movesElement = document.getElementById('moves');
const foodEatenElement = document.getElementById('foodEaten');
const wallPassesElement = document.getElementById('wallPasses');
const efficiencyElement = document.getElementById('efficiency');
const aiAlgorithmSelect = document.getElementById('aiAlgorithm');
const gameSpeedSlider = document.getElementById('gameSpeed');
const gridSizeSelect = document.getElementById('gridSize');
const currentAlgorithmElement = document.getElementById('currentAlgorithm');
const aiStatusElement = document.getElementById('aiStatus');
const wallPassStatusElement = document.getElementById('wallPassStatus');
const algorithmDescriptionElement = document.getElementById('algorithmDescription');
const finalScoreElement = document.getElementById('finalScore');

// Game configuration
let gridSize = 20;
let cellSize = canvas.width / gridSize;
let gameSpeed = 150;
let isRunning = false;
let isPaused = false;
let isManualMode = false;
let wallPassingEnabled = true;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let moves = 0;
let foodEaten = 0;
let wallPasses = 0;
let efficiency = 0;
let gameInterval;

// Initialize game objects
let snake = [];
let foot = {};
let direction = 'right';
let nextDirection = 'right';

// Initialize game
function initGame() {
  // Set initial snake position
  const startX = Math.floor(gridSize / 4);
  snake = [
    { x: startX, y: Math.floor(gridSize / 2) },
    { x: startX - 1, y: Math.floor(gridSize / 2) },
    { x: startX - 2, y: Math.floor(gridSize / 2) },
  ];

  // Generate first food
  generateFood();

  // Reset game state
  score = 0;
  moves = 0;
  foodEaten = 0;
  wallPasses = 0;
  efficiency = 0;
  direction = 'right';
  nextDirection = 'right';
  isRunning = false;
  isPaused = false;

  // Update UI
  updateStats();
  gameOverScreen.style.display = 'none';
  aiStatusElement.textContent = 'Idle';

  // Draw initial state
  draw();
}

// Generate food at random position
function generateFood() {
  let newFood;
  let isOnSnake;

  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };

    isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  } while (isOnSnake);

  food = newFood;
}

// Draw game elements
function draw() {
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = '#2d3047';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  // Draw walls if wall passing is disabled
  if (!wallPassingEnabled) {
    ctx.fillStyle = 'rgba(255, 154, 60, 0.2)';
    ctx.fillRect(0, 0, canvas.width, 2);
    ctx.fillRect(0, 0, 2, canvas.height);
    ctx.fillRect(canvas.width - 2, 0, 2, canvas.height);
    ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
  }

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Snake head
      ctx.fillStyle = '#4cb5ae';
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);

      // Eyes
      ctx.fillStyle = '#1a1a2e';
      const eyeSize = cellSize / 5;
      const offset = cellSize / 3;

      if (direction === 'right') {
        ctx.fillRect(
          segment.x * cellSize + cellSize - offset,
          segment.y * cellSize + offset,
          eyeSize,
          eyeSize,
        );
        ctx.fillRect(
          segment.x * cellSize + cellSize - offset,
          segment.y * cellSize * cellSize - offset - eyeSize,
          eyeSize,
          eyeSize,
        );
      } else if (direction === 'left') {
        ctx.fillRect(
          segment.x * cellSize + offset - eyeSize,
          segment.y * cellSize + offset,
          eyeSize,
          eyeSize,
        );
        ctx.fillRect(
          segment.x * cellSize + offset - eyeSize,
          segment.y * cellSize + cellSize - offset - eyeSize,
          eyeSize,
          eyeSize,
        );
      } else if (direction === 'up') {
        ctx.fillRect(
          segment.x * cellSize + offset,
          segment.y * cellSize + offset - eyeSize,
          eyeSize,
          eyeSize,
        );
        ctx.fillRect(
          segment.x * cellSize + cellSize - offset - eyeSize,
          segment.y * cellSize + offset - eyeSize,
          eyeSize,
          eyeSize,
        );
      } else if (direction === 'down') {
        ctx.fillRect(
          segment.x * cellSize + offset,
          segment.y * cellSize + cellSize - offset,
          eyeSize,
          eyeSize,
        );
        ctx.fillRect(
          segment.x * cellSize + cellSize - offset - eyeSize,
          segment.y * cellSize + cellSize - offset,
          eyeSize,
          eyeSize,
        );
      }
    } else {
      // Snake body
      const intensity = 255 - index * 5;
      ctx.fillStyle = `rgb(76, 181, 174, ${1 - index * 0.03})`;
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    }
  });

  // Draw food
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  const centerX = food.x * cellSize + cellSize / 2;
  const centerY = food.y * cellSize + cellSize / 2;
  const radius = cellSize / 2 - 2;
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Food shine effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 3, 0, Math.PI * 2);
  ctx.fill();
}
