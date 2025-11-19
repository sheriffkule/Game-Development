class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.ctx = context;
    this.width;
    this.height;
    this.cellSize = 50;
    this.columns;
    this.rows;

    this.eventTimer = 0;
    this.eventInterval = 200;
    this.eventUpdate = false;

    this.player1;
    this.player2;
    this.gameObject;

    window.addEventListener('resize', (e) => {
      this.resize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
    });
    this.resize(window.innerWidth, window.innerHeight);
  }
  resize(width, height) {
    this.canvas.width = width - (width % this.cellSize);
    this.canvas.height = height - (height % this.cellSize);
    this.ctx.fillStyle = 'orange';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.columns = Math.floor(this.width / this.cellSize);
    this.rows = Math.floor(this.height / this.cellSize);
    this.player1 = new Keyboard1(this, 0, 0, 1, 0, 'orangered');
    this.player2 = new Keyboard2(this, this.columns - 1, 0, 0, 1, 'magenta');
    this.gameObject = [this.player1, this.player2];
  }
  drawGrid() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }
  handlePeriodicEvents(deltaTime) {
    if (this.eventTimer < this.eventInterval) {
      this.eventTimer += deltaTime;
      this.eventUpdate = false;
    } else {
      this.eventTimer = 0;
      this.eventUpdate = true;
    }
  }
  render(deltaTime) {
    this.handlePeriodicEvents(deltaTime);
    if (this.eventUpdate) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawGrid();
      this.gameObject.forEach((object) => {
        object.draw();
        object.update();
      });
    }
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const game = new Game(canvas, ctx);

  let lastTime = 0;
  function animate(timeStamps) {
    const deltaTime = timeStamps - lastTime;
    lastTime = timeStamps;
    game.render(deltaTime);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});
