class Obstacles {
  constructor(game, x) {
    this.game = game;
    this.spriteWidth = 120;
    this.spriteHeight = 120;
    this.scaledWidth = this.spriteWidth * this.game.ratio;
    this.scaledHeight = this.spriteHeight * this.game.ratio;
    this.x = x;
    this.y = Math.random() * (this.game.height - this.scaledHeight);
    this.collisionX;
    this.collisionY;
    this.collisionRadius = this.scaledWidth * 0.5;
    this.speedY = Math.random() < 0.5 ? -1 * this.game.ratio : 1 * this.game.ratio;
    this.markedForDeletion = false;
  }
  update() {
    this.x -= this.game.speed;
    this.y += this.speedY;
    this.collisionX = this.x + this.scaledWidth * 0.5;
    this.collisionY = this.y + this.scaledHeight * 0.5;
    if (this.y <= 0 || this.y >= this.game.height - this.scaledHeight) {
      this.speedY *= -1;
    }
    if (this.ifOffScreen()) {
      this.markedForDeletion = true;
      this.game.obstacles = this.game.obstacles.filter((obstacle) => !obstacle.markedForDeletion);
      this.game.score++;
      if (this.game.obstacles.length <= 0) this.game.gameOver = true;
    }
    if (this.game.checkCollision(this, this.game.player)) {
        this.game.gameOver = true;
        this.game.player.collided = true;
    }
  }
  draw() {
    this.game.ctx.fillRect(this.x, this.y, this.scaledWidth, this.scaledHeight);
    this.game.ctx.beginPath();
    this.game.ctx.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
    this.game.ctx.stroke();
  }
  resize() {
    this.scaledWidth = this.spriteWidth * this.game.ratio;
    this.scaledHeight = this.spriteHeight * this.game.ratio;
  }
  ifOffScreen() {
    return this.x < -this.scaledWidth;
  }
}
