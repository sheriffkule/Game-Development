let gameWidth = 880;
let gameHeight = 880;

let blockSize = 80;
let playerSize = 70;

let gameOver = false;
let winner;

let playerStartSpeed = 5;
let bombsOnStart = 12;
let startExplosionSize = 1;

/** @type {HTMLCanvasElement}  */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = gameWidth;
canvas.height = gameHeight;

let bgImage = new Image();
bgImage.src = 'images/background.png';

// Player 1
let player1;
let player2;

const initPlayer = function () {
  const player1ImageLeft = new Image();
  player1ImageLeft.src = 'images/player1Left.png';
  const player1ImageRight = new Image();
  player1ImageRight.src = 'images/player1Right.png';
  player1 = {
    name: 'Player 1',
    image: player1ImageRight,
    imageLeft: player1ImageLeft,
    imageRight: player1ImageRight,
    x: 0,
    y: gameHeight - playerSize,
    w: playerSize,
    h: playerSize,
    speed: playerStartSpeed,
    availableBombs: bombsOnStart,
    onBomb: null,
    explosionSize: startExplosionSize,
    score: 0,
  };

  // Player2
  const player2ImageLeft = new Image();
  player2ImageLeft.src = 'images/player2Left.png';
  const player2ImageRight = new Image();
  player2ImageRight.src = 'images/player2Right.png';
  player2 = {
    name: 'Player 2',
    image: player2ImageLeft,
    imageLeft: player2ImageLeft,
    imageRight: player2ImageRight,
    x: gameWidth - playerSize,
    y: 0,
    w: playerSize,
    h: playerSize,
    speed: playerStartSpeed,
    availableBombs: bombsOnStart,
    onBomb: null,
    explosionSize: startExplosionSize,
    score: 0,
  };
};

const staticBlockImage = new Image();
staticBlockImage.src = 'images/staticBlock.png';
let staticBlock = {
  image: staticBlockImage,
  x: 0,
  y: 0,
  w: blockSize,
  h: blockSize,
};
let staticBlockArray = [];

const nonStBlockImage = new Image();
nonStBlockImage.src = 'images/nonStBlock.png';
let nonStBlock = {
  image: nonStBlockImage,
  x: 0,
  y: 0,
  w: blockSize,
  h: blockSize,
};
let nonStBlockArray = [];

const bombImage = new Image();
bombImage.src = 'images/bomb.png';
let bomb = {
  image: bombImage,
  x: 0,
  y: 0,
  w: blockSize,
  h: blockSize,
};
bombArray = [];

const explosionImage = new Image();
explosionImage.src = 'images/explosion.png';
let explosionObj = {
  image: explosionImage,
  x: 0,
  y: 0,
  w: blockSize,
  h: blockSize,
};
let explosionArray = [];

const bombAddImage = new Image();
bombAddImage.src = 'images/bombAdd.png';
const bombUpImage = new Image();
bombUpImage.src = 'images/bombUp.png';
const speedUpImage = new Image();
speedUpImage.src = 'images/speedUp.png';
let powerUp = {
  image: bombAddImage,
  x: 0,
  y: 0,
  w: blockSize,
  h: blockSize,
  type: 'bombAdd',
};
let powerUpArray = [];

let winImageSize = { w: 228, h: 274 };
let restartImageSize = { w: 180, h: 180 };

const player1WinImage = new Image();
player1WinImage.src = 'images/player1Win.png';

const player2WinImage = new Image();
player2WinImage.src = 'images/player2Win.png';

const restartImage = new Image();
restartImage.src = 'images/restart.png';

restartImageSize.x = gameWidth / 2 - restartImageSize.w / 2;
restartImageSize.y = gameHeight / 2 + restartImageSize.h / 3;
restartImage.x = restartImageSize.x;
restartImage.y = restartImageSize.y;
restartImage.w = restartImageSize.w;
restartImage.h = restartImageSize.h;

const song = new Audio('sounds/endMusic.mp3');

explosionUrl = 'sounds/explosion.mp3';

plantUrl = 'sounds/plant.mp3';

collectUrl = 'sounds/collect.mp3';
