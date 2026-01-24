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
}
