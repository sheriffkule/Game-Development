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
  startBtn.disable = true;

  timeLeft = totalTime;
  startTimer();

  generateNewChallenge();
}

// Reset the game
function resetGame() {
  gameActive = false;
  clearInterval(timer);
  startBtn.textContent = 'Start Game';
  startBtn.disable = false;
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
