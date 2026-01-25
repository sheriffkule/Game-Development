function generateBlocks(level, ctx) {
  let blocksArray = [];

  let colors = {
    0: 'red',
    1: 'yellow',
    2: 'orange',
    3: 'green',
    4: 'blue',
  };

  for (let x = 0; x < 9; x++) {
    blocksArray.push(new Block(10 + x * 87.5, level * 45 + 10, 80, 35, colors[level], level, ctx));
  }
  return blocksArray;
}

function detectCollision(ball, obj2) {
  if (ball.x > obj2.x && ball.x < obj2.x + obj2.width) {
    if (ball.y > obj2.y && ball.y < obj2.y + obj2.height) {
      game.padHitAudio.sound.play();
      return 'tabCollide';
    }
  }

  if (ball.x > WIDTH || ball.x < 0) {
    game.blockHitAudio.sound.play();
    return 'wallCollide';
  }
  if (ball.y < 0) {
    game.blockHitAudio.sound.play();
  }

  if (ball.y > HEIGHT + 10) {
    ball.ballOver();
  }
  return false;
}

function detectBlockCollision(ball, blocksArray) {
  for (let i = 0; i < blocksArray.length; i++) {
    for (let j = 0; j < blocksArray[i].length; j++) {
      let block = blocksArray[i][j];

      if (ball.x > block.x && ball.x < block.x + block.width) {
        if (ball.y > block.y && ball.y < block.y + block.height) {
          game.blockHitAudio.play();
          game.blocksDestroyed++;

          return [i, j];
        }
      }
    }
  }
  return false;
}
