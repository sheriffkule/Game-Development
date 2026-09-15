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
