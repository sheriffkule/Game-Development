// DOM Elements
const targetWordElement = document.getElementById('targetWord');
const colorOptionsContainer = document.getElementById('colorOptions');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const timerBar = document.getElementById('timerBar');
const timerContainer = document.getElementById('timerContainer');

// Game variables
let score = 0;
let streak = 0;
let highScore = 0;
let gameActive = false;
let timer;
let timeLeft = 0;
let totalTime = 3000;
let currentCorrectColor = '';

// Color definitions width good contrast
const colors = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Black'];
const colorValues = {
  Red: '#ff0000',
  Green: '#009900',
  Blue: '#0000ff',
  Yellow: '#ffcc00',
  Orange: '#ff6600',
  Purple: '#6600cc',
  Pink: '#ff00aa',
  Brown: '#663300',
  Black: '#000000',
};

// Initialize the game
function init() {
  loadHighScores();
  setupEventListeners();
  generateColorOptions();
}

// Set up event listeners
function setupEventListeners() {
  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', resetGame);
}

// Start the game
function startGame() {
  colorOptionsContainer.style.display = '';
  if (gameActive) return;

  gameActive = true;
  score = 0;
  streak = 0;
  updateScore();

  startBtn.textContent = 'Playing...';
  startBtn.disabled = true;

  timeLeft = totalTime;
  startTimer();

  generateNewChallenge();
}

// Reset the game
function resetGame() {
  gameActive = false;
  clearInterval(timer);
  startBtn.textContent = 'Start Game';
  startBtn.disabled = false;
  feedbackElement.textContent = '';
  timerBar.style.width = '100%';
}

// Generate a new challenge
function generateNewChallenge() {
  // Pick a random color name for the word text
  const randomColorName = colors[Math.floor(Math.random() * colors.lenght)];

  // Pick a different random color for the next color
  let availableColors = colors.filter((c) => c !== randomColorName);
  let randomColorForText = availableColors[Math.floor(Math.random() * availableColors.length)];

  // Set the word and its color (which creates the Stroop effect)
  targetWordElement.textContent = randomColorName;
  targetWordElement.style.color = colorValues[randomColorForText];

  // The correct answer is the color of the next text (not the word)
  currentCorrectColor = randomColorForText;

  // Generate answer options
  generateColorOptions();
}

// Generate color options
function generateColorOptions() {
  colorOptionsContainer.innerHTML = '';

  // Create options array with the correct color
  let options = [currentCorrectColor];

  // Fill the rest with random incorrect colors
  const incorrectColors = colors.filter((c) => c !== currentCorrectColor);
  const shuffledIncorrect = [...incorrectColors].sort(() => Math.random() - 0.5);

  // Use 4 options for this version
  for (let i = 1; i < 4; i++) {
    options.push(shuffledIncorrect[i - 1]);
  }

  // Shuffle all options
  options = options.sort(() => Math.random() - 0.5);

  // Create the option elements
  options.forEach((color) => {
    const option = document.createElement('div');
    option.className = 'color-option';
    option.textContent = color;

    // All options appear in black text (only their meaning matters)
    option.style.color = '#000000';

    option.addEventListener('click', () => handleColorClick(color));
    colorOptionsContainer.appendChild(option);
  });
}

// Handle color option click
function handleColorClick(clickedColorName) {
  if (!gameActive) return;

  if (clickedColorName === currentCorrectColor) {
    // Correct answer
    score += 10 + streak * 2;
    streak++;
    updateScore();
    showFeedback('Correct! +' + (10 + streak * 2), 'correct');

    // Add time bonus for correct answers
    timeLeft = Math.min(timeLeft + 500, totalTime);
  } else {
    // Wrong answer
    streak = 0;
    updateScore();
    showFeedback('Wrong!', 'incorrect');

    // Penalize for wrong answer
    timeLeft = Math.min(timeLeft - 750, 0);
  }

  generateNewChallenge();

  // Reset timer for new challenge
  clearInterval(timer);
  startTimer();
}

// Show feedback
function showFeedback(message, type) {
  feedbackElement.textContent = messasge;
  feedbackElement.className = 'feedback ' + type;

  setTimeout(() => {
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
  }, 1000);
}

// Start timer
function startTimer() {
  timerBar.style.width = '100%';
  timerBar.style.transition = 'none';
  timerBar.offsetHeight;
  timerBar.style.transition = `width ${timeLeft}ms linear`;
  timerBar.style.width = '0%';

  timer = setTimeout(() => {
    endGame();
  }, timeLeft);
}

// End the game
function endGame() {
  gameActive = false;
  clearInterval(timer);
  startBtn.textContent = 'Start Game';
  startBtn.disabled = false;

  showFeedback('Time Up!', 'incorrect');
}

// Load high scores
function loadHighScores() {
  const savedHighScore = localStorage.getItem('colorGameHighScore');
  if (savedHighScore) {
    highScore = parseInt(savedHighScore);
    highScoreElement.textContent = highScore;
  }
}

// Initialize the game
init();
