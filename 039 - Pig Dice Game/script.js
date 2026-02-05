'use strict';
const player0El = document.querySelector('.player-0');
const player1El = document.querySelector('.player-1');
const score0El = document.getElementById('score-0');
const score1El = document.getElementById('score-1');
const current0El = document.getElementById('current-0');
const current1El = document.getElementById('current-1');
const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn-new');
const btnRoll = document.querySelector('.btn-roll');
const btnHold = document.querySelector('.btn-hold');

score0El.textContent = 0;
score1El.textContent = 0;

diceEl.classList.add('hidden');
let currentScore = 0;
const scores = [0, 0];
let activePlayer = 0;
let playing = true;

const switchPlayer = function () {
  currentScore = 0;
  document.getElementById(`current-${activePlayer}`).textContent = currentScore;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player-active');
  player1El.classList.toggle('player-active');
};

btnRoll.addEventListener('click', function () {
  if (playing) {
    diceEl.classList.remove('hidden');
    const dice = Math.trunc(Math.random() * 6) + 1;

    diceEl.src = `dice-${dice}.png`;

    if (dice !== 1) {
      currentScore += dice;
      document.getElementById(`current-${activePlayer}`).textContent = currentScore;
    } else {
      switchPlayer();
    }
  }
});

btnHold.addEventListener('click', function () {
  if (playing) {
    scores[activePlayer] += currentScore;
    document.getElementById(`score-${activePlayer}`).textContent = scores[activePlayer];

    if (scores[activePlayer] >= 50) {
      playing = false;
      diceEl.classList.add('hidden');
      
      document.querySelector(`.player-${activePlayer}`).classList.add('player-winner');
      document.getElementById(`score-${activePlayer}`).textContent = 'Win!';
      const otherPlayer = activePlayer === 0 ? 1 : 0;
      document.getElementById(`score-${otherPlayer}`).textContent = 'Lost!';
      
      player0El.classList.remove('player-active');
      player1El.classList.remove('player-active');
    } else {
      switchPlayer();
    }
  }
});

btnNew.addEventListener('click', function () {
  playing = true;
  currentScore = 0;
  scores[0] = 0;
  scores[1] = 0;
  activePlayer = 0;

  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');

  player0El.classList.remove('player-winner');
  player1El.classList.remove('player-winner');

  player0El.classList.add('player-active');
  player1El.classList.remove('player-active');
});
