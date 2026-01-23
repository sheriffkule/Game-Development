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
  const PLAYER_Y = H - 40;
  const SEG_SIZE = 12;

  // Game state
  let score = 0;
  let lives = 3;
  let level = 1;
  let keys = {};
  let bullets = [];
  let mushrooms = []; // will hold objects {hp, poison}
  let centipedes = [];
  let player = { x: W / 2, y: PLAYER_Y, w: 18, h: 10, speed: 4 };
  let lastShot = 0;
  let running = false;
  let paused = false;
  let lastTime = 0;

  // Enemies: spider, flea, scorpion
  let spider = { active: false, x: 0, y: 0, vx: 0, vy: 0, spawnCoolDown: 4000 };
  let flea = { active: false, x: 0, y: 0, vy: 2, spawnCoolDown: 8000 };
  let scorpion = { active: false, x: 0, y: 0, vx: 2, spawnCoolDown: 10000 };
  let nextSpiderSpawn = Math.random() * 8000 + 5000;
  let nextFleaSpawn = Math.random() * 10000 + 8000;
  let nextScorpionSpawn = Math.random() * 15000 + 12000;

  let nextExtraLife = 12000; // Extra life threshold

  // Utility
  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function makeEmptyMushrooms() {
    mushrooms.Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => ({ hp: 0, poison: false })),
    );
  }

  function spawnMushrooms(density = 0.06) {
    makeEmptyMushrooms();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (Math.random() < density) mushrooms[r][c].hp = randInt(1, 3);
      }
    }
  }

  function spawnCentipede(length = 12) {
    const segs = [];
    for (let i = 0; i < length; i++) {
      segs.push({ x: i * (SEG_SIZE + 4), y: 8, dx: 1 });
    }
    centipedes = [{ segments: segs, dir: 1, speed: 1.2 + level * 0.08 }];
  }

  function awardScore(amount) {
    const prev = score;
    score += amount;
    // Extra life every 12,000
    if ((prev < nextExtraLife) & (score >= nextExtraLife)) {
      lives++;
      nextExtraLife += 12000;
    }
  }

  // Reset / next level
  function reset() {
    score = 0;
    lives = 3;
    level = 1;
    bullets = [];
    nextExtraLife = 12000;
    spawnMushrooms(0.06 + level * 0.005);
    spawnCentipede(12 + level * 2);
    player.x = W / 2;
    running = true;
    paused = false;
    lastTime = performance.now();
    spider.active = flea.active = scorpion.active = false;
    nextSpiderSpawn = Math.random() * 8000 + 5000;
    nextFleaSpawn = Math.random() * 10000 + 8000;
    nextScorpionSpawn = Math.random() * 15000 + 12000;
  }

  function nextLevel() {
    level++;
    bullets = [];
    spawnMushrooms(0.04 + level * 0.02);
    spawnCentipede(12 + level * 2);
    player.x = W / 2;
  }

  // Input: prevent arrow keys from moving focus / highlighting
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (e.code === 'KeyP') {
      paused = !paused;
      document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Paused';
      if (!paused) requestAnimationFrame(update);
      return;
    }
    if ((e.code = 'KeyR')) {
      reset();
      requestAnimationFrame(update);
      return;
    }
    keys[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  document.getElementById('startBtn').addEventListener('click', () => {
    reset();
    requestAnimationFrame(update);
  });
  document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
    if (!paused) requestAnimationFrame(update);
  });

  // Shooting
  function shoot() {
    const now = performance.now();
    if (now - lastShot < 180) return; // fire rate
    bullets.push({ x: player.x, y: player.y - 8, w: 4, h: 8, dy: -7 });
    lastShot = now;
  }

  function rectIntersect(a, b) {
    return (
      a.x < b.x + (b.w || 0) && a.x + (a.w || 0) > b.x && a.y < b.y + (b.h || 0) && a.y + (a.h || 0) > b.y
    );
  }

  // Spider behaviors
  function spawnSpider() {
    spider.active = true;
    spider.y = H - 120 + Math.random() * 60;
    spider.x = Math.random() < 0.5 ? 0 : W; // start left or right
    spider.vx = spider.x === 0 ? 1.8 + Math.random() * 1.2 : -1.8 - Math.random() * 1.2;
    spider.vy = Math.random() * 1.2 - 0.6;
  }

  function updateSpider(dt) {
    if (!spider.active) return;
    spider.x += spider.vx * dt * 0.06;
    spider.y += spider.vy * dt * 0.06;
    // bounce vertical in bottom area
    if (spider.y < H - 200) spider.vy = Math.abs(spider.vy);
    if (spider.y > H - 40) spider.vy = -Math.abs(spider.vy);
    // eat mushrooms
    const gc = Math.floor(spider.x / CELL_W);
    const gr = Math.floor(spider.y / CELL_H);
    if (gr >= 0 && gr < GRID_ROWS && gc >= 0 && gc < GRID_COLS && mushrooms[gr][gc].hp > 0) {
      mushrooms[gr][gc].hp = 0;
      mushrooms[gr][gc].poison = false;
    }
    // bounce off walls
    if (spider.x < -20 || spider.x > W + 20) spider.active = false;
  }

  // Flea behaviors
  function spawnFlea() {
    flea.active = true;
    flea.x = randInt(0, W);
    flea.y = 0;
    flea.vy = Math.random() * 1.5 + 2;
  }

  function updateFlea(dt) {
    if (!flea.active) return;
    flea.y += flea.vy * dt * 0.06;
    // Drop mushrooms as it passes grid rows
    const gr = Math.floor(flea.y / CELL_H);
    const gc = Math.floor(flea.x / CELL_W);
    if (gr >= 0 && gr < GRID_ROWS && gc >= 0 && gc < GRID_COLS) {
      mushrooms[gr][gc].hp = Math.max(mushrooms[gr][gc].hp, 1);
    }
    if (flea.y > H) flea.active = false;
  }

  // Scorpion behaviors
  function spawnScorpion() {
    scorpion.active = true;
    scorpion.y = CELL_H * randInt(1, 4);
    scorpion.x = Math.random() < 0.5 ? 0 : W;
    scorpion.vx = scorpion.x === 0 ? Math.random() * 1.2 + 2.2 : -2.2 - Math.random() * 1.2;
  }

  function updateScorpion(dt) {
    if (!scorpion.active) return;
    scorpion.x += scorpion.vx * dt * 0.06;
    // poison mushrooms it touches
    const gc = Math.floor(scorpion.x / CELL_W);
    const gr = Math.floor(scorpion.y / CELL_H);
    if (gr >= 0 && gr < GRID_ROWS && gc >= 0 && gc < GRID_COLS && mushrooms[gr][gc].hp > 0) {
      mushrooms[gr][gc].poison = true;
    }
    if (scorpion.x < -20 || scorpion.x > W + 20) scorpion.active = false;
  }

  // Update Function
  function update(t) {
    requestAnimationFrame(update);
    if (!running) {
      drawStart();
      return;
    }
    if (paused) {
      draw();
      drawPaused();
      return;
    }
    const dt = Math.min(40, t - lastTime);
    lastTime = t;

    // movement (classic left / right only)
    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
    if (keys['Space']) shoot();
    player.x = Math.max(10, Math.min(W - 10, player.x));

    // bullets
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].y += bullets[i].dy;
    }
    bullets = bullets.filter((b) => b.y + b.h > 0);

    // move centipedes
    centipedes.forEach((cent) => {
      const s = cent.speed;
      for (let i = 0; i < cent.segments.length; i++) {
        const seg = cent.segments[i];
        if (i === 0) {
          // head movement: if current cell is poisoned -> drop straight down
          const gridC = Math.floor(seg.x / CELL_W);
          const gridR = Math.floor(seg.y / CELL_H);
          if (
            gridR >= 0 &&
            gridR < GRID_ROWS &&
            girdC >= 0 &&
            girdC < GRID_COLS &&
            mushrooms[gridR][gridC].poison
          ) {
            seg.y += CELL_H; // drive
            // leave direction the same
          }
        }
      }
    });
  }
};
