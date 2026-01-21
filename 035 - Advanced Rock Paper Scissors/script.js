// Game state
const gameState = {
  playerScore: 0,
  computerScore: 0,
  gamesPlayed: 0,
  playerWins: 0,
  currentStreak: 0,
  maxStreak: 0,
  isAutoPlaying: false,
  autoPlayInterval: null,
};

// DOM elements
const playerChoiceDisplay = document.getElementById('player-choice');
const computerChoiceDisplay = document.getElementById('computer-choice');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
const resultText = document.getElementById('result-text');
const gamesPlayedDisplay = document.getElementById('games-played');
const winRateDisplay = document.getElementById('win-rate');
const currentStreakDisplay = document.getElementById('current-streak');
const resetBtn = document.getElementById('reset-btn');
const autoPlayBtn = document.getElementById('auto-play-btn');
const choiceButtons = document.querySelectorAll('.choice-btn');

// Choice icons mapping
const choiceIcons = {
  rock: '<i class="fas fa-hand-rock"></i>',
  paper: '<i class="fas fa-hand-paper"></i>',
  scissors: '<i class="fas fa-hand-scissors"></i>',
};

// Initialize game
function initGame() {
  // Add event listeners
  choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!gameState.isAutoPlaying) {
        const playerChoice = button.getAttribute('data-choice');
        playerRound(playerChoice);
      }
    });
  });

  resetBtn.addEventListener('click', resetGame);
  autoPlayBtn.addEventListener('click', toggleAutoPlay);
}
