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

// Play a round of the game
function playerRound(playerChoice) {
  // Reset animation classes
  playerChoiceDisplay.classList.remove('winner', 'pulse');
  computerChoiceDisplay.classList.remove('winner', 'pulse');

  // Display player choice with animation
  playerChoiceDisplay.innerHTML = choiceIcons[playerChoice];
  playerChoiceDisplay.classList.add('pulse');

  // Generate computer choice with delay for suspense
  setTimeout(() => {
    const computerChoice = getComputedChoice();
    computerChoiceDisplay.innerHTML = choiceIcons[computerChoice];
    computerChoiceDisplay.classList.add('pulse');

    // Determine winner
    const winner = determineWinner(playerChoice, computerChoice);

    // Update scores and display result
    updateGame(winner, playerChoice, computerChoice);

    // Check for match winner
    checkMatchWinner();
  }, 500);
}

// Get computer's random choice
function getComputedChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

// Determine the winner of a round
function determineWinner(player, computer) {
  if (player === computer) {
    return 'draw';
  }

  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'player';
  }

  return 'computer';
}

// Update game state and UI after a round
function updateGame(winner, playerChoice, computerChoice) {
  // Update score
  if (winner === 'player') {
    gameState.playerScore++;
    gameState.playerWins++;
    gameState.currentStreak++;
    gameState.maxStreak = Math.max(gameState.maxStreak, gameState.currentStreak);
    resultText.textContent = `You Win! ${capitalizeFirst(playerChoice)} beats ${computerChoice}`;
    resultText.className = 'win';
    playerChoiceDisplay.classList.add('winner');
  } else if (winner === 'computer') {
    gameState.computerScore++;
    gameState.currentStreak = 0;
    resultText.textContent = `You Lose! ${capitalizeFirst(computerChoice)} beats ${playerChoice}`;
    resultText.className = 'lose';
    computerChoiceDisplay.classList.add('winner');
  } else {
    resultText.textContent = "It's a Draw!";
    resultText.className = 'draw';
  }

  // Update game stats
  gameState.gamesPlayed++;

  // Update UI
  playerScoreDisplay.textContent = gameState.playerScore;
  computerScoreDisplay.textContent = gameState.computerScore;
  gamesPlayedDisplay.textContent = gameState.gamesPlayed;
  currentStreakDisplay.textContent = gameState.currentStreak;

  // Calculate and update win rate
  const winRate =
    gameState.gamesPlayed > 0 ? Math.round((gameState.playerWins / gameState.gamesPlayed) * 100) : 0;
  winRateDisplay.textContent = `${winRate}`;
}

// Check if a player has won the match
function checkMatchWinner() {
  if (gameState.playerScore >= 10) {
    resultText.innerHTML = `<i class="fas fa-trophy"></i> Congratulations! You won the match! <i class="fas fa-trophy"></i>`;
    resultText.className = 'win';
    disableGame();
  } else if (gameState.computerScore >= 10) {
    resultText.innerHTML = `<i class="fas fa-robot"></i> Computer won the match! Better luck next time! <i class="fas fa-robot"></i>`;
    disableGame();
  }
}

// Disable game controls when match is over
function disableGame() {
  choiceButtons.forEach((button) => {
    button.disabled = true;
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
  });

  if (gameState.isAutoPlaying) {
    toggleAutoPlay();
  }
}

// Enable game controls
function enableGame() {
  choiceButtons.forEach((button) => {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  });
}

// Reset the game
function resetGame() {
  gameState.playerScore = 0;
  gameState.computerScore = 0;
  gameState.gamesPlayed = 0;
  gameState.playerWins = 0;
  gameState.currentStreak = 0;
  gameState.maxStreak = 0;

  playerScoreDisplay.textContent = '0';
  computerScoreDisplay.textContent = '0';
  gamesPlayedDisplay.textContent = '0';
  winRateDisplay.textContent = '0';
  currentStreakDisplay.textContent = '0';

  playerChoiceDisplay.innerHTML = '<i class="fas fa-question"></i>';
  computerChoiceDisplay.innerHTML = '<i class="fas fa-question"></i>';

  resultText.textContent = 'Make your move to start the game!';
  resultText.className = '';

  enableGame();

  if (gameState.isAutoPlaying) {
    toggleAutoPlay();
  }
}

// Toggle auto-play mode
function toggleAutoPlay() {
  if (gameState.isAutoPlaying) {
    // Stop auto-play
    clearInterval(gameState.autoPlayInterval);
    gameState.isAutoPlaying = false;
    autoPlayBtn.textContent = 'Auto Play';
    enableGame();
  } else {
    // Start auto-play
    gameState.isAutoPlaying = true;
    autoPlayBtn.textContent = 'Stop Auto Play';
    disableGame();

    gameState.autoPlayInterval = setInterval(() => {
      const choices = ['rock', 'paper', 'scissors'];
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      playerRound(randomChoice);
    }, 1000);
  }
}

// Helper function to capitalize first letter
function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initGame);
