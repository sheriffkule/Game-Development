let restartGame = function (e) {
  if (gameOver) {
    const rect = canvas.getBoundingClientRect();
    const click = { x: e.clientX - rect.left, y: e.clientY - rect.top, w: 2, h: 2 };
    if (hitTest(restartImageSize, click)) {
      bombArray = [];
      explosionArray = [];
      staticBlockArray = [];
      nonStBlockArray = [];
      powerUpArray = [];
      gameOver = false;
      winner = null;
      song.pause();
      song.currentTime = 0;
      restartGameInit();
    }
  }
};

function restartGameInit() {
  initPlayer();
  initEnvironment();
  initBlocks();
  initPowerUps();
}

let checkPowerUps = function (player) {
  let result = false;
  for (let i = 0; i < powerUpArray.length; i++) {
    if (hitTest(powerUpArray[i], player)) {
      result = powerUpArray[i];
    }
  }

  if (result) {
    powerUpArray.splice(powerUpArray.indexOf(result), 1);

    let collectSound = new Audio(collectUrl);
    collectSound.play();

    switch (result.type) {
      case 'bombAdd':
        ++player.availableBombs;
        break;
      case 'bombUp':
        ++player.explosionSize;
        break;
      case 'speedUp':
        player.speed += 1;
        break;
    }
  }
  return result;
};

let playerOnBomb = function (player, playerTest) {
  let result = true;
  if (player.onBomb !== null) {
    if (!hitTest(player, player.onBomb)) {
      player.onBomb = null;
    }
    let diffBomb = checkHitWithBomb(playerTest);
    if (diffBomb && diffBomb != player.onBomb) {
      result = false;
    }
  } else {
    result = !checkHitWithBomb(playerTest);
  }
  return result;
};

let bombExplode = function (bomb, player) {
  if (!gameOver) {
    let currentBomb = bombArray.shift();
    ++player.availableBombs;
    explosion(currentBomb, player);
  }
};

let explosion = function (
  bomb,
  player,
  iteration = 0,
  up = true,
  down = true,
  left = true,
  right = true,
  createdBombs = [],
) {
  try {
    if (!gameOver) {
      if (iteration == 0) {
        let newExplosion = { image: explosionImage, x: bomb.x, y: bomb.y, w: blockSize, h: blockSize };
        explosionArray.push(newExplosion);
        createdBombs.push(newExplosion);
        checkHitWithPlayer(newExplosion);
      } else {
        let newExplosion;
        for (let i = 0; i < 4; i++) {
          let addExplosion = false;
          switch (i) {
            case 0:
              if (right) {
                newExplosion = {
                  image: explosionImage,
                  x: bomb.x + blockSize * iteration,
                  y: bomb.y,
                  w: blockSize,
                  h: blockSize,
                };
                if (checkHitWithStaticBlock(newExplosion)) {
                  right = false;
                } else {
                  addExplosion = true;
                  if (destroyBlocks(newExplosion)) {
                    right = false;
                  } else {
                    checkHitWithPlayer(newExplosion);
                  }
                }
              }
              break;
            case 1:
              if (left) {
                newExplosion = {
                  image: explosionImage,
                  x: bomb.x - blockSize * iteration,
                  y: bomb.y,
                  w: blockSize,
                  h: blockSize,
                };
                if (checkHitWithStaticBlock(newExplosion)) {
                  left = false;
                } else {
                  addExplosion = true;
                  if (destroyBlocks(newExplosion)) {
                    left = false;
                  } else {
                    checkHitWithPlayer(newExplosion);
                  }
                }
              }
              break;
            case 2:
              if (down) {
                newExplosion = {
                  image: explosionImage,
                  x: bomb.x,
                  y: bomb.y + blockSize * iteration,
                  w: blockSize,
                  h: blockSize,
                };
                if (checkHitWithStaticBlock(newExplosion)) {
                  down = false;
                } else {
                  addExplosion = true;
                  if (destroyBlocks(newExplosion)) {
                    down = false;
                  } else {
                    checkHitWithPlayer(newExplosion);
                  }
                }
              }
              break;
            case 3:
              if (up) {
                newExplosion = {
                  image: explosionImage,
                  x: bomb.x,
                  y: bomb.y - blockSize * iteration,
                  w: blockSize,
                  h: blockSize,
                };
                if (checkHitWithStaticBlock(newExplosion)) {
                  up = false;
                } else {
                  addExplosion = true;
                  if (destroyBlocks(newExplosion)) {
                    up = false;
                  } else {
                    checkHitWithPlayer(newExplosion);
                  }
                }
              }
              break;
          }
          if (addExplosion) {
            if (!checkHitWithStaticBlock(newExplosion)) {
              explosionArray.push(newExplosion);
              createdBombs.push(newExplosion);
              let explosionSound = new Audio(explosionUrl);
              explosionSound.play();
              explosionSound.volume = 0.4;
            }
          }
        }
      }
      if (iteration < player.explosionSize) {
        setTimeout(() => {
          explosion(bomb, player, iteration++, up, down, left, right, createdBombs);
        }, 50);
      } else {
        setTimeout(() => {
          removeExplosion(createdBombs);
        }, 500);
      }
    }
  } catch (error) {
    console.error('Error', error);
  }
};

let removeExplosion = function (createdBombs) {
  if (!gameOver) {
    for (let i = 0; i < createdBombs.length; i++) {
      explosionArray.splice(explosionArray.indexOf(createdBombs[i]), 1);
    }
  }
};

let destroyBlocks = function (explosion) {
  let blockToDestroy = false;
  if ((blockToDestroy = checkHitWithNonStBlock(explosion))) {
    nonStBlockArray.splice(nonStBlockArray.indexOf(blockToDestroy), 1);
  }
  return blockToDestroy;
};

let checkHitWithPlayer = function (explosion) {
  if (hitTest(player1, explosion)) {
    win(player2);
  } else if (hitTest(player2, explosion)) {
    win(player1);
  }
};

let win = function (player) {
  song.play();
  song.volume = 0.3;

  gameOver = true;
  winner = player;
};

let hitTest = function (a, b) {
  if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
    return true;
  } else {
    return false;
  }
};

let checkHitWithStaticBlock = function (a) {
  let result = false;
  for (let i = 0; i < staticBlockArray.length; i++) {
    if (hitTest(staticBlockArray[i], a)) {
      return staticBlockArray[i];
    }
  }
  return result;
};

let checkHitWithNonStBlock = function (a) {
  let result = false;
  for (let i = 0; i < nonStBlockArray.length; i++) {
    if (hitTest(nonStBlockArray[i], a)) {
      return nonStBlockArray[i];
    }
  }
  return result;
};

let initEnvironment = function () {
  let k = 0;
  for (let j = 0; j < Math.floor(gameHeight / blockSize / 2); j++) {
    for (let i = 0; i < Math.floor(gameWidth / blockSize / 2); i++) {
      staticBlockArray[k++] = {
        image: staticBlockImage,
        x: i * (blockSize * 2) + blockSize,
        y: j * (blockSize * 2) + blockSize,
        w: blockSize,
        h: blockSize,
      };
    }
  }
};

let initBlocks = function () {
  let k = 0;
  for (let j = 0; j < gameHeight / blockSize; j++) {
    for (let i = 0; i < gameHeight / blockSize; i++) {
      if (
        ((i * blockSize > blockSize || (j * blockSize && j * blockSize < gameHeight - blockSize * 2)) &&
          i * blockSize < gameHeight - blockSize * 2) ||
        (j * blockSize > blockSize && j * blockSize < gameHeight - blockSize * 2)
      ) {
        let curX = i * blockSize;
        let curY = j * blockSize;
        let newStBlock = { image: nonStBlockImage, x: curX, y: curY, w: blockSize, h: blockSize };

        if (!checkHitWithStaticBlock(newStBlock)) {
          nonStBlockArray[k++] = newStBlock;
        }
      }
    }
  }
};

let initPowerUps = function () {
  let k = 0;
  for (let j = 0; j < gameHeight / blockSize; j++) {
    for (let i = 0; i < gameHeight / blockSize; i++) {
      if (
        ((i * blockSize > blockSize || (j * blockSize && j * blockSize < gameHeight - blockSize * 2)) &&
          i * blockSize < gameHeight - blockSize * 2) ||
        (j * blockSize > blockSize && j * blockSize < gameHeight - blockSize * 2)
      ) {
        let curX = i * blockSize;
        let curY = j * blockSize;

        if (Math.floor(Math.random() * 3) == 1) {
          let newPowerUp;
          switch (Math.floor(Math.random() * 3)) {
            case 0:
              newPowerUp = {
                image: bombAddImage,
                x: curX,
                y: curY,
                w: blockSize,
                h: blockSize,
                type: 'bombAdd',
              };
              break;
            case 1:
              newPowerUp = {
                image: bombUpImage,
                x: curX,
                y: curY,
                w: blockSize,
                h: blockSize,
                type: 'bombUp',
              };
              break;
            case 2:
              newPowerUp = {
                image: speedUpImage,
                x: curX,
                y: curY,
                w: blockSize,
                h: blockSize,
                type: 'speedUp',
              };
              break;
          }
          if (!checkHitWithStaticBlock(newPowerUp)) {
            powerUpArray[k++] = newPowerUp;
          }
        }
      }
    }
  }
};

let drawPowerUps = function () {
  for (let i = 0; i < powerUpArray.length; i++) {
    ctx.drawImage(
      powerUpArray[i].image,
      powerUpArray[i].x,
      powerUpArray[i].y,
      powerUpArray[i].w,
      powerUpArray[i].h,
    );
  }
};

let drawStaticBlock = function () {
  for (let i = 0; i < staticBlockArray.length; i++) {
    ctx.drawImage(
      staticBlockArray[i].image,
      staticBlockArray[i].x,
      staticBlockArray[i].y,
      staticBlockArray[i].w,
      staticBlockArray[i].h,
    );
  }
};

let drawNonStaticBlock = function () {
  for (let i = 0; i < nonStBlockArray.length; i++) {
    ctx.drawImage(
      nonStBlockArray[i].image,
      nonStBlockArray[i].x,
      nonStBlockArray[i].y,
      nonStBlockArray[i].w,
      nonStBlockArray[i].h,
    );
  }
};

let drawBombs = function () {
  for (let i = 0; i < bombArray.length; i++) {
    ctx.drawImage(bombArray[i].image, bombArray[i].x, bombArray[i].y, bombArray[i].w, bombArray[i].h);
  }
};

let drawExplosions = function () {
  for (let i = 0; i < explosionArray.length; i++) {
    ctx.drawImage(
      explosionArray[i].image,
      explosionArray[i].x,
      explosionArray[i].y,
      explosionArray[i].w,
      explosionArray[i].h,
    );
  }
};

let drawPlayers = function () {
  ctx.drawImage(player1.image, player1.x, player1.y, player1.w, player1.h);
  ctx.drawImage(player2.image, player2.x, player2.y, player2.w, player2.h);
};

let render = function () {
  ctx.drawImage(bgImage, 0, 0);

  drawStaticBlock();
  drawPowerUps();
  drawNonStaticBlock();
  drawBombs();
  drawPlayers();
  drawExplosions();

  if (gameOver) drawWinner();
};

function main() {
  render();
  keysUpdate();
  requestAnimationFrame(main);
}

function startGame() {
  initPlayer();
  initEnvironment();
  initBlocks();
  initPowerUps();
  main();
}
