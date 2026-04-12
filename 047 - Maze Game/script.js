let mazeContainer = document.getElementById('maze-container');
let sizeInput = document.getElementById('size');
let generateButton = document.getElementById('generate');
let solveButton = document.getElementById('solve');

let size = parseInt(sizeInput.value);
let maze = generateMaze(size);
let playerPosition = { x: 0, y: 0 };
let previousPosition = { x: 0, y: 0 };
let visited = {};
let previousPositions = [];
let playerCanMove = true;

renderMaze(maze);
