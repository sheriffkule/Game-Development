function generateBlocks(level, ctx) {
  let blocksArray = [];

  let colors = {
    0: 'red',
    1: 'yellow',
    2: 'orange',
    3: 'green',
    4: 'blue',
  };

  for (let x = 0; x < 9; x++) {
    blocksArray.push(new Block(10 + x * 87.5, level * 45 + 10, 80, 35, colors[level], level, ctx));
  }
  return blocksArray;
}
