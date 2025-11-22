window.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowUp') Snake.moveUp();
  else if (event.key === 'ArrowDown') Snake.moveDown();
  else if (event.key === 'ArrowLeft') Snake.moveLeft();
  else if (event.key === 'ArrowRight') Snake.moveRight();
});

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = GAME.width;
  canvas.height = GAME.height;
  ctx.font = '18px "Press Start 2P"';
  ctx.textBaseline = 'top';

  canvas.addEventListener('click', () => {
    if (GAME.gameOver) {
      resetGame();
      GAME.loop = setInterval(animate, 250);
    }
  });

  resetGame();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!GAME.gameOver) {
      Snake.draw(ctx);
      Food.draw(ctx);
      Snake.update();
    }

    if (GAME.gameOver) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.font = '40px "Press Start 2P"';
      ctx.fillText('GAME OVER!', GAME.width * 0.5, GAME.height * 0.4, GAME.width * 0.95);
      ctx.font = '18px "Press Start 2P"';
      ctx.fillText('Click here to restart!!', GAME.width * 0.5, GAME.height * 0.4 + 60, GAME.width * 0.95);
      clearInterval(GAME.loop);
    }
  }

  GAME.loop = setInterval(animate, 250);
});
