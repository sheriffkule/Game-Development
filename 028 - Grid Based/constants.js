const CELL_SIZE = 55;
const COLUMNS = 10;
const ROWS = 12;
const GAME = {
  width: COLUMNS * CELL_SIZE,
  height: ROWS * CELL_SIZE,
  gameOver: false,
  loop: 0,
};

function resetGame() {
  GAME.gameOver = false;
  Snake.reset();
  Food.reset();
}
