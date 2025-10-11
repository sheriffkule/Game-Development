function animate() {
  ctx3.clearRect(0, 0, canvas.width, canvas.height);
  frogger.draw();
  frogger.update();
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
