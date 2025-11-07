window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 800;
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.fillStyle = 'white';

  class Robot {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = this.canvas.width * 0.5;
      this.y = this.canvas.height * 0.5;
      this.radius = 80;
      this.angle = 0;
      this.bodyImage = document.getElementById('body');
      this.eye1Image = document.getElementById('eye1');
      this.eye2Image = document.getElementById('eye2');
      this.reflection = document.getElementById('reflection');
      this.mouse = {
        x: 0,
        y: 0,
      };
      this.canvas.addEventListener('mousemove', (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
      });
    }
    draw(context) {
      // body
      context.drawImage(
        this.bodyImage,
        this.x - this.bodyImage.width * 0.5 + 65,
        this.y - this.bodyImage.width * 0.5 - 64
      );
      // eye 1
      context.beginPath();
      context.arc(
        this.x + Math.cos(this.angle) * this.radius * 0.35,
        this.y + Math.sin(this.angle) * this.radius * 0.35,
        this.radius * 0.6,
        0,
        Math.PI * 2
      );
      context.stroke();
      // eye 2
      context.beginPath();
      context.arc(
        this.x + Math.cos(this.angle) * this.radius * 0.6,
        this.y + Math.sin(this.angle) * this.radius * 0.6,
        this.radius * 0.3,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    update() {
      const dx = this.mouse.x - this.x;
      const dy = this.mouse.y - this.y;
      this.angle = Math.atan2(dy, dx);
    }
  }
  const robot = new Robot(canvas);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    robot.draw(ctx);
    robot.update();
    requestAnimationFrame(animate);
  }
  animate();
});
