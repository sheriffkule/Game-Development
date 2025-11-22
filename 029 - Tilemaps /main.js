const gameWidth = 160;
const gameHeight = 160;
const gameTile = 32;
const rows = gameHeight / gameTile;
const columns = gameWidth / gameTile;

const level1 = [9, 9, 9, 9, 9, 1, 2, 2, 2, 3, 6, 7, 7, 7, 8, 6, 7, 7, 7, 8, 11, 12, 12, 12, 13];

const level2 = [
  24, 24, 25, 24, 25, 16, 12, 12, 12, 17, 8, 14, 14, 14, 6, 21, 2, 2, 2, 22, 19, 20, 19, 19, 19,
];

const level3 = [14, 6, 25, 25, 20, 14, 11, 17, 23, 25, 2, 3, 11, 12, 12, 19, 21, 2, 3, 14, 24, 19, 19, 8, 14];

function getTile(map, col, row) {
  return map[row * columns + col];
}

window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = gameWidth;
  canvas.height = gameHeight;
  console.log(ctx);

  // canvas settings
  ctx.imageSmoothingEnabled = false;
  const tileImage = document.getElementById('tilemap1simple');
  const imageTile = 32;
  const imageCols = tileImage.width / imageTile;

  let debug = false;
  let level = level1;

  function drawLevel() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const tile = getTile(level, col, row);
        ctx.drawImage(
          tileImage,
          ((tile - 1) * imageTile) % tileImage.width,
          Math.floor((tile - 1) / imageCols) * imageTile,
          imageTile,
          imageTile,
          col * gameTile,
          row * gameTile,
          gameTile,
          gameTile
        );
        if (debug) {
          ctx.strokeRect(col * gameTile, row * gameTile, gameTile, gameTile);
        }
      }
    }
  }
  drawLevel();

  // controls
  const debugButton = document.getElementById('debugButton');
  const level1Button = document.getElementById('level1button');
  const level2Button = document.getElementById('level2button');
  const level3Button = document.getElementById('level3button');

  debugButton.addEventListener('click', function () {
    debug = !debug;
    drawLevel();
  });

  level1Button.addEventListener('click', function () {
    level = level1;
    drawLevel();
  });

  level2Button.addEventListener('click', function () {
    level = level2;
    drawLevel();
  });

  level3Button.addEventListener('click', function () {
    level = level3;
    drawLevel();
  });
});
