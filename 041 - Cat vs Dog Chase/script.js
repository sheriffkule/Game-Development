(function() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const player = { x: 80, y: 80, size: 40, speed: 4, hitBox: 28, shield: 0 };
  const chaser = { x: 700, y: 400, size: 50, speed: 2, hitBox: 36 };

  let obstacles = [];
  let items = [];
  let keys = [];
  let startTime = 0;
  let rafId = null;
  let score = 0;
  let itemIndicator = '';

  function intersect(a, b) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
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
        obstacles.push({ x, y, w, h });
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

  // Draw
  function draw() {
    ctx.clearRect(0, 0, width, height);
    obstacles.forEach((o) => {
      ctx.fillStyle = '#a67b5b';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#5a3a2b';
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    });

    items.forEach((i) => {
      if (!i.collected) {
        ctx.beginPath();
        ctx.arc(i.x, i.y, i.r, 0, Math.PI * 2);
        ctx.fillStyle = i.type === 'shield' ? '#77dd77' : '#ffcc00';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(i.type, i.x, i.y - 14);
      }
    });

    ctx.fillStyle = '#f2a65a';
    ctx.beginPath();
    ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    if (player.shield > 0) {
      ctx.strokeStyle = '#77d77';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(player.x + player.size / 2, player.y + player.size / 2, player.size + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#cc4444';
    ctx.beginPath();
    ctx.arc(chaser.x + chaser.size / 2, chaser.y + chaser.size / 2, chaser.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function checkCatch() {
    if (player.shield > 0) return false;
    const dx = chaser.x + chaser.size / 2 - (player.x + player.size / 2);
    const dy = chaser.y + chaser.size / 2 - (player.y + player.size / 2);
    return Math.hypot(dx, dy) < 40;
  }

  function collectItems() {
    items.forEach((i) => {
      if (!i.collected) {
        const dx = player.x + player.size / 2 - i.x;
        const dy = player.y + player.size / 2 - i.y;
        if (Math.hypot(dx, dy) < 25) {
          i.collected = true;
          if (i.type === 'shield') {
            player.shield = i.duration;
            itemIndicator = 'Shield! Invulnerable';
          }
          if (i.type === 'speed') {
            player.speed += 2;
            itemIndicator = 'Speed Boost!';

            setTimeout(() => {
              player.speed -= 2;
              itemIndicator = '';
            }, i.duration);
          }
          score += 10;
        }
      }
    });
  }

  function updateHUD() {
    const sec = ((Date.now() - startTime) / 1000).toFixed(1);
    document.getElementById('score').textContent = `Time: ${sec}s | Score: ${score}`;
    document.getElementById('itemIndicator').textContent = itemIndicator;
  }

  function loop() {
    moveEntity(player);
    moveEntity(chaser, player);
    collectItems();
    draw();
    if (player.shield > 0) player.shield -= 16;
    spawnItem();
    if (checkCatch()) {
      cancelAnimationFrame(rafId);
      showGameOver();
      return;
    }
    updateHUD();
    rafId = requestAnimationFrame(loop);
  }

  function showGameOver() {
    const time = ((Date.now() - startTime) / 1000).toFixed(1);
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:#eee;padding:20px 40px;border-radius:10px;text-align:center;">
        <h2>The Dog Caught You!</h2>
        <p>You survived <b>${time}s</b> with <b>${score}</b> points.</p>
        <button
          id="again"
          style="padding:8px 16px;border-radius:6px;border:0;background:#ffcc00;cursor:pointer;">
          Restart
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    function restartGame() {
      overlay.remove();
      window.removeEventListener('keydown', handleEnterKey);
      startGame();
    }

    function handleEnterKey(e) {
      if (e.key === 'Enter') {
        restartGame();
      }
    }

    window.addEventListener('keydown', handleEnterKey);
    document.getElementById('again').onclick = restartGame;
  }

  function startGame() {
    generateObstacles();
    const safeCat = findSafeSpot(player.size);
    const safeDog = findSafeSpot(chaser.size);
    player.x = safeCat.x;
    player.y = safeCat.y;
    player.speed = 4;
    player.shield = 0;
    chaser.x = safeDog.x;
    chaser.y = safeDog.y;
    score = 0;
    startTime = Date.now();
    rafId = requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });
  document.getElementById('resetBtn').addEventListener('click', startGame);

  startGame();
})();
