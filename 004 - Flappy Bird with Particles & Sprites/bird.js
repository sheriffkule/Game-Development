class Bird {
  constructor() {
    this.x = 150;
    this.y = 200;
    this.vy = 0;
    this.width = 20;
    this.height = 20;
    this.weight = 1;
  }
  update() {
    let curve = Math.sin(angle) * 5;
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
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  flap() {
    this.vy -= 2;
  }
}

const bird = new Bird();
