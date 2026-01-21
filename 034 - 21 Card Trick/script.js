const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const grid = document.getElementById('cardGrid');
const res = document.getElementById('result');
const restartBtn = document.getElementById('restart');
const colBtns = [
  document.getElementById('col1'),
  document.getElementById('col2'),
  document.getElementById('col3'),
];

let deck = [];
let cards = [];
let round = 0;
let busy = false;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function newDeck() {
  deck = [];
  for (const s of suits) for (const v of values) deck.push(v + s);
  shuffle(deck);
  cards = deck.slice(0, 21);
  round = 0;
  res.textContent = '';
  restartBtn.style.display = 'none';
  enableControls(true);
  render();
}

function render() {
  grid.innerHTML = '';
  cards.forEach((card, i) => {
    const cell = document.createElement('div');
    cell.className = 'card';

    const inner = document.createElement('div');
    inner.className = 'inner';
    // Flip animation
    setTimeout(() => inner.classList.add('flipped'), 30 + i * 20);
    setTimeout(() => inner.classList.remove('flipped'), 400 + i * 20);

    const front = document.createElement('div');
    front.className = 'face front';
    front.textContent = card;

    const back = document.createElement('div');
    back.className = 'face back';
    back.textContent = '🎴';

    inner.appendChild(front);
    inner.appendChild(back);
    cell.appendChild(inner);
    grid.appendChild(cell);
  });
}

function chosePile(pileIndex) {
  if (busy) return;
  busy = true;
  enableControls(false);
  round++;

  const cardsEls = [...grid.children];
  const colEls = cardsEls.filter((_, i) => i % 3 === pileIndex);
  colEls.forEach((c) => c.querySelector('.inner').classList.add('highlight'));

  const piles = [[], [], []];
  for (let i = 0; i < cards.length; i++) {
    piles[i % 3].push(cards[i]);
  }

  setTimeout(() => {
    if (pileIndex === 0) cards = [...piles[1], ...piles[0], ...piles[2]];
    else if (pileIndex === 1) cards = [...piles[0], ...piles[1], ...piles[2]];
    else cards = [...piles[2], ...piles[0], ...piles[1]];

    render();
    busy = false;
    enableControls(true);

    if (round === 3) {
      setTimeout(() => {
        res.textContent = '✨ Your card is: ' + cards[10] + ' ✨';
        restartBtn.style.display = 'inline-block';
      }, 500);
    }
  }, 1000);
}

function enableControls(on) {
  colBtns.forEach((b) => (b.disabled = !on));
}

colBtns[0].addEventListener('click', () => chosePile(0));
colBtns[1].addEventListener('click', () => chosePile(1));
colBtns[2].addEventListener('click', () => chosePile(2));
restartBtn.addEventListener('click', newDeck);

newDeck();
