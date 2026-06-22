import { PLAYERS, STATE } from './constants.js';
import { UI } from './UI.js';

// Define the custom turn order
const TURN_ORDER = [0, 2, 1, 3];

// Dice roll elements and function
const dice = document.querySelector('.dice');
const rollBtn = document.querySelector('.roll');
const resultDisplay = document.querySelector('.result');

const randomDice = () => {
  const random = Math.floor(Math.random() * 6) + 1;
  rollDice(random);
  return random;
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
    resultDisplay.textContent = `Result: ${random}`;
  }, 1050);
};

export class Ludo {
  currentPositions = {
    P1: [],
    P2: [],
    P3: [],
    P4: [],
  };

  _diceValue;
  get diceValue() {
    return this._diceValue;
  }
  set diceValue(value) {
    this._diceValue = value;
    UI.setDiceValue;
  }

  _turn;
  get turn() {
    return this._turn;
  }
  set turn(value) {
    this._turn = value;
    UI.setTurn(value);
  }

  _state;
  get state() {
    return this._state;
  }
  set state(value) {
    this._state = value;

    if (value === STATE.DICE_NOT_ROLLED) {
      UI.enableDice();
      UI.unhighlightPieces();
    } else {
      UI.disableDice();
    }
  }

  constructor() {
    console.log('Hello World! Lets play Ludo!');

    // Initialize the turn index to -1, so the first call to incrementTurn sets it to the first player
    this.turnIndex = -1;
    this.incrementTurn();
    this.listenRollButtonClick();
    this.listenResetClick();
    this.listenPieceClick();

    this.resetGame();
  }

  listenRollButtonClick() {
    rollBtn.addEventListener('click', this.onDiceClick.bind(this))
  }

  onDiceClick() {
    console.log('dice clicked!');
    this.diceValue = randomDice()
    this.state = STATE.DICE_ROLLED
    this.checkForEligiblePieces()
  }

  checkForEligiblePieces() {
    const player = PLAYERS[this.turn]
    const eligiblePieces = this.getEligiblePieces(player)
    if (eligiblePieces.length) {
        // Highlight the pieces
        UI.highlightPieces(player, eligiblePieces)
    } else {
        this.incrementTurn()
    }
  }

  incrementTurn() {
    // Increment the turn index and follow the custom turn order
    this.turnIndex = (this.turnIndex + 1) % TURN_ORDER.length
    this.turn = TURN_ORDER[this.turnIndex]
    this.state = STATE.DICE_NOT_ROLLED
  }
}
