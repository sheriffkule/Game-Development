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
