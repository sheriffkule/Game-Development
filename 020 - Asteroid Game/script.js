window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 800;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;

  class Asteroid {
    constructor(game) {
      this.game = game;
      this.radius = 75;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
      this.image = document.getElementById('asteroid');
      this.spriteWidth = 150;
      this.spriteHeight = 155;
      this.speed = Math.random() * 1.5 + 0.1;
      this.free = true;
      this.angle = 0;
      this.va = Math.random() * 0.02 - 0.01;
    }
    draw(context) {
      if (!this.free) {
        // context.beginPath();
        // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // context.stroke();
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(
          this.image,
          -this.spriteWidth * 0.5,
          -this.spriteHeight * 0.5,
          this.spriteWidth,
          this.spriteHeight
        );
        context.restore();
      }
    }
    update() {
      if (!this.free) {
        this.angle += this.va;
        this.y += Math.cos(this.angle) * 0.5;
        this.x += this.speed;
        if (this.x > this.game.width + this.radius) {
          this.reset();
        }
      }
    }
    reset() {
      this.free = true;
    }
    start() {
      this.free = false;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
    }
  }

  class Explosion {
    constructor(game) {
      this.game = game;
      this.x = 0;
      this.y = 0;
      this.speed = 0;
      this.image = document.getElementById('explosions');
      this.spriteWidth = 300;
      this.spriteHeight = 300;
      this.free = true;
      this.frameX = 0;
      this.frameY = Math.floor(Math.random() * 3);
      this.maxFrame = 22;
      this.animationTimer = 0;
      this.animationInterval = 1000 / 22;
    }
    draw(context) {
      if (!this.free) {
        context.drawImage(
          this.image,
          this.frameX * this.spriteWidth,
          this.frameY * this.spriteHeight,
          this.spriteWidth,
          this.spriteHeight,
          this.x - this.spriteWidth * 0.5,
          this.y - this.spriteHeight * 0.5,
          this.spriteWidth,
          this.spriteHeight
        );
      }
    }
    update(deltaTime) {
      if (!this.free) {
        if (this.animationTimer > this.animationInterval) {
          this.frameX++;
          if (this.frameX > this.maxFrame) this.reset();
          this.animationTimer = 0;
        } else {
          this.animationTimer += deltaTime;
        }
      }
    }
    reset() {
      this.free = true;
      this.frameY = Math.floor(Math.random() * 3);
    }
    start(x, y) {
      this.free = false;
      this.x = x;
      this.y = y;
      this.frameX = 0;
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.asteroidPool = [];
      this.maxAsteroids = 30;
      this.asteroidTimer = 0;
      this.asteroidInterval = 1000;
      this.createAsteroidPool();

      this.mouse = {
        x: 0,
        y: 0,
      };

      this.explosionPool = [];
      this.maxExplosions = 20
      this.createExplosionPool();

      window.addEventListener('click', (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        const explosion = this.getExplosion();
        if (explosion) explosion.start(this.mouse.x, this.mouse.y);
        console.log(explosion);
      });
    }
    createAsteroidPool() {
      for (let i = 0; i < this.maxAsteroids; i++) {
        this.asteroidPool.push(new Asteroid(this));
      }
    }
    createExplosionPool() {
      for (let i = 0; i < this.maxExplosions; i++) {
        this.explosionPool.push(new Explosion(this));
      }
    }
    getAsteroid() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }
    getExplosion() {
      for (let i = 0; i < this.explosionPool.length; i++) {
        if (this.explosionPool[i].free) {
          return this.explosionPool[i];
        }
      }
    }
    render(context, deltaTime) {
      // create asteroids periodically
      if (this.asteroidTimer > this.asteroidInterval) {
        const asteroid = this.getAsteroid();
        if (asteroid) asteroid.start();
        this.asteroidTimer = 0;
      } else {
        this.asteroidTimer += deltaTime;
      }
      this.asteroidPool.forEach((asteroid) => {
        asteroid.draw(context);
        asteroid.update();
      });
      this.explosionPool.forEach((explosion) => {
        explosion.draw(context);
        explosion.update(deltaTime);
      });
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
