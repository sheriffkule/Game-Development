function Tab(x, y, width, height, ctx) {
  this.ctx = ctx;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.friction = 0.95;

  this.drawTab = () => {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  this.changeTabMovement = (direction) => {
    let directions = { left: -2, right: 2 };
    this.speedX = directions[direction];
  };

  this.moveTab = () => {
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
  };
}

function Ball(x, y, radius, level, ctx) {
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

  this.ballStart = () => {
    this.x = WIDTH / 2 - 8;
    this.y = HEIGHT;
    directions = ['rightUp', 'leftYp'];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
  };

  this.ballOver = () => {
    document.getElementById('topTitle').innerText = '';
    document.getElementById('centerSpan').innerText = '';
    document.getElementById('bottomMessage').innerText = '';
    game.playerLives--;
    if (game.playerLives >= 0) {
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
  };

  this.ballChangeDirection = (collision) => {
    if (collision) {
      revertDirections = {
        tabCollide: {
          rightUp: 'rightDown',
          leftUp: 'leftDown',
          rightDown: 'rightUp',
          leftDown: 'leftUp',
        },
        wallCollide: {
          rightUp: 'leftDown',
          leftUp: 'rightDown',
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
  };

  this.ballMovement = () => {
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
  };
}
