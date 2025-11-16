const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;
ctx.font = '25px Alfa Slab One';

class Alien {
  constructor(game) {
    this.game = game;
    this.spriteWidth = 360;
    this.spriteHeight = 360;
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height * 0.5 - this.height * 0.5;
    this.color = 'darkgreen';
    this.counter = 0;
    this.maxCount = 200;
    this.image = document.getElementById('locustmorph_large');
    this.frameX = 0;
    this.frameY;
    this.maxFrame = 38;
  }
  draw(context) {
    this.frameX < this.maxFrame ? this.frameX++ : (this.frameX = 0);
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
}

class Idle extends Alien {
  start() {
    this.color = 'blue';
    this.text = `IDLE! Press 2 to CHARGE or 3 to SWARM`;
    this.frameX = 0;
    this.frameY = 0;
  }
  update() {
    if (this.game.keys.has('2')) {
      this.game.setAlienState(1);
    } else if (this.game.keys.has('3')) {
      this.game.setAlienState(2);
    }
  }
}

class Charge extends Alien {
  start() {
    this.color = 'yellow';
    this.counter = 0;
    this.text = `CHARGING! Press 3 to SWARM or wait for the counter to reach ${this.maxCount} to automatically switch to IDLE`;
    this.frameX = 0;
    this.frameY = 1;
  }
  update() {
    if (this.game.keys.has('3')) {
      this.game.setAlienState(2);
    }
    this.counter++;
    console.log(this.counter);
    if (this.counter > this.maxCount) {
      this.game.setAlienState(0);
    }
  }
  draw(context) {
    super.draw(context);
    context.fillText(this.counter, 15, 30);
  }
}

class Swarm extends Alien {
  start() {
    this.color = 'orangered';
    this.text = `SWARMING! Press 1 to IDLE or 2 to CHARGE`;
    this.frameX = 0;
    this.frameY = 2;
  }
  update() {
    if (this.game.keys.has('1')) {
      this.game.setAlienState(0);
    } else if (this.game.keys.has('2')) {
      this.game.setAlienState(1);
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = new Set();
    this.info = document.getElementById('info');
    this.alienStates = [new Idle(this), new Charge(this), new Swarm(this)];
    this.alien;
    this.setAlienState(0);

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      console.log(this.keys);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.clear();
    });
  }
  render(context) {
    this.alien.update();
    this.alien.draw(context);
  }
  setAlienState(state) {
    this.alien = this.alienStates[state];
    this.alien.start();
    this.info.innerText = this.alien.text;
  }
}

const game = new Game(canvas);
game.render(ctx);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.render(ctx);
  requestAnimationFrame(animate);
}
animate();
