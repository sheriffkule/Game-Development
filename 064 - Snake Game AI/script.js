// Game variables
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
let food = {};
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
  const availableCells = gridSize * gridSize - snake.length;
  if (availableCells <= 0) {
    gameOver();
    return;
  }

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
          segment.y * cellSize + cellSize - offset - eyeSize,
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
    const crossedWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;

    if (head.x < 0) head.x = gridSize - 1;
    else if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    else if (head.y >= gridSize) head.y = 0;

    // Track wall passes
    if (crossedWall) wallPasses++;
  } else {
    // Check for collisions with walls
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      gameOver();
      return;
    }
  }

  // Check for collisions with self
  const bodyToCheck = head.x === food.x && head.y === food.y ? snake : snake.slice(0, -1);
  if (bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y)) {
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
  gameInterval = undefined;

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
  wallPassesElement.textContent = wallPasses;
  efficiencyElement.textContent = `${efficiency}%`;
}

function findPathDirection(algorithm) {
  const start = snake[0];
  const target = food;
  const occupied = new Set(snake.slice(0, -1).map((segment) => `${segment.x},${segment.y}`));
  const startKey = `${start.x},${start.y}`;
  const targetKey = `${target.x},${target.y}`;
  const directions = [
    { name: 'up', x: 0, y: -1 },
    { name: 'down', x: 0, y: 1 },
    { name: 'left', x: -1, y: 0 },
    { name: 'right', x: 1, y: 0 },
  ];
  const cameFrom = new Map([[startKey, null]]);
  const distance = new Map([[startKey, 0]]);
  const open = [{ x: start.x, y: start.y, priority: 0 }];

  const heuristic = (x, y) => {
    const dx = Math.abs(target.x - x);
    const dy = Math.abs(target.y - y);
    return wallPassingEnabled ? Math.min(dx, gridSize - dx) + Math.min(dy, gridSize - dy) : dx + dy;
  };

  while (open.length > 0) {
    open.sort((first, second) => first.priority - second.priority);
    const current = open.shift();
    const currentKey = `${current.x},${current.y}`;

    if (currentKey === targetKey) {
      let stepKey = targetKey;
      let step = cameFrom.get(stepKey);
      while (step && step.previous !== startKey) {
        stepKey = step.previous;
        step = cameFrom.get(stepKey);
      }
      return step ? step.direction : null;
    }

    for (const directionOption of directions) {
      let nextX = current.x + directionOption.x;
      let nextY = current.y + directionOption.y;

      if (wallPassingEnabled) {
        nextX = (nextX + gridSize) % gridSize;
        nextY = (nextY + gridSize) % gridSize;
      } else if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
        continue;
      }

      const nextKey = `${nextX},${nextY}`;
      if (occupied.has(nextKey) || distance.has(nextKey)) continue;

      const nextDistance = distance.get(currentKey) + 1;
      distance.set(nextKey, nextDistance);
      cameFrom.set(nextKey, { previous: currentKey, direction: directionOption.name });
      open.push({
        x: nextX,
        y: nextY,
        priority: algorithm === 'aStar' ? nextDistance + heuristic(nextX, nextY) : nextDistance,
      });
    }
  }

  return null;
}

// AI movement logic (enhanced for wall passing)
function aiMove() {
  if (!isRunning || isPaused || isManualMode) return;

  // Simple AI logic = move toward food with basic pathfinder
  const head = snake[0];

  if (aiAlgorithmSelect.value !== 'hamiltonian') {
    const pathDirection = findPathDirection(aiAlgorithmSelect.value);
    if (pathDirection) {
      nextDirection = pathDirection;
      return;
    }
  }

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

  // Check if next move would cause collision
  if (snake.slice(0, -1).some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)) {
    // Try to find a safe direction
    const directions = ['up', 'down', 'left', 'right'];
    const safeDirections = directions.filter((dir) => {
      if (
        (dir === 'up' && direction === 'down') ||
        (dir === 'down' && direction === 'up') ||
        (dir === 'left' && direction === 'right') ||
        (dir === 'right' && direction === 'left')
      ) {
        return false; // Can't reverse direction
      }

      const testHead = { ...head };
      switch (dir) {
        case 'up':
          testHead.y--;
          break;
        case 'down':
          testHead.y++;
          break;
        case 'left':
          testHead.x--;
          break;
        case 'right':
          testHead.x++;
          break;
      }

      // Handle wall passing in test
      if (wallPassingEnabled) {
        if (testHead.x < 0) testHead.x = gridSize - 1;
        else if (testHead.x >= gridSize) testHead.x = 0;
        if (testHead.y < 0) testHead.y = gridSize - 1;
        else if (testHead.y >= gridSize) testHead.y = 0;
      } else {
        // Check for wall collision
        if (testHead.x < 0 || testHead.x >= gridSize || testHead.y < 0 || testHead.y >= gridSize) {
          return false;
        }
      }

      // Check for self collision
      return !snake.slice(0, -1).some((segment) => segment.x === testHead.x && segment.y === testHead.y);
    });

    // If there are safe directions, pick one randomly
    if (safeDirections.length > 0) {
      nextDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
    }
    // Otherwise, continue in current direction (game over is imminent)
  }
}

// Manual control for testing
document.addEventListener('keydown', (e) => {
  if (!isManualMode || !isRunning || isPaused) return;

  switch (e.key) {
    case 'ArrowUp':
      if (direction !== 'down') nextDirection = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') nextDirection = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') nextDirection = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') nextDirection = 'right';
      break;
  }
});

// Event listeners for buttons
startBtn.addEventListener('click', () => {
  if (!isRunning) {
    if (gameOverScreen.style.display === 'block') {
      initGame();
    }

    isRunning = true;
    isPaused = false;
    aiStatusElement.textContent = 'Playing';

    gameInterval = setInterval(() => {
      aiMove();
      update();
    }, gameSpeed);
  }
});

pauseBtn.addEventListener('click', () => {
  if (isRunning) {
    isPaused = !isPaused;
    aiStatusElement.textContent = isPaused ? 'Paused' : 'Playing';
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
  }
});

resetBtn.addEventListener('click', () => {
  clearInterval(gameInterval);
  gameInterval = undefined;
  initGame();
  pauseBtn.textContent = 'Pause';
});

manualBtn.addEventListener('click', () => {
  isManualMode = !isManualMode;
  manualBtn.textContent = isManualMode ? 'AI Mode' : 'Manual Mode';
  aiStatusElement.textContent = isManualMode ? 'Manual Control' : 'Idle';
});

wallPassBtn.addEventListener('click', () => {
  wallPassingEnabled = !wallPassingEnabled;
  wallPassBtn.textContent = `Wall Passing: ${wallPassingEnabled ? 'ON' : 'OFF'}`;
  wallPassBtn.classList.toggle('toggle-on', wallPassingEnabled);
  wallPassStatusElement.textContent = wallPassingEnabled ? 'Enabled' : 'Disabled';

  // Redraw to update wall visualization
  draw();
});

restartBtn.addEventListener('click', () => {
  clearInterval(gameInterval);
  gameInterval = undefined;
  initGame();
  pauseBtn.textContent = 'Pause';
});

// Update game speed when slider changes
gameSpeedSlider.addEventListener('input', () => {
  const speedValue = parseInt(gameSpeedSlider.value);
  gameSpeed = 200 - speedValue * 15; // Convert to milliseconds (faster with higher value)

  if (isRunning) {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      aiMove();
      update();
    }, gameSpeed);
  }
});

// Update grid size when selector changes
gridSizeSelect.addEventListener('change', () => {
  const wasRunning = isRunning;
  clearInterval(gameInterval);
  gameInterval = undefined;
  gridSize = Number(gridSizeSelect.value);
  cellSize = canvas.width / gridSize;
  initGame();

  if (wasRunning) {
    startBtn.click();
  }
});

aiAlgorithmSelect.addEventListener('change', () => {
  const algorithm = aiAlgorithmSelect.value;
  currentAlgorithmElement.textContent =
    algorithm === 'hamiltonian'
      ? 'Hamiltonian Path'
      : algorithm === 'bfs'
        ? 'Breadth-First Search'
        : 'A* Search';

  if (algorithm === 'hamiltonian') {
    algorithmDescriptionElement.textContent =
      'The Hamiltonian Path algorithm ensures the snake visits every cell exactly once, guaranteeing no collisions.';
  } else if (algorithm === 'bfs') {
    algorithmDescriptionElement.textContent =
      'Breadth-First Search finds the shortest path to the food, but may not always be optimal for longer snakes.';
  } else {
    algorithmDescriptionElement.textContent =
      'A* Search uses heuristics to find an optimal path to the food, balancing efficiency and performance.';
  }
});

// Initialize the game
initGame();
highScoreElement.textContent = highScore;
