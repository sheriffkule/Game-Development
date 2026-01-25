const canvasTextScreen = document.getElementById('canvasTextScreen');
canvasTextScreen.style.display = 'none';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('gameScreen');
canvas.style.display = 'none';

const WIDTH = 800;
const HEIGHT = 400;

canvas.width = WIDTH;
canvas.height = HEIGHT;

let muteFlag = false;
let infoFlag = false;

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

let game;

function gameState() {
  this.blockHitAudio = new Sound('assets/hit-block.wav');
  this.padHitAudio = new Sound('assets/hit-pad.wav');
  this.canRestart = false;
  this.pointsDict = {
    4: 10,
    3: 20,
    2: 30,
    1: 40,
    0: 50,
  };
  this.timeTicks = 0;
  this.pause = false;
  this.gameLevel = 0;
  this.gamePoints = 0;
  this.playerLives = 2;
  this.blocksDestroyed = 0;
  this.tab = new Tab(WIDTH / 2 - 150 / 2, 350, 150, 10, ctx);
  this.ball = new Ball(WIDTH / 2 - 8, HEIGHT, 8, 4, ctx);

  this.level0Blocks = generateBlocks(0, ctx);
  this.level1Blocks = generateBlocks(1, ctx);
  this.level2Blocks = generateBlocks(2, ctx);
  this.level3Blocks = generateBlocks(3, ctx);
  this.level4Blocks = generateBlocks(4, ctx);
  this.allLevelBlocks = [
    this.level0Blocks,
    this.level1Blocks,
    this.level2Blocks,
    this.level3Blocks,
    this.level4Blocks,
  ];
  this.ball.ballStart();
  this.timerId = setInterval(updateGameArea, 1);

  canvasTextScreen.style.display = 'none';
}

function updateGameArea() {
  if (!game.pause) {
    game.timerTicks += 1;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    game.tab.moveTab();
    for (let i = 0; i < game.allLevelBlocks.length; i++) {
      for (let j = 0; j < game.allLevelBlocks[i].length; j++) {
        game.allLevelBlocks[i][j].drawBlock();
      }
    }

    game.ball.ballMovement();
    game.ball.drawBall();
    game.tab.drawTab();
    if (game.timerTicks > 100) {
      game.ball.ballChangeDirection(detectCollision(game.ball, game.tab));
    }

    let blockThatCollide = detectCollision(game.ball, game.allLevelBlocks);
    if (blockThatCollide) {
      game.gamePoints += game.pointsDict[blockThatCollide[0]];
      game.allLevelBlocks[blockThatCollide[0]].splice([blockThatCollide[1]], 1);
      game.ball.ballChangeDirection('topCollide');
      if (blockThatCollide[0] < game.ball.level) {
        game.ball.speed = game.ball.levelSpeed[blockThatCollide[0]];
      }
    }

    if (game.playerLives < 0) {
      finishGame('GAME OVER');
    }
    if (game.blocksDestroyed >= 45) {
      finishGame('YOU WIN');
    }
  }

  ctx.font = '25px Rajdhani';
  ctx.fillStyle = 'white';
  ctx.fillText(game.playerLives + 1, 20, HEIGHT - 20);
  ctx.fillText(game.gamePoints, WIDTH - 50, HEIGHT - 20);
}

document.addEventListener('keydown', controlKeydown);
canvas.addEventListener('mousemove', (event) => {
  if (game) {
    game.tab.x = event.offsetX - 75;
  }
});
