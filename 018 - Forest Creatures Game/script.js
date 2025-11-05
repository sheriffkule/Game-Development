window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1280;
  canvas.height = 720;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener('keydown', (e) => {
        this.game.lastKey = 'P: ' + e.key;
      });

      window.addEventListener('keyup', (e) => {
        this.game.lastKey = 'R: ' + e.key;
      });
    }
  }

  class OwlBear {
    constructor(game) {
      this.game = game;
      this.spriteWidth = 200;
      this.spriteHeight = 200;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.frameX = 0;
      this.frameY = 3;
      this.maxFrame = 30;
      this.x = 500;
      this.y = 200;
      this.speedX = 0;
      this.speedY = 0;
      this.maxSpeed = 10;
      this.image = document.getElementById('owlbear');
    }
    draw(context) {
      context.lineWidth = 8;
      context.strokeRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    setSpeed(speedX, speedY) {
      this.speedX = speedX;
      this.speedY = speedY;
    }
    update() {
      if (this.game.lastKey == 'P: ArrowLeft') {
        this.setSpeed(-this.maxSpeed, 0);
      } else if (this.game.lastKey == 'P: ArrowRight') {
        this.setSpeed(this.maxSpeed, 0);
      } else if (this.game.lastKey == 'P: ArrowUp') {
        this.setSpeed(0, -this.maxSpeed);
      } else if (this.game.lastKey == 'P: ArrowDown') {
        this.setSpeed(0, this.maxSpeed);
      } else {
        this.setSpeed(0, 0);
      }
      this.x += this.speedX;
      this.y += this.speedY;
      // horizontal boundaries
      if (this.x < 0) {
        this.x = 0;
      } else if (this.x > this.game.width - this.width) {
        this.x = this.game.width - this.width;
      }
      // vertical boundaries
      if (this.y < 0 + this.game.topMargin) {
        this.y = this.game.topMargin;
      } else if (this.y > this.game.height - this.height) {
        this.y = this.game.height - this.height;
      }
      // sprite animation
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
    }
  }

  class Object {
    constructor() {}
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.topMargin = 200;
      this.lastKey = undefined;
      this.input = new InputHandler(this);
      this.owlBear = new OwlBear(this);
    }
    render(context) {
      this.owlBear.draw(context);
      this.owlBear.update();
    }
  }

  const game = new Game(canvas.width, canvas.height);
  game.render(ctx);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
