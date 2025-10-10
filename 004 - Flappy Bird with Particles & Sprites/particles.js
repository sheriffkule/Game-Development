/** @type {HTMLCanvasElement} */

const particlesArray = [];

class Particle {
  constructor() {
    this.x = bird.x;
    this.y = bird.y;
    this.size = Math.random() * 7 + 3;
    this.speedY = Math.random() * 1 - 0.5;
  }
}
