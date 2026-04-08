const colors = ['Yellow', 'White', 'Green', 'Blue', 'Red', 'Pink'];
const wheel = document.getElementById('wheel');
const highlight = document.getElementById('highlight');
const pointer = document.getElementById('pointer');
const spinBtn = document.getElementById('spinBtn');
const restartBtn = document.getElementById('restartBtn');

let balance = 6000;
let bets = {};
const sliceAngle = 360 / colors.length;
let currentRotation = 0;

function updateUI() {
  document.getElementById('balance').textContent = `Balance: ${balance}`;
  const ent = Object.entries(bets);
  document.getElementById('betsDisplay').textContent = ent.length
    ? ent.map((e) => `${e[0]} $${e[1]}`).join(' | ')
    : 'No bets placed';
  document.getElementById('revertBtn').style.display = ent.length ? 'inline-block' : 'none';
}

function placeBet(color) {
  const amt = Number(document.getElementById('betAmount').value) || 0;
  if (amt <= 0) return alert('Enter a valid bet amount!');
  if (balance < amt) return alert('Insufficient balance!');
  balance -= amt;
  bets[color] = (bets[color] || 0) + amt;
  updateUI();
}

function revertBets() {
  for (let c in bets) balance += bets[c];
  bets = {};
  updateUI();
}

function computeExtraDegreesForSliceCenter(currentRotDeg, sliceIndex, sliceDeg, spins = 6) {
  const centerAngle = sliceIndex * sliceDeg + sliceDeg / 2;
  let extra = (((-centerAngle - currentRotDeg) % 360) + 360) % 360;
  return spins * 360 + extra;
}

function spinWheel() {
  if (Object.keys(bets).length === 0) return alert('Place a bet first!');
  const randomSlice = Math.floor(Math.random() * colors.length);
  const extra = computeExtraDegreesForSliceCenter(currentRotation, randomSlice, sliceAngle, 6);
  currentRotation += extra;
  wheel.style.transform = `rotate(${currentRotation}deg)`;
  highlight.style.display = 'none';

  setTimeout(() => {
    const winnerIndex = randomSlice;
    const winningColor = colors[winnerIndex];

    pointer.classList.add('shake');
    setTimeout(() => pointer.classList.remove('shake'), 520);

    let popupTitle = 'Result';
    let popupMessage = `The wheel landed on ${winningColor}!`;

    if (bets[winningColor]) {
      const multiplier = Math.random() < 0.5 ? 2 : 3;
      const won = bets[winningColor] * multiplier;
      balance += won;
      popupTitle = 'Congratulations! You Won!';
      popupMessage += ` You had a bet on $${winningColor}. Multiplier x${multiplier}. You won $${won}!`;

      highlight.style.background = `conic-gradient(${winningColor.toLowerCase()}80 0deg ${sliceAngle}deg, transparent ${sliceAngle}deg 360deg)`;
      highlight.style.display = 'block';
      setTimeout(() => (highlight.style.display = 'none'), 3000);
    } else {
      popupMessage += ' You did not win this round.';
      if (balance <= 0) {
        balance = 0;
        popupMessage += ' You are out of money!';
        spinBtn.disabled = true;
        restartBtn.style.display = 'inline-block';
      }
    }

    showPopup(popupTitle, popupMessage);
    bets = {};
    updateUI();
  }, 5200);
}

function showPopup(title, message) {
  document.getElementById('poputTitle').innerHTML = title;
  document.getElementById('popupText').innerHTML = message;
  document.getElementById('popup').style.display = 'flex';
  setTimeout(() => {
    document.getElementById('popup').style.display = 'none';
  }, 3000);
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

restartBtn.addEventListener('click', () => {
  balance = 6000;
  bets = {};
  currentRotation = 0;
  wheel.style.transform = 'rotate(0deg)';
  spinBtn.disabled = false;
  restartBtn.style.display = 'none';
  updateUI();
  alert('Game Restarted! Your balance has been reset to $6000.');
});

// Attach event listeners for spin and revert
spinBtn.addEventListener('click', spinWheel);

// Expose functions for HTML inline event handlers
window.placeBet = placeBet;
window.revertBets = revertBets;
window.closePopup = closePopup;
window.spinWheel = spinWheel;

updateUI();
