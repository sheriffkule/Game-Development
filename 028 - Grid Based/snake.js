const Snake = {
  position: { x: 0, y: Math.floor(ROWS * 0.5) },
  velocity: { x: 1, y: 0 },
  length: 2,
  segments: [],
  score: 0,
  image: document.getElementById('snake_zilla'),
  spriteWidth: 200,
  spriteHeight: 200,
  readyToMove: true,
  draw(context) {
    this.segments.forEach((segment, i) => {
      //   if (i === 0) context.fillStyle = 'gold';
      //   else context.fillStyle = 'royalblue';
      //   context.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

      this.setSpriteFrame(i);

      context.drawImage(
        this.image,
        segment.frameX * this.spriteWidth,
        segment.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });
    context.textAlign = 'left';
    context.fillStyle = 'black';
    context.fillText('Score:' + this.score, 10, 20);
  },
  update() {
    this.readyToMove = true;
    // move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // add / remove segments
    this.segments.unshift({ x: this.position.x, y: this.position.y, frameX: 0, frameY: 0 });
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
        this.length = this.segments.length;
      }
    });
  },
  reset() {
    this.score = 0;
    this.length = 2;
    this.segments = [];
    this.position = { x: 0, y: Math.floor(ROWS * 0.5) };
    this.velocity = { x: 1, y: 0 };
    for (let i = 0; i < this.length; i++) {
      if (i > 0) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
      }
      this.segments.unshift({ x: this.position.x, y: this.position.y, frameX: 0, frameY: 0 });
    }
  },
  moveUp() {
    if (this.velocity.y === 0 && this.readyToMove) {
      this.velocity.x = 0;
      this.velocity.y = -1;
      this.readyToMove = false;
    }
  },
  moveDown() {
    if (this.velocity.y === 0 && this.readyToMove) {
      this.velocity.x = 0;
      this.velocity.y = 1;
      this.readyToMove = false;
    }
  },
  moveLeft() {
    if (this.velocity.x === 0 && this.readyToMove) {
      this.velocity.x = -1;
      this.velocity.y = 0;
      this.readyToMove = false;
    }
  },
  moveRight() {
    if (this.velocity.x === 0 && this.readyToMove) {
      this.velocity.x = 1;
      this.velocity.y = 0;
      this.readyToMove = false;
    }
  },
  setSpriteFrame(index) {
    const segment = this.segments[index];
    const nextSegment = this.segments[index + 1] || 0;
    const prevSegment = this.segments[index - 1] || 0;

    if (index === 0) {
      // head
      if (segment.y < nextSegment.y) {
        // up
        if (Food.y === segment.y - 1 && Food.x === segment.x) {
          segment.frameX = 7;
          segment.frameY = 1;
        } else {
          segment.frameX = 1;
          segment.frameY = 2;
        }
      } else if (segment.y > nextSegment.y) {
        // down
        if (Food.y === segment.y + 1 && Food.x === segment.x) {
          segment.frameX = 7;
          segment.frameY = 3;
        } else {
          segment.frameX = 0;
          segment.frameY = 4;
        }
      } else if (segment.x < nextSegment.x) {
        // left
        if (Food.x === segment.x - 1 && Food.y === segment.y) {
          segment.frameX = 2;
          segment.frameY = 4;
        } else {
          segment.frameX = 0;
          segment.frameY = 0;
        }
      } else if (segment.x > nextSegment.x) {
        // right
        if (Food.x === segment.x + 1 && Food.y === segment.y) {
          segment.frameX = 4;
          segment.frameY = 4;
        } else {
          segment.frameX = 2;
          segment.frameY = 1;
        }
      }
    } else if (index === this.segments.length - 1) {
      // tail
      if (prevSegment.y < segment.y) {
        // up
        segment.frameX = 1;
        segment.frameY = 4;
      } else if (prevSegment.y > segment.y) {
        // down
        segment.frameX = 0;
        segment.frameY = 2;
      } else if (prevSegment.x < segment.x) {
        // left
        segment.frameX = 2;
        segment.frameY = 0;
      } else if (prevSegment.x > segment.x) {
        // right
        segment.frameX = 0;
        segment.frameY = 1;
      }
    } else {
      // body
      if (nextSegment.x < segment.x && prevSegment.x > segment.x) {
        // horizontal right
        segment.frameX = 1;
        segment.frameY = 1;
      } else if (nextSegment.x > segment.x && prevSegment.x < segment.x) {
        // horizontal left
        segment.frameX = 1;
        segment.frameY = 0;
      } else if (nextSegment.y > segment.y && prevSegment.y < segment.y) {
        // vertical up
        segment.frameX = 1;
        segment.frameY = 3;
      } else if (nextSegment.y < segment.y && prevSegment.y > segment.y) {
        // vertical down
        segment.frameX = 0;
        segment.frameY = 3;
      }
      // bend counter clockwise
      else if (prevSegment.x < segment.x && nextSegment.y > segment.y) {
        // up left
        segment.frameX = 4;
        segment.frameY = 0;
      } else if (prevSegment.y > segment.y && nextSegment.x > segment.x) {
        // left down
        segment.frameX = 3;
        segment.frameY = 0;
      } else if (prevSegment.x > segment.x && nextSegment.y < segment.y) {
        // down right
        segment.frameX = 3;
        segment.frameY = 1;
      } else if (prevSegment.y < segment.y && nextSegment.x < segment.x) {
        // right up
        segment.frameX = 4;
        segment.frameY = 1;
      }
      // bend clock wise
      else if (nextSegment.x < segment.x && prevSegment.y > segment.y) {
        // right down
        segment.frameX = 3;
        segment.frameY = 2;
      } else if (nextSegment.y < segment.y && prevSegment.x < segment.x) {
        // down left
        segment.frameX = 3;
        segment.frameY = 3;
      } else if (nextSegment.x > segment.x && prevSegment.y < segment.y) {
        // left up
        segment.frameX = 2;
        segment.frameY = 3;
      } else if (nextSegment.y > segment.y && prevSegment.x > segment.x) {
        // up right
        segment.frameX = 2;
        segment.frameY = 2;
      } else {
        segment.frameX = 6;
        segment.frameY = 0;
      }
    }
  },
};
