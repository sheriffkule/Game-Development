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
    collectSound.volume = 0.5;

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
    if (!currentBomb) return;
    explosion(currentBomb, player);
  }
};

let drawHud = function () {
  ctx.font = 'bold 32px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  ctx.fillText(`P1 Score: ${player1.score} | Bombs: ${player1.availableBombs}`, 20, 14);
  ctx.fillText(`P2 Score: ${player2.score} | Bombs: ${player2.availableBombs}`, gameWidth - 400, 14);
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
    if (!bomb || !player) return;
    if (!gameOver) {
      if (iteration == 0) {
        let newExplosion = {
          image: explosionImage,
          x: bomb.x,
          y: bomb.y,
          w: blockSize,
          h: blockSize,
          owner: player,
        };
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
                  owner: player,
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
                  owner: player,
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
                  owner: player,
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
                  owner: player,
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
          explosion(bomb, player, iteration + 1, up, down, left, right, createdBombs);
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
    if (explosion.owner) {
      explosion.owner.score += 10;
    }
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
  if (gameOver) return;

  song.play();
  song.volume = 0.3;

  if (player === player1) {
    player1.score += 1;
  } else if (player === player2) {
    player2.score += 1;
  }

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

let checkHitWithBlock = function (a) {
  let result = false;
  result = checkHitWithStaticBlock(a);
  if (!result) {
    result = checkHitWithNonStBlock(a);
  }
  return result;
};

let checkBombMovement = function (a) {
  let result = false;
  result = checkHitWithBomb(a);

  return result;
};

let checkHitWithBomb = function (a) {
  let result = false;
  for (let i = 0; i < bombArray.length; i++) {
    if (hitTest(bombArray[i], a)) {
      return bombArray[i];
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
        ((i * blockSize > blockSize ||
          (j * blockSize > blockSize && j * blockSize < gameHeight - blockSize * 2)) &&
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

let drawWinner = function () {
  let winImage;
  switch (winner) {
    case player2:
      winImage = player2WinImage;
      break;
    case player1:
      winImage = player1WinImage;
      break;
  }

  if (!winImage) return;

  const panelX = gameWidth / 5;
  const panelY = gameHeight / 5;
  const panelW = (gameWidth / 5) * 3;
  const panelH = (gameHeight /4) * 3;

  const pulse = 1 + Math.sin(Date.now() / 140) * 0.1;

  ctx.fillStyle = 'green';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.drawImage(
    winImage,
    gameWidth / 2 - (winImageSize.w * pulse) / 2,
    gameHeight / 2.8 - (winImageSize.h * pulse) / 2,
    winImageSize.w * pulse,
    winImageSize.h * pulse,
  );

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText(`${winner.name} Wins!`, gameWidth / 2, panelY + panelH - 100);
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(`Score: ${winner.score}`, gameWidth / 2, panelY + panelH - 48);

  ctx.drawImage(restartImage, restartImageSize.x, restartImageSize.y, restartImageSize.w, restartImageSize.h);
};

let render = function () {
  ctx.drawImage(bgImage, 0, 0);

  drawStaticBlock();
  drawPowerUps();
  drawNonStaticBlock();
  drawBombs();
  drawPlayers();
  drawExplosions();

  if (gameOver) {
    drawWinner();
  }

  drawHud();
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
  requestAnimationFrame(main);
}
