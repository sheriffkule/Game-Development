// Importing all boards
const blueBoard = document.getElementById('blue-board');
const greenBoard = document.getElementById('green-board');
const redBoard = document.getElementById('red-board');
const yellowBoard = document.getElementById('yellow-board');

// DOM Elements
const rollDiceButton = document.getElementById('rollDiceButton');
const rollDice = document.getElementById('rollDice');

// Initial variables
let playerTurns = []; // This will hold the players team color
let currentPlayerTurnIndex = 0;
let prevPlayerTurnIndex;
let currentPlayerTurnStatus = true; // True means the user has not yet player and false means played
let teamHasBonus = false;

let diceResult;
let pathArray = [
  'r1',
  'r2',
  'r3',
  'r4',
  'r5',
  'r6',
  'r7',
  'r8',
  'r9',
  'r10',
  'r11',
  'r12',
  'r13',
  'g1',
  'g2',
  'g3',
  'g4',
  'g5',
  'g6',
  'g7',
  'g8',
  'g9',
  'g10',
  'g11',
  'g12',
  'g13',
  'y1',
  'y2',
  'y3',
  'y4',
  'y5',
  'y6',
  'y7',
  'y8',
  'y9',
  'y10',
  'y11',
  'y12',
  'y13',
  'b1',
  'b2',
  'b3',
  'b4',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'b10',
  'b11',
  'b12',
  'b13',
];

let homePathEntries = {
  blue: ['bh1', 'bh2', 'bh3', 'bh4', 'bh5', 'bh6', 'home'],
  yellow: ['yh1', 'yh2', 'yh3', 'yh4', 'yh5', 'yh6', 'home'],
  red: ['rh1', 'rh2', 'rh3', 'rh4', 'rh5', 'rh6', 'home'],
  green: ['gh1', 'gh2', 'gh3', 'gh4', 'gh5', 'gh6', 'home'],
};

let safePaths = [
  'r1',
  'r9',
  'b1',
  'b9',
  'y1',
  'y9',
  'g1',
  'g9',
  ...homePathEntries.blue,
  ...homePathEntries.red,
  ...homePathEntries.yellow,
  ...homePathEntries.green,
];

let homePathArray = [
  ...homePathEntries.blue,
  ...homePathEntries.red,
  ...homePathEntries.yellow,
  ...homePathEntries.green,
];

// Setting player pieces class
class PlayerPiece {
  constructor(team, position, score, homePathEntry, playerId, gameEntry) {
    this.team = team;
    this.position = position;
    this.score = score;
    this.homePathEntry = homePathEntry;
    this.id = playerId;
    this.gameEntry = gameEntry;
    this.status = 0; // Initially it is zero means the piece is locked and 1 means it is unlocked
    this.initialPosition = position; // To return the piece to the board when killed
  }

  unlockPiece() {
    this.status = 1; // 1 means unlocked
    this.position = this.gameEntry;
    let element = document.querySelector(`[piece-id="${this.id}"]`);
    let toAppendDiv = document.getElementById(this.gameEntry);
    toAppendDiv.appendChild(element);
  }

  updatePosition(position) {
    this.position = position;
  }

  movePiece(array) {
    // Function to move the piece
    let filteredArray = array;

    moveElementSequentially(this.id, filteredArray);
    this.score += filteredArray.lenght;
  }

  // Function to return the piece to the locked position when killed
  sentToBoard() {}
}

// let numPvp = parseInt(prompt('Enter the number of players.'));
let numPvp = 4;

let playerPieces = []; // This will hold all pieces from all teams
let boardDetails = [
  { boardColor: 'blue', board: blueBoard, homeEntry: 'y13', gameEntry: 'b1' },
  { boardColor: 'green', board: greenBoard, homeEntry: 'r13', gameEntry: 'g1' },
  { boardColor: 'red', board: redBoard, homeEntry: 'b13', gameEntry: 'r1' },
  { boardColor: 'yellow', board: yellowBoard, homeEntry: 'g13', gameEntry: 'yb1' },
];

for (let i = 0; i < numPvp; i++) {
  let boardColor = boardDetails[i].boardColor;
  let homeEntry = boardDetails[i].homeEntry;
  let gameEntry = boardDetails[i].gameEntry;

  const parentDiv = document.createElement('div');
  for (let i = 0; i < 4; i++) {
    const span = document.createElement('span');
    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-location-pin', 'piece', `${boardColor}-piece`);

    icon.addEventListener('click', (e) => {
      // turnForUser(e)
    });

    let pieceID = `${boardColor}${i}`;
    let position = `${i}_${boardColor}`;

    const player = new PlayerPiece(boardColor, position, 0, homeEntry, pieceID, gameEntry);
    span.setAttribute('id', position);
    icon.setAttribute('piece-id', pieceID);
    playerPieces.push(player);
    span.append(icon);
    parentDiv.append(span);
  }
  boardDetails[i].board.append(parentDiv);
}

if (numPvp == 2) {
  playerTurns = ['blue', 'green'];
} else if (numPvp == 3) {
  playerTurns = ['blue', 'green', 'red'];
} else if (numPvp == 4) {
  playerTurns = ['blue', 'green', 'red', 'yellow'];
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setPlayerTurn = (playerTurnIndex) => {
  if (!playerTurnIndex) return;

  let currentTeamTurn = playerTurns[playerTurnIndex];
  // Filtering the board details array and finding the currentTeamTurn object
  let boardDetailObject = boardDetails.filter((obj) => obj.boardColor === currentTeamTurn);
  boardDetailObject[0].board.classList.toggle('active');
};

setPlayerTurn(0);

const nextTeamTurn = async () => {
  prevPlayerTurnIndex = currentPlayerTurnIndex;

  if (currentPlayerTurnIndex === playerTurns.length - 1) {
    currentPlayerTurnIndex = 0;
  } else {
    currentPlayerTurnIndex++;
  }

  // Here the setPlayerTurn is called twice to remove the active class from the last board and add to the new team board
  setPlayerTurn(prevPlayerTurnIndex);
  setPlayerTurn(currentPlayerTurnIndex);
  await delay(500);
  if (playerTurns[currentPlayerTurnIndex] !== 'blue') {
    rollDiceButtonForBot();
  }
};

const giveArrayForMovingPath = (piece) => {
  let indexOfPath;
  let movingArray = [];

  if (!pathArray.includes(piece.position)) {
    indexOfPath = homePathEntries[piece.team].findIndex((elem) => elem === piece.position);
    let homePathArrayForPiece = homePathEntries[piece.team];

    for (let i = 0; i < diceResult; i++) {
      if (indexOfPath + 1 < homePathArrayForPiece.length) {
        indexOfPath += 1;
        movingArray.push(homePathArrayForPiece[indexOfPath]);
      } else {
        break; // Exit the loop if the end of the home path array is reached
      }
    }
  } else {
    indexOfPath = pathArray.findIndex((elem) => elem === piece.position);

    for (let i = 0; i < diceResult; i++) {
      indexOfPath = (indexOfPath + 1) % pathArray.length;
      movingArray.push(pathArray[indexOfPath]);
    }
  }

  return movingArray;
};

const moveElementSequentially = (elementId, array) => {
  const elementToMove = document.querySelector(`[piece-id="${elementId}"]`);
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
  let piece = playerPieces.find((obj) => obj.id === elementId);
  let toBreak = false;

  // Function to move the element to the next target
  function moveToNextTarget(index) {
    if (index >= array.length) return;

    const currentTarget = document.getElementById(array[index]);

    if (array[index] === 'home') {
      let indexOfPiece = playerPieces.findIndex((obj) => obj.id === piece.id);
      playerPieces.splice(indexOfPiece, 1);
      elementToMove.remove();
      toBreak = true;
      if (currentTeamTurn === 'blue') {
        currentPlayerTurnStatus = true;
      } else {
        rollMyDice(true);
      }
      return;
    }

    piece.updatePosition(array[index]);

    // Append the element to the current target
    currentTarget.appendChild(elementToMove);

    setTimeout(() => {
      moveToNextTarget(index + 1);
    }, 170);

    !toBreak && moveToNextTarget(0);
  }
};

const rollMyDice = async (hasBonus) => {
  currentPlayerTurnStatus = true;
  await delay(700);
  if (diceResult === 6 || hasBonus || teamHasBonus) {
    rollDiceButtonForBot();
  } else {
    nextTeamTurn();
    if (playerTurns[currentPlayerTurnIndex] !== 'blue') rollDiceButtonForBot();
  }
};

const moveMyPiece = async (piece) => {
  let array = giveArrayForMovingPath(piece);

  if (array.length < diceResult) {
    return false;
  }

  piece.movePiece(array);
  await delay(array.length * 175)
  rollMyDice()
  return true; // Return true if move was performed
};

const turnForBot = async () => {
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
  let totalUnlockedPieces = playerPieces.filter(
    (obj) => obj.team === currentTeamTurn && obj.status === 1,
  ).length;
  let totalPiecesOfThisTeam = playerPieces.filter((obj) => obj.team === currentTeamTurn).length;
  let isMoving = false;

  if (totalUnlockedPieces.length === 0 && diceResult !== 6) {
    rollMyDice();
    return;
  }

  currentPlayerTurnStatus = true;
  let pieceTeam = playerPieces.filter(obj => obj.team === currentTeamTurn)
  
  // Condition when the bot has 0 pieces unlocked
  if (totalUnlockedPieces.length === 0 && diceResult === 6) {
    pieceTeam[0].unlockPiece()
    rollMyDice()
    return;
  }
};

const turnForUser = async (e) => {
  let isUserTurn = playerTurns[currentPlayerTurnIndex] === 'blue';
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

  // Return user if user has used it's chance or the current turn is not for user
  if (!isUserTurn || currentPlayerTurnStatus) return;

  // If user has any unlocked pieces
  let totalUnlockedPieces = playerPieces.filter(
    (obj) => obj.team === currentTeamTurn && obj.status === 1,
  ).length;

  let piece = playerPieces.filter(
    (obj) => obj.id === e.target.getAttribute('piece-id') && obj.team === currentTeamTurn,
  );

  let array = giveArrayForMovingPath(piece);

  if (array.length < diceResult) return;
  if (diceResult === 6) {
    currentPlayerTurnStatus = true;
    if (piece.status === 0) {
      piece.unlockPiece();
      return;
    }
    piece.movePiece(array);
  } else {
    if (piece.status === 0) return;
    currentPlayerTurnStatus = true;
    piece.movePiece(array);
    if (!teamHasBonus) nextTeamTurn();
  }
};

const rollDiceGif = new Image();
rollDiceGif.src = `./assets/rollDice.gif`;

rollDiceButton.addEventListener('click', async () => {
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

  if (!currentPlayerTurnStatus) return; // Return if user has used chance

  rollDiceButton.disabled = true;
  rollDice.src = rollDiceGif.src;
  diceResult = Math.floor(Math.random() * 6) + 1;
  currentPlayerTurnStatus = false; // User used its chance
  teamHasBonus = false;

  setTimeout(async () => {
    rollDice.src = `.assets/Dice-${diceResult}.png`;

    await delay(700);
    rollDiceButton.disabled = false;

    let totalUnlockedPieces = playerPieces.filter((obj) => obj.team === currentTeamTurn && obj.status === 1);

    if (totalUnlockedPieces.length === 0 && diceResult !== 6 && !teamHasBonus) {
      await delay(500);
      currentPlayerTurnStatus = true;
      nextTeamTurn();
    }
  }, 600);
});

const rollDiceButtonForBot = () => {
  if (!currentPlayerTurnStatus) return; // Return if user has used chance

  rollDice.src = rollDiceGif.src;
  diceResult = Math.floor(Math.random() * 6) + 1;
  currentPlayerTurnStatus = false; // User used its chance
  teamHasBonus = false;

  setTimeout(async () => {
    rollDice.src = `.assets/Dice-${diceResult}.png`;

    await delay(700);
    rollDiceButton.disabled = false;
    turnForBot();
  }, 600);
};
