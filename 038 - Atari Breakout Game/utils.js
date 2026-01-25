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
    return 'topCollide';
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
          game.blockHitAudio.sound.play();
          game.blocksDestroyed++;

          return [i, j];
        }
      }
    }
  }
  return false;
}

function finishGame(message) {
  clearInterval(game.timerId);
  
  // Draw semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  canvasTextScreen.style.display = 'block';
  document.getElementById('topTitle').innerText = message;
  document.getElementById('centerSpan').innerText = game.gamePoints;
  document.getElementById('bottomMessage').innerText = 'PRESS ENTER TO PLAY AGAIN';
  game.canRestart = true;
}

class Sound {
  constructor(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';
    this.sound.volume = 0.5;
    document.body.appendChild(this.sound);
  }

  play() {
    this.sound.play();
  }
}

function muteSound() {
  let audios = document.querySelectorAll('audio');
  for (let i = 0; i < audios.length; i++) {
    if (muteFlag) {
      audios[i].muted = false;
      document.getElementById('soundImg').src = 'assets/unmute.png';
    } else {
      audios[i].muted = true;
      document.getElementById('soundImg').src = 'assets/mute.png';
    }
  }
  muteFlag = !muteFlag;
}

function showInfo() {
  if (infoFlag) {
    document.getElementById('infoDiv').style.display = 'none';
  } else {
    document.getElementById('infoDiv').style.display = 'flex';
  }
  infoFlag = !infoFlag;
}
