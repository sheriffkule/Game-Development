const cards = [
  'AS',
  '2S',
  '3S',
  '4S',
  '5S',
  '6S',
  '7S',
  '8S',
  '9S',
  '10S',
  'JS',
  'QS',
  'KS',
  'AH',
  '2H',
  '3H',
  '4H',
  '5H',
  '6H',
  '7H',
  '8H',
];

let deck;
let round;
let selectedColumn;
let finished;

const board = document.getElementById('board');
const status = document.getElementById('status');
const reveal = document.getElementById('reveal');
const actionBtn = document.getElementById('actionBtn');

function startGame() {
  deck = [...cards];
  round = 1;
  selectedColumn = null;
  finished = false;
  reveal.textContent = '';
  actionBtn.textContent = 'Next';
  status.textContent = 'Round 1 of 3 - chose a column';
  render();
}

function render() {
  board.innerHTML = '';
  deck.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = card;
    div.onclick = () => selectColumn(i % 3);
    board.appendChild(div);
  });
}

function selectColumn(col) {
  if (finished) return;
  selectedColumn = col;
  status.textContent = `Column ${col + 1} selected - click Next`;
}

function nextStep() {
  if (finished) {
    startGame();
    return;
  }

  if (selectedColumn === null) {
    status.textContent = 'Select a column first';
    return;
  }

  const columns = [[], [], []];
  deck.forEach((card, i) => columns[i % 3].push(card));

  // Chosen column always goes to the middle
  deck = [
    ...columns[(selectedColumn + 1) % 3],
    ...columns[selectedColumn],
    ...columns[(selectedColumn + 2) % 3],
  ];

  selectedColumn = null;
  round++;

  if (round > 3) {
    board.innerHTML = '';
    reveal.textContent = `Your card is ${deck[10]}`;
    status.textContent = 'Magic complete';
    actionBtn.textContent = 'Restart';
    finished = true;
  } else {
    status.textContent = `Round ${round} of 3 = chose a column`;
    render();
  }
}

actionBtn.onclick = nextStep;
startGame();
