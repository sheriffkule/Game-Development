let keysDown = {};
window.addEventListener(
  'keydown',
  function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    keysDown[e.code] = true;
  },
  { passive: false },
);

window.addEventListener(
  'keyup',
  function (e) {
    delete keysDown[e.code];
  },
  false,
);

addEventListener(
  'click',
  function (e) {
    restartGame(e);
  },
  false,
);

let keysUpdate = function () {
  let blockHit;
  if (!gameOver) {
    checkPowerUps(player1);
    checkPowerUps(player2);

    if ('Space' in keysDown) plantBomb(player1);
    if ('Enter' in keysDown) plantBomb(player2);

    if ('ArrowLeft' in keysDown) movePlayerLeft(player2);
    if ('ArrowRight' in keysDown) movePlayerRight(player2);
    if ('ArrowUp' in keysDown) movePlayerUp(player2);
    if ('ArrowDown' in keysDown) movePlayerDown(player2);

    if ('KeyA' in keysDown) movePlayerLeft(player1);
    if ('KeyD' in keysDown) movePlayerRight(player1);
    if ('KeyW' in keysDown) movePlayerUp(player1);
    if ('KeyS' in keysDown) movePlayerDown(player1);
  }

  function movePlayerUp(player, offset = 0) {
    let playerTest = { x: player.x, y: player.y - player.speed, w: player.w, h: player.h };
    if (player.y > 0 && !(blockHit = checkHitWithBlock(playerTest))) {
      if (playerOnBomb(player, playerTest)) {
        player.y -= player.speed - offset;
        checkPowerUps(player);
      }
    }
  }

  function movePlayerDown(player, offset = 0) {
    let playerTest = { x: player.x, y: player.y + player.speed, w: player.w, h: player.h };
    if (player.y < gameHeight - player.h && !(blockHit = checkHitWithBlock(playerTest))) {
      if (playerOnBomb(player, playerTest)) {
        player.y += player.speed - offset;
        checkPowerUps(player);
      }
    }
  }

  function movePlayerLeft(player, offset = 0) {
    let playerTest = { x: player.x - player.speed, y: player.y, w: player.w, h: player.h };
    if (offset == 0) player.image = player.imageLeft;
    if (player.x > 0 && !(blockHit = checkHitWithBlock(playerTest))) {
      if (playerOnBomb(player, playerTest)) {
        player.x -= player.speed - offset;
        checkPowerUps(player);
      }
    }
  }

  function movePlayerRight(player, offset = 0) {
    let playerTest = { x: player.x + player.speed, y: player.y, w: player.w, h: player.h };
    if (offset == 0) player.image = player.imageRight;
    if (player.x < gameWidth - player.w && !(blockHit = checkHitWithBlock(playerTest))) {
      if (playerOnBomb(player, playerTest)) {
        player.x += player.speed - offset;
        checkPowerUps(player);
      }
    }
  }

  function plantBomb(player) {
    if (player.availableBombs > 0 && !checkHitWithBomb(player)) {
      --player.availableBombs;

      if (player.availableBombs === 0) {
        const otherPlayer = player === player1 ? player2 : player1;
        win(otherPlayer);
      }

      const newBomb = {
        image: bomb.image,
        x: Math.round(player.x / blockSize) * blockSize,
        y: Math.round(player.y / blockSize) * blockSize,
        w: bomb.w,
        h: bomb.h,
      };
      bombArray.push(newBomb);
      player.onBomb = newBomb;
      let plantSound = new Audio(plantUrl);
      plantSound.play();
      plantSound.volume = 0.4;
      setTimeout(function () {
        bombExplode(newBomb, player);
      }, 3000);
    }
  }
};
