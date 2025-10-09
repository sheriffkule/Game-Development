/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const images = [];
images.player = new Image();
images.player.src = 'cuphead_overworld.png';
const characterActions = ['up', 'top right', 'right', 'down right', 'down', 'jump'];

const playerWidth = 103.0625;
const playerHeight = 113.125;
let playerFrameX = 3;
let playerFrameY = 3;
let playerX = 0;
let playerY = 0;
const playerSpeed = 6;

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH) {
  ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(
    images.player,
    playerWidth * playerFrameX,
    playerHeight * playerFrameY,
    playerWidth,
    playerHeight,
    playerX,
    playerY,
    playerWidth,
    playerHeight
  );

  if (playerFrameX < 13) playerFrameX++;
  else playerFrameX = 3;

  if (playerX < canvas.width) playerX += playerSpeed;
  else playerX = 0 - playerWidth;
}

window.onload = setInterval(animate, 1000 / 30);

window.addEventListener('resize', function () {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});
