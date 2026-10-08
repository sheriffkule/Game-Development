// Game constants
const mazeSize = 400;
const ballRadius = 10;
const friction = 0.98;
const maxSpeed = 200;
const joystickMaxAccel = 500;
const joystickRadius = 75;
const maxTiltDeg = 15;
const maxPushZ = 50;
const endGoal = { left: mazeSize - 50, top: mazeSize - 50 };
const fixedStartPos = { x: 25, y: 25 };
const levelLoadDelay = 100;
const holeRadius = 15;

// DOM Elements
const ball = document.getElementById('ball');
const maze = document.getElementById('maze');
const messageDisplay = document.getElementById('message');
const joystickContainer = document.getElementById('joystick-container');
const joystickHandle = document.getElementById('joystick-handle');
const gameContainer = document.getElementById('game-container');

// Level data definition (Difficulty + Holes)
const levels = [
  // Level 1 (index 0): Tight U-Bend (no holes)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [100, 0, 105, 305],
      [105, 300, 305, 305],
      [300, 100, 305, 305],
    ],
    holes: [],
  },

  // Level 2 (index 1): Tighter zig-zag (no hole)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [100, 100, 400, 105],
      [0, 200, 300, 205],
      [100, 300, 400, 305],
    ],
    holes: [],
  },

  // Level 3 (index 2): Narrowed double choke point (one hole added)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [0, 150, 150, 255],
      [195, 150, 400, 155],
      [250, 0, 255, 250],
      [250, 290, 255, 400],
    ],
    holes: [{ x: 175, y: 325, r: holeRadius }],
  },

  // Level 4 (index 3): Tight S-Bend (no hole)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [100, 0, 110, 300],
      [100, 300, 400, 310],
      [250, 100, 260, 290],
    ],
    holes: [],
  },

  // Level 5 (index 4): Tighter spiral path (no hole)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [50, 50, 350, 60],
      [340, 60, 350, 350],
      [50, 340, 340, 350],
      [50, 100, 60, 340],

      [100, 100, 300, 110],
      [290, 110, 300, 300],
      [100, 290, 290, 300],
      [100, 150, 110, 290],

      [150, 150, 250, 160],
      [240, 160, 250, 250],
    ],
    holes: [],
  },

  // Level 6 (index 5): The choke diamond (two holes added)
  {
    startPos: fixedStartPos,
    walls: [
      [0, 0, mazeSize, 0],
      [0, mazeSize, mazeSize, mazeSize],
      [0, 0, 0, mazeSize],
      [mazeSize, 0, mazeSize, mazeSize],
      [50, 50, 350, 60],
      [50, 340, 350, 350],
      [50, 50, 60, 350],
      [100, 100, 300, 110],
      [290, 100, 300, 300],
      [150, 150, 250, 250],
      [200, 250, 400, 260],
      [350, 300, 400, 310],
    ],
    holes: [
      { x: 125, y: 175, r: holeRadius },
      { x: 325, y: 125, r: holeRadius },
    ],
  },
];

// Game object state
const gameState = {
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  acceleration: { x: 0, y: 0 },
  lastTime: 0,
  currentLevel: 0,
  gameRunning: false,
  isDragging: false,
  currentWalls: [],
  currentHoles: [],
  containerCenter: { x: 0, y: 0 },
};

// Hole collision
function checkHoleCollision(ballPos, hole) {
  // Calculate the distance between the center of the ball and the center of the hole
  const dx = ballPos.x - hole.x;
  const dy = ballPos.y - hole.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If the distance is less than the ball radius plus the hole radius, it's a collision
  // Making the ball radius slightly smaller for a tighter fit (1/4 of ball radius tolerance)
  return distance < (ballRadius + hole.r) * 0.75;
}

// Core functions
function resetJoystick() {
  joystickHandle.style.left = '50%';
  joystickHandle.style.top = '50%';
  gameState.acceleration.x = 0;
  gameState.acceleration.y = 0;
}

function updateCenter() {
  const rect = joystickContainer.getBoundingClientRect();
  gameState.containerCenter.x = rect.left + joystickRadius;
  gameState.containerCenter.y = rect.top + joystickRadius;
}

function checkWallCollision(newPos, wall) {
  const [wLeft, wTop, wRight, wBottom] = wall;
  const bLeft = newPos.x - ballRadius;
  const bRight = newPos.x + ballRadius;
  const bTop = newPos.y - ballRadius;
  const bBottom = newPos.y + ballRadius;

  return bRight > wLeft && bLeft < wRight && bBottom > wTop && bTop < wBottom;
}

function renderBall() {
  ball.style.transform = `translate(${gameState.position.x - ballRadius}px, ${gameState.position.y - ballRadius}px)`;
}

function createRestartButton() {
  if (document.getElementById('restart-btn')) return;

  const restartBtn = document.createElement('button');
  restartBtn.id = 'restart-btn';
  restartBtn.textContent = 'Restart Game';

  restartBtn.style.cssText = ` 
    padding: 10px 20px; 
    font-size: 1.1em;
    margin-top: 20px;
    cursor: pointer:
    background-color: #2ecc71;
    color: white;
    border: none;
    border-radius: 5px;
    box-shadow: 0 4px 8px #27ae60;
    transition: all 0.15s;
  `;
  restartBtn.onmouseover = () => (restartBtn.style.backgroundColor = '#27ae60');
  restartBtn.onmouseout = () => (restartBtn.style.backgroundColor = '#2ecc71');
  restartBtn.onmousedown = () => (restartBtn.style.boxShadow = '0 2px 4px #27ae60');
  restartBtn.onmouseup = () => (restartBtn.style.boxShadow = '0 4px 8px #27ae60');

  restartBtn.addEventListener('click', () => {
    restartBtn.remove();
    loadLevel(0);
  });

  gameContainer.appendChild(restartBtn);
}

function removeRestartButton() {
  const btn = document.getElementById('restart-btn');
  if (btn) btn.remove();
}

function loadLevel(levelIndex) {
  if (levelIndex >= levels.length) {
    messageDisplay.textContent = 'Congratulations! You have completed all levels!';
    gameState.gameRunning = false;
    createRestartButton();
    return;
  }

  gameState.gameRunning = false;
  removeRestartButton();

  const level = levels[levelIndex];
  gameState.currentWalls = level.walls;
  gameState.currentHoles = level.holes;
  gameState.currentLevel = levelIndex;

  // Reset physics and position
  gameState.velocity = { x: 0, y: 0 };
  gameState.acceleration = { x: 0, y: 0 };
  gameState.position = { x: level.startPos.x, y: level.startPos.y };

  // Visual reset
  maze.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg)';
  renderBall();
  resetJoystick();

  gameState.isDragging = false;

  messageDisplay.textContent = `Loading Level ${gameState.currentLevel + 1}...`;

  // Dynamic wall rendering
  const existingElements = maze.querySelectorAll('.wall, .hole');
  existingElements.forEach((el) => el.remove());

  level.walls.forEach((wallData) => {
    const [left, top, right, bottom] = wallData;
    const wallEl = document.createElement('div');
    wallEl.className = 'wall';
    wallEl.style.left = `${left}px`;
    wallEl.style.top = `${top}px`;
    wallEl.style.width = `${right - left}px`;
    wallEl.style.height = `${bottom - top}px`;
    maze.appendChild(wallEl);
  });

  // Dynamic hole rendering
  level.holes.forEach((holeData) => {
    const holeEl = document.createElement('div');
    holeEl.className = 'hole';
    holeEl.style.width = `${holeData.r * 2}px`;
    holeEl.style.height = `${holeData.r * 2}px`;

    // Position hole by its center point
    holeEl.style.left = `${holeData.x - holeData.r}px`;
    holeEl.style.top = `${holeData.y - holeData.r}px`;
    maze.appendChild(holeEl);
  });
}
