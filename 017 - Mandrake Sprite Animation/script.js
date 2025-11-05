window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 500;

  class Mandrake {
    constructor() {
      this.image = document.getElementById('mandrake');
      this.spriteWidth = 256;
      this.spriteHeight = 256;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight;
      this.x = canvas.width / 2 - this.width / 2;
      this.y = canvas.height / 2 - this.height / 2;
      this.minFrame = 7;
      this.maxFrame = 355;
    }
    draw(context) {
      context.drawImage(
        this.image,
        this.minFrame * this.spriteWidth,
        this.minFrame * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update() {}
  }

  const mandrake = new Mandrake();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mandrake.draw(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
