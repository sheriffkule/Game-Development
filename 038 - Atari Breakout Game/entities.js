class Tab {
  constructor(x, y, width, height, ctx) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.friction = 0.95;
  }

  drawTab() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  changeTabMovement(direction) {
    let directions = { left: -2, right: 2 };
    this.speedX = directions[direction];
  }

  moveTab() {
    if (this.x >= 0 && this.x + this.width <= WIDTH) {
      this.x += this.speedX;
      if (this.speedX != 0) {
        if (this.speedX > 0) {
          this.speedX *= this.friction;
        }
        if (this.speedX < 0) {
          this.speedX *= this.friction;
        }
      }
    } else if (this.x <= 0) {
      this.x = 0;
    } else if (this.x + this.width >= WIDTH - 1) {
      this.x = 800 - this.width;
    }
  }
}

class Ball {
  constructor(x, y, radius, level, ctx) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.level = level;
    this.direction;
    this.circle;
    this.levelSpeed = {
      0: 1.5,
      1: 1.25,
      2: 1,
      3: 1,
      4: 1,
    };
    this.speed = this.levelSpeed[this.level];
  }

  ballStart() {
    this.x = WIDTH / 2 - 8;
    this.y = HEIGHT;
    let directions = ['rightUp', 'leftUp'];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
  }

  ballOver() {
    document.getElementById('topTitle').innerText = '';
    document.getElementById('centerSpan').innerText = '';
    document.getElementById('bottomMessage').innerText = '';
    game.playerLives--;
    if (game.playerLives > 0) {
      game.timerTicks = 0;
      game.pause = true;
      let count = 3;
      let spanElement = document.getElementById('centerSpan');
      spanElement.innerText = count;
      let countdownSpan = setInterval(() => {
        count--;
        spanElement.innerText = count;
      }, 750);
      canvasTextScreen.style.display = 'block';
      setTimeout(() => {
        game.pause = false;
        canvasTextScreen.style.display = 'none';
        clearInterval(countdownSpan);
      }, 3000);
      this.ballStart();
    }
  }

  ballChangeDirection(collision) {
    if (collision) {
      let revertDirections = {
        tabCollide: {
          rightUp: 'rightDown',
          leftUp: 'leftDown',
          rightDown: 'rightUp',
          leftDown: 'leftUp',
        },
        wallCollide: {
          rightUp: 'leftUp',
          leftUp: 'rightUp',
          rightDown: 'leftDown',
          leftDown: 'rightDown',
        },
        topCollide: {
          rightUp: 'rightDown',
          leftUp: 'leftDown',
          rightDown: 'rightDown',
          leftDown: 'leftDown',
        },
      };

      this.direction = revertDirections[collision][this.direction];
    } else {
      this.direction = this.direction;
    }
  }

  ballMovement() {
    switch (this.direction) {
      case 'leftUp':
        this.x -= this.speed;
        this.y -= this.speed;
        break;
      case 'rightUp':
        this.x += this.speed;
        this.y -= this.speed;
        break;
      case 'leftDown':
        this.x -= this.speed;
        this.y += this.speed;
        break;
      case 'rightDown':
        this.x += this.speed;
        this.y += this.speed;
        break;
    }
  }

  drawBall() {
    this.ctx.beginPath();
    this.circle = this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.closePath();
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
  }
}

class Block {
  constructor(x, y, width, height, color, level, ctx) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.level = level;
  }

  drawBlock() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
