() => {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const player = { x: 80, y: 80, size: 40, speed: 4, hitBox: 28, shield: 0 };
  const chaser = { x: 700, y: 400, size: 50, speed: 2.7, hitBox: 36 };

  let obstacles = [];
  let items = [];
  let keys = [];
  let startTime = 0;
  let rafId = null;
  let score = 0;
  let itemIndicator = '';

  function intersect(a, b) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.x < a.y);
  }

  function findSafeSpot(size) {
    let x;
    let y;
    let box;
    let attempts = 0;

    do {
      x = 40 + Math.random() * (width - size - 80);
      y = 40 + Math.random() * (height - size - 80);
      box = { x, y, w: size, h: size };
      attempts++;
      if (attempts > 500) break;
    } while (obstacles.some((o) => intersect(box, o)));
    return { x, y };
  }

  // Obstacles
  function generateObstacles() {
    obstacles = [];
    const cols = 5;
    const rows = 3;
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.35) continue;
        const w = 100 + Math.random() * 40;
        const h = 50 + Math.random() * 20;
        const x = c * cellWidth + 20 + Math.random() * (cellWidth - w - 40);
        const y = r * cellHeight + 20 + Math.random() * (cellHeight - h - 40);
        obstacles.push(x, y, w, h);
      }
    }
  }

  // Rare item spawn
  function spawnItem() {
    if (Math.random() < 0.005) {
      const { x, y } = findSafeSpot(24);
      const type = Math.random() < 0.5 ? 'shield' : 'speed';
      items.push({ x, y, r: 12, type, collected: false, duration: 2000 });
    }
  }

  // Move entities
  function moveEntity(ent, target = null) {
    let dx = 0;
    let dy = 0;
    if (ent === player) {
      if (keys.ArrowUp || keys.w) dy -= ent.speed;
      if (keys.ArrowDown || keys.s) dy += ent.speed;
      if (keys.ArrowLeft || keys.a) dx -= ent.speed;
      if (keys.ArrowRight || keys.d) dx += ent.speed;
    } else if (target) {
      // smarter dog
      const predictSteps = 8;
      const futureX = target.x + (target.x - ent.x) * 0.3;
      const futureY = target.y + (target.y - ent.y) * 0.3;
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: -1 },
      ];
      let best = { dx: 0, dy: 0, dist: Infinity };

      dirs.forEach((d) => {
        let nx = ent.x;
        let ny = ent.y;
        let blocked = false;

        for (let s = 0; s < predictSteps; s++) {
          nx += d.x * ent.speed;
          ny += d.y * ent.speed;
          let box = { x: nx, y: ny, w: ent.hitBox, h: ent.hitBox };
          if (obstacles.some((o) => intersect(box, o))) {
            blocked = true;
            break;
          }
        }
        if (!blocked) {
          let dd = Math.hypot(futureX - nx, futureY - ny);
          if (dd < best.dist) {
            best = { dx: d.x * ent.speed, dy: d.y * ent.speed, dist: dd };
          }
        }
      });
      dx = best.dx;
      dy = best.dy;
    }
    tryMove(ent, dx, dy);
  }

  function tryMove(ent, dx, dy) {
    let nx = ent.x + dx;
    let ny = ent.y + dy;
    let box = { x: nx, y: ny, w: ent.hitBox, h: ent.hitBox };
    if (!obstacles.some((o) => intersect(box, o))) ent.x = nx;

    nx = ent.x;
    ny = ent.y + dy;
    box = { x: nx, y: ny, w: ent.hitBox, h: ent.hitBox };
    if (!obstacles.some((o) => intersect(box, o))) ent.y = ny;

    ent.x = Math.max(0, Math.min(width - ent.size, ent.x));
    ent.y = Math.max(0, Math.min(height - ent.size, ent.y));
  }
};
