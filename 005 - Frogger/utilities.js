/** @type {HTMLCanvasElement} */

function animate() {
  ctx1.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  ctx3.clearRect(0, 0, canvas.width, canvas.height);
  ctx4.clearRect(0, 0, canvas.width, canvas.height);
  ctx5.clearRect(0, 0, canvas.width, canvas.height);

  handleRipples();
  ctx2.drawImage(background_lvl2, 0, 0, canvas.width, canvas.height);
  handleParticles();
  frogger.draw();
  frogger.update();
  
  handleScoreBoard();
  handleObstacles();
  ctx4.drawImage(grass, 0, 0, canvas.width, canvas.height);
  frame++;
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('keydown', function (e) {
  keys = [];
  keys[e.key] = true;

  if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
    frogger.jump();
  }
});

window.addEventListener('keyup', function (e) {
  delete keys[e.key];
  frogger.moving = false;
  frogger.frameX = 0;
});

function scored() {
  score++;
  gameSpeed += 0.05;
  frogger.x = canvas.width / 2 - frogger.width / 2;
  frogger.y = canvas.height - frogger.width - 40;
}

function handleScoreBoard() {
  ctx4.fillStyle = 'black';
  ctx4.strokeStyle = 'black';
  ctx4.font = '18px Verdana';
  ctx4.strokeText('Score', 265, 18);
  ctx4.font = '60px Verdana';
  ctx4.fillText(score, 270, 65);
  ctx4.font = '18px Verdana';
  ctx4.strokeText('Collisions: ' + collisionCount, 10, 175);
  ctx4.strokeText('Game Speed: ' + gameSpeed.toFixed(1), 10, 195);
}

// collision detection between two rectangles
function collision(first, second) {
  return !(
    first.x > second.x + second.width ||
    first.x + first.width < second.x ||
    first.y > second.y + second.height ||
    first.y + first.height < second.y
  );
}

function resetGame() {
  frogger.x = canvas.width / 2 - frogger.width / 2;
  frogger.y = canvas.height - frogger.width - 40;
  score = 0;
  collisionCount++;
  gameSpeed = 1;
}
