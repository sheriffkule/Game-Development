class Planet {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 80;
    this.image = document.getElementById('planet');
  }
  draw(context) {
    context.drawImage(this.image, this.x - 100, this.y - 100);
    if (this.game.debug) {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.stroke();
    }
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 40;
    this.image = document.getElementById('player');
    this.aim;
    this.angle = 0;
  }
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(this.image, -this.radius, -this.radius);
    if (this.game.debug) {
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
  }
  update() {
    this.aim = this.game.calcAim(this.game.planet, this.game.mouse);
    this.x = this.game.planet.x + (this.game.planet.radius + this.radius) * this.aim[0];
    this.y = this.game.planet.y + (this.game.planet.radius + this.radius) * this.aim[1];
    this.angle = Math.atan2(this.aim[3], this.aim[2]);
  }
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile)
      projectile.start(
        this.x + this.radius * this.aim[0],
        this.y + this.radius * this.aim[1],
        this.aim[0],
        this.aim[1]
      );
  }
}

class Projectile {
  constructor(game) {
    this.game = game;
    this.x;
    this.y;
    this.radius = 5;
    this.speedX = 1;
    this.speedY = 1;
    this.speedModifier = 5;
    this.free = true;
  }
  start(x, y, speedX, speedY) {
    this.free = false;
    this.x = x;
    this.y = y;
    this.speedX = speedX * this.speedModifier;
    this.speedY = speedY * this.speedModifier;
  }
  reset() {
    this.free = true;
  }
  draw(context) {
    if (!this.free) {
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.strokeStyle = 'gold';
      context.stroke();
      context.restore();
    }
  }
  update() {
    if (!this.free) {
      this.x += this.speedX;
      this.y += this.speedY;
    }
    // reset if outside the visible game area
    if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
      this.reset();
    }
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = 100;
    this.y = 100;
    this.radius = 40;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.speedX = 0;
    this.speedY = 0;
    this.free = true;
  }
  start() {
    this.free = false;
    this.frameY = Math.floor(Math.random() * 4);
    if (Math.random() < 0.5) {
      this.x = Math.random() * this.game.width;
      this.y = Math.random() < 0.5 ? -this.radius : this.game.height + this.radius;
    } else {
      this.x = Math.random() < 0.5 ? -this.radius : this.game.width + this.radius;
      this.y = Math.random() * this.game.height;
    }
    const aim = this.game.calcAim(this, this.game.planet);
    this.speedX = aim[0];
    this.speedY = aim[1];
  }
  reset() {
    this.free = true;
  }
  hit(damage) {
    this.lives -= damage;
  }
  draw(context) {
    if (!this.free) {
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x - this.radius,
        this.y - this.radius,
        this.width,
        this.height
      );
      if (this.game.debug) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.stroke();
      }
    }
  }
  update() {
    if (!this.free) {
      this.x += this.speedX;
      this.y += this.speedY;
      // check collision enemy / planet
      if (this.game.checkCollision(this, this.game.planet)) {
        this.reset();
      }
      // check collision enemy / planet
      if (this.game.checkCollision(this, this.game.player)) {
        this.reset();
      }
      // check collision enemy / projectiles
      this.game.projectilePool.forEach((projectile) => {
        if (!projectile.free && this.game.checkCollision(this, projectile)) {
          projectile.reset();
          this.hit(1);
        }
      });
      if (this.lives < 1) this.frameX++;
      if (this.frameX > this.maxFrame) this.reset()
    }
  }
}

class Asteroid extends Enemy {
  constructor(game) {
    super(game);
    this.image = document.getElementById('asteroid');
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 7;
    this.lives = 5;
    this.maxLives = this.lives;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.planet = new Planet(this);
    this.player = new Player(this);
    this.debug = true;

    this.projectilePool = [];
    this.numberOfProjectiles = 20;
    this.createProjectilePool();

    this.enemyPool = [];
    this.numberOfEnemies = 20;
    this.createEnemyPool();
    this.enemyPool[0].start();
    this.enemyTimer = 0;
    this.enemyInterval = 1700;

    this.mouse = {
      x: 0,
      y: 0,
    };

    // event listeners
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });

    window.addEventListener('mousedown', (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      this.player.shoot();
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'd') this.debug = !this.debug;
      else if (e.key === '1') this.player.shoot();
    });
  }
  render(context, deltaTime) {
    this.planet.draw(context);
    this.player.draw(context);
    this.player.update();
    this.projectilePool.forEach((projectile) => {
      projectile.draw(context);
      projectile.update();
    });
    this.enemyPool.forEach((enemy) => {
      enemy.draw(context);
      enemy.update();
    });
    // periodically activate an enemy
    if (this.enemyTimer < this.enemyInterval) {
      this.enemyTimer += deltaTime;
    } else {
      this.enemyTimer = 0;
      const enemy = this.getEnemy();
      if (enemy) enemy.start();
    }
  }
  calcAim(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const aimX = (dx / distance) * -1;
    const aimY = (dy / distance) * -1;
    return [aimX, aimY, dx, dy];
  }
  checkCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const sumOfRadii = a.radius + b.radius;
    return distance < sumOfRadii;
  }
  createProjectilePool() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilePool.push(new Projectile(this));
    }
  }
  getProjectile() {
    for (let i = 0; i < this.projectilePool.length; i++) {
      if (this.projectilePool[i].free) return this.projectilePool[i];
    }
  }
  createEnemyPool() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemyPool.push(new Asteroid(this));
    }
  }
  getEnemy() {
    for (let i = 0; i < this.enemyPool.length; i++) {
      if (this.enemyPool[i].free) return this.enemyPool[i];
    }
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 800;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;

  const game = new Game(canvas);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate();
});
