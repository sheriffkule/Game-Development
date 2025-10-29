import InputHandler from './input.js';
import Player from './player.js';

window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const loading = document.getElementById('loading');
  loading.style.display = 'none';
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const player = new Player(canvas.width, canvas.height);
  player.draw(ctx);
  const input = new InputHandler();

  function animate() {
    console.log(input.lastKey);
    requestAnimationFrame(animate);
  }
  animate();
});
