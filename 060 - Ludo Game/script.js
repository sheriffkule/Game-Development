const dice = document.querySelector('.dice');
const rollBtn = document.querySelector('.roll');
const resultDisplay = document.querySelector('.result');

const randomDice = () => {
  const random = Math.floor(Math.random() * 6) + 1;
  rollDice(random);
};

const rollDice = (random) => {
  dice.style.animation = 'rolling 1s';

  setTimeout(() => {
    // Show the dice face based on the random number
    switch (random) {
      case 1:
        dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
        break;
      case 2:
        dice.style.transform = 'rotateX(-90deg) rotateY(0deg)';
        break;
      case 3:
        dice.style.transform = 'rotateX(0deg) rotateY(90deg)';
        break;
      case 4:
        dice.style.transform = 'rotateX(0deg) rotateY(-90deg)';
        break;
      case 5:
        dice.style.transform = 'rotateX(90deg) rotateY(0deg)';
        break;
      case 6:
        dice.style.transform = 'rotateX(180deg) rotateY(0deg)';
        break;
      default:
        break;
    }

    dice.style.animation = 'none'; // Stop animation after it completes

    // Display the result
    resultDisplay.textContent = `Result: ${random}`
  }, 1050);
};

// Event listener to the roll button
rollBtn.addEventListener('click', randomDice)
