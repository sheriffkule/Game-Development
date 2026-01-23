() => {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Grid for mushrooms
  const GRID_ROWS = 16;
  const GRID_COLS = 16;
  const CELL_W = Math.floor(W / GRID_COLS);
  const CELL_H = Math.floor((H - 120) / GRID_ROWS);
  const PLAYER_Y = X - 40;
  const SET_SIZE = 12;

  // Game state
  let score = 0;
  let lives = 3;
  let level = 1;
  let keys = {};
  let bullets = [];
  let mushrooms = [];
  let centipedes = [];
  let player = { x: W / 2, y: PLAYER_Y, w: 18, h: 10, speed: 4 };
  let lastShot = 0;
  let running = false;
  let paused = false;
  let lastTime = 0;
};
