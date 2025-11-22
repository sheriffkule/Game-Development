import { COLS, ROWS, TILE_SIZE } from "./main.js";

export class World {
  constructor() {
    this.level1 = [];
  }
  drawGrid(ctx) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
