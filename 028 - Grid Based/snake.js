const Snake = {
  position: { x: 0, y: Math.floor(ROWS / 2) },
  velocity: { x: 1, y: 0 },
  length: 15,
  segments: [],
  score: 0,
  draw(context) {
    this.segments.forEach((segment, i) => {
      if (i === 0) context.fillStyle = 'gold';
      else context.fillStyle = 'royalblue';
      context.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
    context.textAlign = 'left';
    context.fillStyle = 'black';
    context.fillText('Score:' + this.score, 10, 20);
  },
  update() {
    // move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // add / remove segments
    this.segments.unshift({ x: this.position.x, y: this.position.y });
    if (this.segments.length > this.length) {
      this.segments.pop();
    }

    // collision with walls
    if (
      this.position.x < 0 ||
      this.position.x > COLUMNS - 1 ||
      this.position.y < 0 ||
      this.position.y > ROWS - 1
    ) {
      GAME.gameOver = true;
    }

    // eat food
    if (this.position.x === Food.x && this.position.y === Food.y) {
      Food.reset();
      this.length++;
      this.score++;
    }

    // eat tail
    this.segments.forEach((segment, i) => {
      if (i > 0 && segment.x === this.position.x && segment.y === this.position.y) {
        this.segments.length = i + 1;
        this.score -= 5;
        this.length = this.segments.length;;
      }
    });
  },
  moveUp() {
    this.velocity.x = 0;
    this.velocity.y = -1;
  },
  moveDown() {
    this.velocity.x = 0;
    this.velocity.y = 1;
  },
  moveLeft() {
    this.velocity.x = -1;
    this.velocity.y = 0;
  },
  moveRight() {
    this.velocity.x = 1;
    this.velocity.y = 0;
  },
};
