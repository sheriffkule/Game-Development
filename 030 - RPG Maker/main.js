import { Hero } from "./hero.js";
import { Input } from "./input.js";
import { World } from "./world.js";

export const TILE_SIZE = 32;
export const COLS = 15;
export const ROWS = 20;
const GAME_WIDTH = TILE_SIZE * COLS;
const GAME_HEIGHT = TILE_SIZE * ROWS;

window.addEventListener('load', function () {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  const world = new World()
  world.drawGrid(ctx)

  const hero = new Hero({
    position: {x: 2, y: 2}
  })
  hero.draw(ctx)

  const input = new Input();
});
