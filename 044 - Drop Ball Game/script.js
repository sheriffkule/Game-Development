let character = document.getElementById('character');
let game = document.getElementById('game');
let interval;
let both = 0;
let counter = 0;
let currentBlocks = [];
let score = document.getElementById('score');
let points = 0;
let scoredBlocks = {};

function moveLeft() {
  let left = parseInt(window.getComputedStyle(character).getPropertyValue('left'));
  if (left > 0) character.style.left = left - 2 + 'px';
}

function moveRight() {
  let left = parseInt(window.getComputedStyle(character).getPropertyValue('left'));
  if (left < 380) character.style.left = left + 2 + 'px';
}

document.addEventListener('keydown', (e) => {
  if (both === 0) {
    both++;
    if (e.key === 'ArrowLeft') interval = setInterval(moveLeft, 1);
    if (e.key === 'ArrowRight') interval = setInterval(moveRight, 1);
  }
});

document.addEventListener('keyup', (e) => {
  clearInterval(interval);
  both = 0;
});

let blocks = setInterval(function () {
  let blockLast = document.getElementById('block' + (counter - 1));
  let holeLast = document.getElementById('hole' + (counter - 1));
  let blockLastTop = 0;
  let holeLastTop = 0;
  if (counter > 0 && blockLast && holeLast) {
    blockLastTop = parseInt(window.getComputedStyle(blockLast).getPropertyValue('top'));
    holeLastTop = parseInt(window.getComputedStyle(holeLast).getPropertyValue('top'));
  }

  if (blockLastTop < 400 || counter === 0) {
    let block = document.createElement('div');
    let hole = document.createElement('div');
    block.setAttribute('class', 'block');
    hole.setAttribute('class', 'hole');
    block.setAttribute('id', 'block' + counter);
    hole.setAttribute('id', 'hole' + counter);
    block.style.top = (blockLastTop + 100) + 'px';
    hole.style.top = (holeLastTop + 100) + 'px';
    let random = Math.floor(Math.random() * 360);
    hole.style.left = random + 'px';
    game.appendChild(block);
    game.appendChild(hole);
    currentBlocks.push(counter);
    counter++;
  }

  let characterTop = parseInt(window.getComputedStyle(character).getPropertyValue('top'));
  let characterLeft = parseInt(window.getComputedStyle(character).getPropertyValue('left'));
  let drop = 0;

  if (characterTop <= 0) {
    alert('Game Over. Score: ' + (counter - 9));
    clearInterval(blocks);
    location.reload();
  }

  for (let i = 0; i < currentBlocks.length; i++) {
    let current = currentBlocks[i];
    let iBlock = document.getElementById('block' + current);
    let iHole = document.getElementById('hole' + current);
    let iBlockTop = parseFloat(window.getComputedStyle(iBlock).getPropertyValue('top'));
    let iHoleLeft = parseFloat(window.getComputedStyle(iHole).getPropertyValue('left'));
    iBlock.style.top = iBlockTop - 0.5 + 'px';
    iHole.style.top = iBlockTop - 0.5 + 'px';

    if (iBlockTop < -20) {
      currentBlocks.shift();
      iBlock.remove();
      iHole.remove();
    }

    // Score logic: block passes character
    if (!scoredBlocks[current] && iBlockTop < characterTop) {
      points++;
      score.textContent = points;
      scoredBlocks[current] = true;
    }

    if (iBlockTop - 20 < characterTop && iBlockTop > characterTop) {
      drop++;
      if (iHoleLeft <= characterLeft && iHoleLeft + 20 >= characterLeft) drop = 0;
    }
  }

  if (drop === 0) {
    if (characterTop < 480) character.style.top = characterTop + 2 + 'px';
  } else {
    character.style.top = characterTop - 0.5 + 'px';
  }
}, 1);
