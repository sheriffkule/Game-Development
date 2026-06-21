const elDiceOne = document.getElementById('dice1');
const elDiceTwo = document.getElementById('dice2');
const elDiceThree = document.getElementById('dice3');
const elComeOut = document.getElementById('roll');
const elHistoryList = document.getElementById('history-list');

// Array to match dice values to colors
let colorMap = ['#ff6b6b', '#4ecdc4', '#ffd166', '#06d6a0', '#118ab2', '#ff9f1c'];
let rollCount = 0;

elComeOut.onclick = function () {
  rollDice();
};

function rollDice() {
  // Disable button during rolling
  elComeOut.disabled = true;

  // Add rolling animation
  elDiceOne.classList.add('rolling');
  elDiceTwo.classList.add('rolling');
  elDiceThree.classList.add('rolling');

  // Generate random results after 3 seconds
  setTimeout(() => {
    let diceOne = Math.floor(Math.random() * 6 + 1);
    let diceTwo = Math.floor(Math.random() * 6 + 1);
    let diceThree = Math.floor(Math.random() * 6 + 1);

    // Update dice faces
    updateDice(elDiceOne, diceOne);
    updateDice(elDiceTwo, diceTwo);
    updateDice(elDiceThree, diceThree);

    // Remove rolling animation
    elDiceOne.classList.remove('rolling');
    elDiceTwo.classList.remove('rolling');
    elDiceThree.classList.remove('rolling');

    // Add the spin result to history
    addToHistory(diceOne, diceTwo, diceThree);

    // Re-enable button
    elComeOut.disabled = false;
  }, 3000);
}

function updateDice(diceElement, diceValue) {
  for (let i = 1; i <= 6; i++) {
    diceElement.classList.remove('show-' + i);
    if (diceValue === i) {
      diceElement.classList.add('show-' + i);
    }
  }
}

function addToHistory(diceOne, diceTwo, diceThree) {
  // Increment roll count
  rollCount++;

  // If there is no history hide
  if (rollCount > 0) {
    document.querySelector('.history').style.display = 'block';
  }

  // create a new history item
  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';

  // Add roll number
  const rollNumber = document.createElement('span');
  rollNumber.textContent = `Roll ${rollCount}`;
  historyItem.appendChild(rollNumber);

  // Add color boxes for each dice
  let colors = [diceOne, diceTwo, diceThree];
  colors.forEach(function (diceValue) {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = colorMap[diceValue - 1];
    historyItem.appendChild(colorBox);
  });

  // Prepend the new item to the history list (most recent first)
  elHistoryList.prepend(historyItem);

  // Scroll to the top of the history list
  elHistoryList.scrollTop = 0;
}
