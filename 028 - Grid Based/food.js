const Food = {
  x: Math.floor(Math.random() * COLUMNS),
  y: Math.floor(Math.random() * ROWS),
  image: document.getElementById('magic_berry'),
  draw(context) {
    // context.fillStyle = 'blue';
    // context.fillRect(this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    context.drawImage(this.image, this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  },
  reset() {
    this.x = Math.floor(Math.random() * COLUMNS);
    this.y = Math.floor(Math.random() * ROWS);
  },
};
