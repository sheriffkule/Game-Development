class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.baseHeight = 720;
    this.ratio = this.height / this.baseHeight;
    this.background = new Background(this);
    this.player = new Player(this);
    this.obstacles = [];
    this.numberOfObstacles = 10;
    this.gravity;
    this.speed;

    this.resize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', (e) => {
      this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
    });
    //mouse controls
    this.canvas.addEventListener('mousedown', (e) => {
      this.player.flap();
    });
    // keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') this.player.flap();
    });
    // touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      this.player.flap();
    });
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.fillStyle = 'goldenrod';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ratio = this.height / this.baseHeight;

    this.gravity = 0.15 * this.ratio;
    this.speed = 2 * this.ratio;
    this.background.resize();
    this.player.resize();
  }
  render() {
    this.background.update();
    this.background.draw();
    this.player.update();
    this.player.draw();
  }
  createObstacles() {
    this.obstacles = [];
    const firstX = 100;
    const obstacleSpacing = 100;
    for (let i = 0; i < this.numberOfObstacles; i++) {
      this.obstacles.push(new Obstacles(this, firstX + i * obstacleSpacing));
    }
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 700;
  canvas.height = 720;

  const game = new Game(canvas, ctx);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render();
    requestAnimationFrame(animate);
  }
  animate();
});
