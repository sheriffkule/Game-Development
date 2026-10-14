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
let gameOver = false;

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

    if (array.includes(this.homePathEntry)) {
      let indexOfPathEntry = array.findIndex((obj) => obj === this.homePathEntry);
      let newSlicedArray = array.slice(0, indexOfPathEntry);

      if (newSlicedArray.length < diceResult) {
        let remainingLength = diceResult - newSlicedArray.length;
        let secondPart = homePathEntries[this.team].slice(0, remainingLength);
        newSlicedArray = newSlicedArray.concat(secondPart);
      }

      filteredArray = newSlicedArray;
    }

    if (filteredArray.includes('home')) {
      teamHasBonus = true;
    }

    moveElementSequentially(this.id, filteredArray);
    this.score += filteredArray.length;
  }

  // Function to return the piece to the locked position when killed
  sentMeToBoard() {
    this.score = 0;
    this.position = this.initialPosition;
    this.status = 0;
    let element = document.querySelector(`[piece-id="${this.id}"]`);
    let toAppendDiv = document.getElementById(this.initialPosition);
    toAppendDiv.appendChild(element);
  }
}

let numPvp = parseInt(prompt('Enter the number of players.'));
// let numPvp = 4;

let playerPieces = []; // This will hold all pieces from all teams
let boardDetails = [
  { boardColor: 'blue', board: blueBoard, homeEntry: 'y13', gameEntry: 'b1' },
  { boardColor: 'green', board: greenBoard, homeEntry: 'r13', gameEntry: 'g1' },
  { boardColor: 'red', board: redBoard, homeEntry: 'b13', gameEntry: 'r1' },
  { boardColor: 'yellow', board: yellowBoard, homeEntry: 'g13', gameEntry: 'y1' },
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
      turnForUser(e);
    });

    if (boardColor === 'blue') {
      icon.setAttribute('myPieceNum', i + 1);
    }

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
  if (playerTurnIndex === undefined || playerTurnIndex < 0) return;

  let currentTeamTurn = playerTurns[playerTurnIndex];
  // Filtering the board details array and finding the currentTeamTurn object
  let boardDetailObject = boardDetails.filter((obj) => obj.boardColor === currentTeamTurn);
  boardDetailObject[0].board.classList.toggle('active');
};

setPlayerTurn(0);

const nextTeamTurn = async () => {
  if (gameOver) return;

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
  if (gameOver) return;
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
  let piece = playerPieces.find((obj) => obj.id === elementId);
  if (!elementToMove || !piece) return;
  let currentTeamTurn = piece.team;

  // Function to move the element to the next target
  function moveToNextTarget(index) {
    if (index >= array.length) return;

    const currentTarget = document.getElementById(array[index]);

    if (array[index] === 'home') {
      let indexOfPiece = playerPieces.findIndex((obj) => obj.id === piece.id);
      playerPieces.splice(indexOfPiece, 1);
      elementToMove.remove();
      let totalPiecesOfThisTeam = playerPieces.filter((obj) => obj.team === currentTeamTurn);

      if (totalPiecesOfThisTeam.length === 0) {
        declareWinner(currentTeamTurn);
        return;
      }

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
  }

  moveToNextTarget(0);
};

const rollMyDice = async (hasBonus) => {
  if (gameOver) return;

  currentPlayerTurnStatus = true;
  await delay(700);
  if (gameOver) return;
  if (diceResult === 6 || hasBonus || teamHasBonus) {
    rollDiceButtonForBot();
  } else {
    nextTeamTurn();
  }
};

const moveMyPiece = async (piece) => {
  let array = giveArrayForMovingPath(piece);

  if (array.length < diceResult) {
    await delay(500);
    currentPlayerTurnStatus = true;
    nextTeamTurn();
    return false;
  }

  piece.movePiece(array);
  await delay(array.length * 175);
  rollMyDice();
  return true; // Return true if move was performed
};

const giveEnemiesBehindMe = (piece) => {
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
  let indexOfPath = pathArray.findIndex((elem) => elem === piece.position);
  if (indexOfPath < 0) return 0;

  let lastSixPath = [];

  for (let i = 6; i > 0; i--) {
    let index = (indexOfPath - i + pathArray.length) % pathArray.length;
    lastSixPath.push(pathArray[index]);
  }

  let opponentsOnPath = playerPieces.filter(
    (obj) => lastSixPath.includes(obj.position) && obj.team !== currentTeamTurn,
  );

  return opponentsOnPath.length;
};

const turnForBot = async () => {
  if (gameOver) return;

  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];
  let totalUnlockedPieces = playerPieces.filter(
    (obj) => obj.team === currentTeamTurn && obj.status === 1,
  );
  let totalPiecesOfThisTeam = playerPieces.filter((obj) => obj.team === currentTeamTurn).length;
  let isMoving = false;

  if (totalUnlockedPieces.length === 0 && diceResult !== 6) {
    rollMyDice();
    return;
  }

  currentPlayerTurnStatus = true;
  let pieceTeam = playerPieces.filter((obj) => obj.team === currentTeamTurn);

  // Condition when the bot has 0 pieces unlocked
  if (totalUnlockedPieces.length === 0 && diceResult === 6) {
    pieceTeam[0].unlockPiece();
    rollMyDice();
    return;
  }

  // Logic for kill detection
  let opponentPieces = playerPieces.filter((obj) => obj.team !== currentTeamTurn && obj.status === 1);
  let bonusReached = false;

  for (let i = 0; i < totalUnlockedPieces.length; i++) {
    if (bonusReached) break;

    let array = giveArrayForMovingPath(totalUnlockedPieces[i]);
    if (array.length < diceResult) continue;
    let cut = opponentPieces.find(
      (obj) => obj.position === array[array.length - 1] && !safePaths.includes(obj.position),
    );
    let homeBonusReached = array[array.length - 1] === 'home'; // If the last path is home

    if (cut) {
      totalUnlockedPieces[i].movePiece(array);
      await delay(array.length * 175);
      cut.sentMeToBoard();
      bonusReached = true;
      rollMyDice(true);
      return;
    }

    if (homeBonusReached) {
      totalUnlockedPieces[i].movePiece(array);
      await delay(array.length * 175);
      bonusReached = true;
      rollMyDice(true);
    }
  }

  if (bonusReached) return;

  let lockedPieces = playerPieces.filter((obj) => obj.team === currentTeamTurn && obj.status === 0);

  const attemptMove = async (piece) => {
    const pieceToMove = [piece, ...totalUnlockedPieces].find(
      (candidate) => candidate && giveArrayForMovingPath(candidate).length === diceResult,
    );

    if (!pieceToMove) {
      currentPlayerTurnStatus = true;
      nextTeamTurn();
      return false;
    }

    if (!(await moveMyPiece(pieceToMove))) return false;

    isMoving = true;
    return true;
  };

  // Condition when the bot has 1 unlocked piece
  if (totalUnlockedPieces.length === 1) {
    if (diceResult === 6 && lockedPieces.length > 0) {
      lockedPieces[0].unlockPiece();
      rollMyDice();
      return;
    }
    let piece = totalUnlockedPieces.find((obj) => obj.status === 1);
    if (!(await attemptMove(piece))) return;
  }

  // Condition when the bot has 2  pieces unlocked
  if (totalUnlockedPieces.length === 2) {
    if (diceResult === 6 && lockedPieces.length > 0 && totalPiecesOfThisTeam >= 3) {
      lockedPieces[0].unlockPiece();
      rollDiceButtonForBot();
      return;
    }

    let pieceSafe = totalUnlockedPieces.filter((obj) => safePaths.includes(obj.position));
    let pieceUnSafe = totalUnlockedPieces.filter((obj) => !safePaths.includes(obj.position));

    if (pieceSafe.length === 0) {
      let scoreOfFirstPiece = pieceUnSafe[0].score;
      let scoreOffSecondPiece = pieceUnSafe[1].score;

      if (scoreOffSecondPiece > scoreOfFirstPiece) {
        if (!(await attemptMove(pieceUnSafe[1]))) return; // Move the element with higher score
      } else {
        if (!(await attemptMove(pieceUnSafe[0]))) return; // Move the element with higher score
      }
    }

    if (pieceSafe.length === 1) {
      if (!(await attemptMove(pieceSafe[0]))) return;
    }

    if (pieceSafe.length === 2 && pieceSafe[0].position === pieceSafe[1].position) {
      if (!(await attemptMove(pieceSafe[0]))) return;
    }

    if (pieceSafe.length === 2) {
      let scoreOfFirstPiece = pieceSafe[0].score;
      let opponentsBeforeFirstPiece = giveEnemiesBehindMe(pieceSafe[0]);

      let scoreOfSecondPiece = pieceSafe[1].score;
      let opponentsBeforeSecondPiece = giveEnemiesBehindMe(pieceSafe[1]);

      if (opponentsBeforeFirstPiece > opponentsBeforeSecondPiece) {
        if (!(await attemptMove(pieceSafe[1]))) return;
      } else if (opponentsBeforeSecondPiece > opponentsBeforeFirstPiece) {
        if (!(await attemptMove(pieceSafe[0]))) return;
      } else if (opponentsBeforeFirstPiece === opponentsBeforeSecondPiece) {
        if (scoreOfSecondPiece > scoreOfFirstPiece) {
          if (!(await attemptMove(pieceSafe[1]))) return;
        } else {
          if (!(await attemptMove(pieceSafe[0]))) return;
        }
      }
    }
  }

  // Condition when the bot has 3 pieces unlocked
  if (totalUnlockedPieces.length === 3) {
    let pieceSafe = totalUnlockedPieces.filter((obj) => safePaths.includes(obj.position));
    let pieceUnSafe = totalUnlockedPieces.filter((obj) => !safePaths.includes(obj.position));

    if (pieceSafe.length === 0) {
      let scoreOfFirstPiece = pieceUnSafe[0].score;
      let scoreOffSecondPiece = pieceUnSafe[1].score;
      let scoreOfThirdPiece = pieceUnSafe[2].score;

      let greatestScore = Math.max(scoreOfFirstPiece, scoreOffSecondPiece, scoreOfThirdPiece);
      let movingPiece = pieceUnSafe.find((obj) => obj.score === greatestScore);
      if (!(await attemptMove(movingPiece))) return;
    }

    if (pieceSafe.length === 1) {
      // 1 piece is safe and other 2 are unsafe
      let scoreOfFirstPiece = pieceUnSafe[0].score;
      let scoreOffSecondPiece = pieceUnSafe[1].score;

      if (scoreOffSecondPiece > scoreOfFirstPiece) {
        if (!(await attemptMove(pieceUnSafe[1]))) return; // Move the element with higher score
      } else {
        if (!(await attemptMove(pieceUnSafe[0]))) return; // Move the element with higher score
      }
    }

    if (
      pieceSafe.length === 3 &&
      pieceSafe[0].position === pieceSafe[1].position &&
      pieceSafe[1].position === pieceSafe[2].position
    ) {
      if (!(await attemptMove(pieceSafe[0]))) return;
    }

    if (pieceSafe.length === 2) {
      if (!(await attemptMove(pieceUnSafe[0]))) return;
    }

    if (pieceSafe.length === 3) {
      let opponentsBeforeFirstPiece = giveEnemiesBehindMe(pieceSafe[0]);
      let opponentsBeforeSecondPiece = giveEnemiesBehindMe(pieceSafe[1]);
      let opponentsBeforeThirdPiece = giveEnemiesBehindMe(pieceSafe[2]);

      if (
        opponentsBeforeFirstPiece < opponentsBeforeSecondPiece &&
        opponentsBeforeFirstPiece < opponentsBeforeThirdPiece
      ) {
        if (!(await attemptMove(pieceSafe[0]))) return;
      } else if (
        opponentsBeforeSecondPiece < opponentsBeforeFirstPiece &&
        opponentsBeforeSecondPiece < opponentsBeforeThirdPiece
      ) {
        if (!(await attemptMove(pieceSafe[1]))) return;
      } else if (
        opponentsBeforeThirdPiece < opponentsBeforeFirstPiece &&
        opponentsBeforeThirdPiece < opponentsBeforeSecondPiece
      ) {
        if (!(await attemptMove(pieceSafe[2]))) return;
      } else {
        let piecesAtHomePath = pieceTeam.filter(
          (obj) => obj.status === 1 && homePathArray.includes(obj.position),
        );
        let piecesNotAtHomePath = pieceTeam.filter(
          (obj) => obj.status === 1 && !homePathArray.includes(obj.position),
        );

        piecesNotAtHomePath.sort((a, b) => a.score - b.score);

        if (piecesNotAtHomePath.length > 0) {
          if (!(await attemptMove(piecesNotAtHomePath[0]))) return;
        } else {
          for (let i = 0; i < piecesAtHomePath.length; i++) {
            let movingPathArray = giveArrayForMovingPath(piecesAtHomePath[i]);
            if (movingPathArray.length === diceResult) {
              if (!(await attemptMove(piecesAtHomePath[i]))) return;
              break;
            }
          }
        }
      }
    }
  }

  if (totalUnlockedPieces.length >= 4) {
    const movablePiece = totalUnlockedPieces.find(
      (piece) => giveArrayForMovingPath(piece).length === diceResult,
    );
    if (movablePiece) {
      if (!(await attemptMove(movablePiece))) return;
    }
  }

  if (!isMoving) nextTeamTurn();
};

const turnForUser = async (e) => {
  if (gameOver) return;

  let isUserTurn = playerTurns[currentPlayerTurnIndex] === 'blue';
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

  // Return user if user has used it's chance or the current turn is not for user
  if (!isUserTurn || currentPlayerTurnStatus) return;

  // If user has any unlocked pieces
  let totalUnlockedPieces = playerPieces.filter(
    (obj) => obj.team === currentTeamTurn && obj.status === 1,
  ).length;

  let piece = playerPieces.find(
    (obj) => obj.id === e.target.getAttribute('piece-id') && obj.team === currentTeamTurn,
  );
  if (!piece || (piece.status === 0 && diceResult !== 6)) return;

  let opponentPieces = playerPieces.filter((obj) => obj.team !== currentTeamTurn && obj.status === 1);
  let array = giveArrayForMovingPath(piece);

  if (array.length < diceResult) return;

  let cut = opponentPieces.find(
    (obj) => obj.position === array[array.length - 1] && !safePaths.includes(obj.position),
  );

  if (cut) {
    piece.movePiece(array);
    await delay(array.length * 175);
    cut.sentMeToBoard();
    currentPlayerTurnStatus = true;
    return;
  }

  if (diceResult === 6) {
    if (piece.status === 0) {
      currentPlayerTurnStatus = true;
      piece.unlockPiece();
      return;
    }
    piece.movePiece(array);
    await delay(array.length * 175);
    currentPlayerTurnStatus = true;
  } else {
    piece.movePiece(array);
    await delay(array.length * 175);
    currentPlayerTurnStatus = true;
    if (!teamHasBonus) nextTeamTurn();
  }
};

const rollDiceGif = new Image();
rollDiceGif.src = `./assets/rollDice.gif`;

rollDiceButton.addEventListener('click', async () => {
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

  if (gameOver || currentTeamTurn !== 'blue' || !currentPlayerTurnStatus) return;

  rollDiceButton.disabled = true;
  rollDice.src = rollDiceGif.src;
  diceResult = Math.floor(Math.random() * 6) + 1;
  currentPlayerTurnStatus = false; // User used its chance
  teamHasBonus = false;

  setTimeout(async () => {
    rollDice.src = `./assets/Dice-${diceResult}.png`;

    await delay(700);
    rollDiceButton.disabled = false;

    let canMove = playerPieces.some(
      (piece) =>
        piece.team === currentTeamTurn &&
        piece.status === 1 &&
        giveArrayForMovingPath(piece).length === diceResult,
    );
    let canUnlock = diceResult === 6 && playerPieces.some(
      (piece) => piece.team === currentTeamTurn && piece.status === 0,
    );

    if (!canMove && !canUnlock) {
      await delay(500);
      currentPlayerTurnStatus = true;
      nextTeamTurn();
    }
  }, 600);
});

const rollDiceButtonForBot = () => {
  if (gameOver || !currentPlayerTurnStatus) return;

  rollDice.src = rollDiceGif.src;
  diceResult = Math.floor(Math.random() * 6) + 1;
  currentPlayerTurnStatus = false; // User used its chance
  teamHasBonus = false;

  setTimeout(async () => {
    rollDice.src = `./assets/Dice-${diceResult}.png`;

    await delay(700);
    rollDiceButton.disabled = false;
    turnForBot();
  }, 600);
};

document.addEventListener('keydown', (e) => {
  let currentTeamTurn = playerTurns[currentPlayerTurnIndex];

  if (currentTeamTurn !== 'blue') return;

  if (e.key === '1') {
    let piece = document.querySelector(`[myPieceNum="1"]`);
    piece?.click();
  }

  if (e.key === '2') {
    let piece = document.querySelector(`[myPieceNum="2"]`);
    piece?.click();
  }

  if (e.key === '3') {
    let piece = document.querySelector(`[myPieceNum="3"]`);
    piece?.click();
  }

  if (e.key === '4') {
    let piece = document.querySelector(`[myPieceNum="4"]`);
    piece?.click();
  }

  if (e.code === 'Space') {
    rollDiceButton.click();
  }
});

const declareWinner = (team) => {
  if (gameOver) return;
  gameOver = true;
  currentPlayerTurnStatus = false;
  rollDiceButton.disabled = true;

  let parentDiv = document.createElement('div');
  let childDiv = document.createElement('div');
  let h1 = document.createElement('h1');
  let button = document.createElement('button');

  parentDiv.setAttribute('id', 'declaredWinner');

  h1.textContent = `${team} Won The Game!`;

  button.textContent = 'Play Again';
  button.addEventListener('click', () => {
    location.reload();
  });
  childDiv.append(h1);
  childDiv.append(button);
  parentDiv.append(childDiv);
  document.body.append(parentDiv);

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

let count = 200;
let defaults = {
  origin: { y: 0.7 },
};

function fire(particleRatio, opts) {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio),
  });
}
