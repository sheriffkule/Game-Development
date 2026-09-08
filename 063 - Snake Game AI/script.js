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

// Update game stats
function update() {
  if (isPaused || !isRunning) return;

  // Update direction
  direction = nextDirection;

  // Calculate new head position
  const head = { ...snake[0] };
  switch (direction) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }

  // Handle wall passing
  if (wallPassingEnabled) {
    if (head.x < 0) head.x = gridSize - 1;
    else if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    else if (head.y >= gridSize) head.y = 0;

    // Track wall passes
    if (head.x !== snake[0].x && (head.x === 0 || head.x === gridSize - 1)) wallPasses++;
    if (head.y !== snake[0].y && (head.y === 0 || head.y === gridSize - 1)) wallPasses++;
  } else {
    // Check for collisions with walls
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      gameOver();
      return;
    }
  }

  // Check for collisions with self
  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  // Add new head
  snake.unshift(head);

  // Check for food collision
  if (head.x === food.x && head.y === food.y) {
    // Increase score
    score += 10;
    foodEaten++;

    // Generate new food
    generateFood();
  } else {
    // Remove tail if no food was eaten
    snake.pop();
  }

  // Update moves counter
  moves++;

  // Calculate efficiency (food eaten per move)
  efficiency = moves > 0 ? Math.round((foodEaten / moves) * 100) : 0;

  // Update UI
  updateStats();

  // Redraw game
  draw();
}

// Game over handler
function gameOver() {
  isRunning = false;
  clearInterval(gameInterval);

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreElement.textContent = highScore;
  }

  // Show game over screen
  finalScoreElement.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'block';
  aiStatusElement.textContent = 'Game Over';
}

// Update statistics display
function updateStats() {
  scoreElement.textContent = score;
  highScoreElement.textContent = highScore;
  movesElement.textContent = moves;
  foodEatenElement.textContent = foodEaten;
  wallPassStatusElement.textContent = wallPasses;
  efficiencyElement.textContent = `${efficiency}`;
}

// AI movement logic (enhanced for wall passing)
function aiMove() {
  if (!isRunning || isPaused || isManualMode) return;

  // Simple AI logic = move toward food with basic pathfinder
  const head = snake[0];

  // Calculate direction to food with wall passing consideration
  let dx = food.x - head.x;
  let dy = food.y - head.y;

  // If wall passing is enabled, consider the shortest path including through walls
  if (wallPassingEnabled) {
    // Check if going through a wall would be shorter
    const altDx = dx > 0 ? dx - gridSize : dx + gridSize;
    const altDy = dy > 0 ? dy - gridSize : dy + gridSize;

    // Use the shortest path (through wall or normal
    if (Math.abs(altDx) < Math.abs(dx)) dx = altDx;
    if (Math.abs(altDy) < Math.abs(dy)) dy = altDy;
  }

  // Prefer horizontal or vertical movement based on distance
  if (Math.abs(dx) > Math.abs(dy)) {
    // Move horizontally
    if (dx > 0 && direction !== 'left') {
      nextDirection = 'right';
    } else if (dx < 0 && direction !== 'right') {
      nextDirection = 'left';
    } else {
      // If moving horizontally isn't possible, try vertical
      if (dy > 0 && direction !== 'up') {
        nextDirection = 'down';
      } else if (dy < 0 && direction !== 'down') {
        nextDirection = 'up';
      }
    }
  } else {
    // Move vertically
    if (dy > 0 && direction !== 'up') {
      nextDirection = 'down';
    } else if (dy < 0 && direction !== 'down') {
      nextDirection = 'up';
    } else {
      // If moving vertically isn't possible, try horizontal
      if (dx > 0 && direction !== 'left') {
        nextDirection = 'right';
      } else if (dx < 0 && direction !== 'right') {
        nextDirection = 'left';
      }
    }
  }

  // Avoid immediate self-collision
  const nextHead = { ...head };
  switch (nextDirection) {
    case 'up':
      nextHead.y--;
      break;
    case 'down':
      nextHead.y++;
      break;
    case 'left':
      nextHead.x--;
      break;
    case 'right':
      nextHead.x++;
      break;
  }

  // Handle wall passing in collision check
  if (wallPassingEnabled) {
    if (nextHead.x < 0) nextHead.x = gridSize - 1;
    else if (nextHead.x >= gridSize) nextHead.x = 0;
    if (nextHead.y < 0) nextHead.y = gridSize - 1;
    else if (nextHead.y >= gridSize) nextHead.y = 0;
  }
}
