function animate() {
  ctx3.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.drawImage(background_lvl2, 0, 0, canvas.width, canvas.height)
  frogger.draw();
  frogger.update();
  // handleObstacles();
  ctx4.drawImage(grass, 0, 0, canvas.width, canvas.height)
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
});

function scored() {
  score++;
  gameSpeed += 0.05;
  frogger.x = canvas.width / 2 - frogger.width / 2;
  frogger.y = canvas.height - frogger.width - 40;
}
