// Importing all boards
const blueBoard = document.getElementById('blue-board');
const greenBoard = document.getElementById('green-board');
const redBoard = document.getElementById('red-board');
const yellowBoard = document.getElementById('yellow-board');

// Initial variables
let playerTurns = []; // This will hold the players team color
let currentPlayerTurnIndex = 0;
let prevPlayerTurnIndex;
let currentPlayerTurnStatus = true; // True means the user has not yet player and false means played
let teamHasBonus = false;

let diceResult;

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
    this.status = 1;
  }

  updatePosition(position) {
    this.position = position;
  }

  movePiece(array) {
    // Function to move the piece
  }

  // Function to return the piece to the locked position when killed
  sentToBoard() {}
}

let numPvp = parseInt(prompt('Enter the number of players.'));

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
    // RollDiceButtonForBot()
  }
};

const rollDiceGif = new Image()
rollDiceGif.src = `./assets/rollDice.gif`