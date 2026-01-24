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
          } else {
            seg.x += cent.dir * s;
            const hitEdge = seg.x < 0 || seg.x > W - SEG_SIZE;
            const hitMushroom =
              gridR >= 0 &&
              gridR < GRID_ROWS &&
              girdC >= 0 &&
              girdC < GRID_COLS &&
              mushrooms[gridR][girdC].hp > 0;
            if (hitEdge || hitMushroom) {
              seg.y += CELL_H;
              cent.dir *= -1;
              seg.x = Math.max(0, Math.min(W - SEG_SIZE, seg.x));
            }
          }
        } else {
          const prev = cont.segments[i - 1];
          const dx = prev.x - seg.x;
          const dy = prev.y - seg.y;
          seg.x += dx * 0.25;
          seg.y += dy * 0.25;
        }
      }
    });

    // bullets collisions
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      // bullet <-> centipede
      let hit = false;
      for (let ci = centipedes.length - 1; ci >= 0 && !hit; ci--) {
        const cent = centipedes[ci];
        for (let si = 0; si < cent.segments.length; si++) {
          const seg = cent.segments[si];
          const segRect = { x: seg.x, y: seg.y, w: SEG_SIZE, h: SEG_SIZE };
          if (rectIntersect(b, segRect)) {
            bullets.splice(bi, 1);
            // spawn mushroom in the cell
            const gc = Math.floor(seg.x / CELL_W);
            const gr = Math.floor(seg.y / CELL_H);
            if (gr >= 0 && gr < GRID_ROWS && gc >= 0 && gc < GRID_COLS) {
              mushrooms[gr][gc].hp = Math.min(3, (mushrooms[gr][gc].hp || 0) + 2);
            }
            // scoring: head = 100, body = 10
            awardScore(si === 0 ? 100 : 10);
            // split centipede
            const before = cent.segments.slice(0, si);
            const after = cent.segments.slice(si + 1).map((s) => ({ x: s.x, y: s.y }));
            const newCents = [];
            if (before.length > 0) newCents.push({ segments: before, dir: cent.dir, speed: cent.speed });
            if (after.length > 0) newCents.push({ segments: after, dir: cent.dir, speed: cent.speed });
            centipedes.splice(ci, 1, ...newCents);
            hit = true;
            break;
          }
        }
      }
      if (hit) continue;

      // bullet <-> spider
      if (spider.active) {
        const spiderRect = { x: spider.x - 8, y: spider.y - 8, w: 16, h: 16 };
        if (rectIntersect(b, spiderRect)) {
          bullets.splice(bi, 1);
          // spider score based on distance from player
          const dist = Math.abs(spider.x - player.x);
          const pts = dist < W / 3 ? 900 : dist < (2 * W) / 3 ? 600 : 300;
          awardScore(pts);
          spider.active = false;
          continue;
        }
      }

      // bullet <-> flea
      if (flea.active) {
        const fleaRect = { x: flea.x - 8, y: flea.y - 8, w: 16, h: 16 };
        if (rectIntersect(b, fleaRect)) {
          bullets.splice(bi, 1);
          awardScore(200);
          flea.active = false;
          continue;
        }
      }

      // bullet <-> scorpion
      if (scorpion.active) {
        const scRect = { x: scorpion.x - 8, y: scorpion.y - 8, w: 16, h: 16 };
        if (rectIntersect(b, scRect)) {
          bullets.splice(bi, 1);
          awardScore(1000);
          scorpion.active = false;
          continue;
        }
      }

      // bullet <-> mushroom
      const gc = Math.floor(b.x / CELL_W);
      const gr = Math.floor(b.y / CELL_H);
      if (gr >= 0 && gr < GRID_ROWS && gc >= 0 && gc < GRID_COLS && mushrooms[gr][gc].hp > 0) {
        mushrooms[gr][gc].hp--;
        bullets.splice(br, 1);
        awardScore(10);
      }
    }

    // bullets cleaned above
    // Update spider/flea/scorpion
    updateSpider(dt);
    updateFlea(dt);
    updateScorpion(dt);

    // move spider/flea/scorpion spawn timers
    nextSpiderSpawn -= dt;
    nextFleaSpawn -= dt;
    nextScorpionSpawn -= dt;
    if (nextSpiderSpawn <= 0 && !spider.active) {
      spawnSpider();
      nextSpiderSpawn = Math.random() * 12000 + 8000;
    }
    if (nextFleaSpawn <= 0 && !flea.active) {
      spawnFlea();
      nextFleaSpawn = Math.random() * 15000 + 10000;
    }
    if (nextScorpionSpawn <= 0 && !scorpion.active) {
      spawnScorpion();
      nextScorpionSpawn = Math.random() * 18000 + 15000;
    }

    // centipede collides with player
    for (const cent of centipedes) {
      for (const seg of cent.segments) {
        const segRect = { x: seg.x, y: seg.y, w: SEG_SIZE, h: SEG_SIZE };
        const playerRect = { x: player.x - 8, y: player.y - 6, w: 16, h: 12 };
        if (rectIntersect(segRect, playerRect)) {
          lives--;
          if (lives <= 0) {
            running = false;
          } else {
            player.x = W / 2;
            bullets = [];
          }
        }
      }
    }

    // spider touches player
    if (spider.active) {
      const sRect = { x: spider.x - 8, y: spider.y - 8, w: 16, h: 16 };
      const pRect = { x: player.x - 8, y: player.y - 6, w: 16, h: 12 };
      if (rectIntersect(sRect, pRect)) {
        lives--;
        spider.active = false;
        if (lives <= 0) running = false;
      }
    }

    // flea touches player
    if (flea.active) {
      const fRect = { x: flea.x - 8, y: flea.y - 8, w: 16, h: 16 };
      const pRect = { x: player.x - 8, y: player.y - 6, w: 16, h: 12 };
      if (rectIntersect(fRect, pRect)) {
        lives--;
        flea.active = false;
        if (lives <= 0) running = false;
      }
    }

    // scorpion touches player
    if (scorpion.active) {
      const scRect = { x: scorpion.x - 8, y: scorpion.y - 8, w: 16, h: 16 };
      const pRect = { x: player.x - 8, y: player.y - 6, w: 16, h: 12 };
      if (rectIntersect(scRect, pRect)) {
        lives--;
        scorpion.active = false;
        if (lives <= 0) running = false;
      }
    }

    // check win
    const totalSegments = centipedes.reduce((acc, c) => acc + c.segments.length, 0);
    if (totalSegments === 0) {
      awardScore(1000);
      nextLevel();
    }

    draw();
  }

  // Drawing functions
  function clear() {
    ctx.clearRect(0, 0, W, H);
  }

  function drawMushroomCell(r, c) {
    const cell = mushrooms[r][c];
    if (!cell || cell.hp <= 0) return;
    const x = c * CELL_W + (CELL_W / 2 - 10);
    const y = r * CELL_H + 8;
    // cap color depends on hp and poison
    let capColor = cell.poison
      ? '#ffffff'
      : cell.hp === 3
        ? '#8000ff'
        : cell.hp === 2
          ? '#ff66ff'
          : '#ffd6ff';
    ctx.fillStyle = capColor;
    // draw cap - semicircle
    ctx.beginPath();
    ctx.arc(x + 10, y + 6, 10, Math.PI, 0);
    ctx.fill();
    // stem
    ctx.fillStyle = '#2a9d2a';
    ctx.fillRect(x + 6, y + 6, 8, 8);
  }
};
