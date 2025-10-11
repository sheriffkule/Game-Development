const birdSprite = new Image();
birdSprite.src = 'bird.png';

class Bird {
  constructor() {
    this.x = 150;
    this.y = 200;
    this.vy = 0;
    this.originalWidth = 941;
    this.originalHeight = 680;
    this.width = this.originalWidth / 20;
    this.height = this.originalHeight / 20;
    this.weight = 1;
    this.frameX = 0;
  }
  update() {
    let curve = Math.sin(angle) * 12;
    if (this.y > canvas.height - (this.height + 20) + curve) {
      this.y = canvas.height - (this.height + 20) + curve;
      this.vy = 0;
    } else {
      this.vy += this.weight;
      this.y += this.vy;
    }

    if (this.y < 0 + this.height) {
      this.y = 0 + this.height;
      this.vy = 0;
    }

    if (spacePressed && this.y > this.height * 3) this.flap();
  }
  draw() {
    ctx.fillStyle = 'royalblue';
    // ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      birdSprite,
      this.frameX * this.originalWidth,
      0,
      this.originalWidth,
      this.originalHeight,
      this.x - 20,
      this.y - 12,
      this.width,
      this.height
    );
  }
  flap() {
    this.vy -= 1.8;
    if (this.frameX >= 3) this.frameX = 0;
    else if (frame % 2 === 0) this.frameX++;
  }
}

const bird = new Bird();
