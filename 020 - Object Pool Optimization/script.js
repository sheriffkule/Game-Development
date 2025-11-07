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
      this.x = Math.random() * this.game.width;
      this.y = Math.random() * this.game.height;
      this.image = document.getElementById('asteroid');
      this.spriteWidth = 150;
      this.spriteHeight = 155;
      this.speed = 1;
    }
    draw(context) {
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.stroke();
      context.drawImage(
        this.image,
        this.x - this.spriteWidth * 0.5,
        this.y - this.spriteHeight * 0.5,
        this.spriteWidth,
        this.spriteHeight
      );
    }
    update() {
        this.x += this.speed;
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.asteroidPool = [];
      this.max = 3;
      this.createAsteroidPool();
    }
    createAsteroidPool() {
      for (let i = 0; i < this.max; i++) {
        this.asteroidPool.push(new Asteroid(this));
      }
    }
    render(context) {
      this.asteroidPool.forEach((asteroid) => {
        asteroid.draw(context);
        asteroid.update()
      });
    }
  }

  const game = new Game(canvas.width, canvas.height);
  game.render(ctx);

  function animate() {}
  animate();
});
