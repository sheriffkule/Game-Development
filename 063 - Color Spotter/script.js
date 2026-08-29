// DOM Elements
const colorGrid = document.getElementById('colorGrid');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const modalRestartBtn = document.getElementById('modalRestartBtn');
const welcomeStartBtn = document.getElementById('welcomeStartBtn');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const heartsDisplay = document.querySelector('.lives .heart');
const gameOverModal = document.getElementById('gameOverModal');
const welcomeModal = document.getElementById('welcomeModal');
const finalScoreDisplay = document.getElementById('finalScore');
const scoreList = document.getElementById('scoreList');
const difficultyProgress = document.querySelector('.difficulty-progress');
const colorblindToggle = document.getElementById('colorblindToggle');

// Game variables
let score = 0;
let lives = 3;
let timeLeft = 60;
let timer;
let differentColorIndex;
let difficulty = 1;
const maxDifficulty = 10;
let colorblindMode = false;
let highScores = JSON.parse(localStorage.getItem('colorSpotterHighScores')) || [];

// Initialize the game
function init() {
    updateHighScoresDisplay()
    welcomeModal.classList.add('active')
}

// Start the game
function startGame() {
    score = 0;
    lives = 3;
    timeLeft = 60;
    difficulty = 1;
    updateDisplays()
    generateColors()
    startTimer()
    startBtn.disabled = true
    restartBtn.disabled = false;
    welcomeModal.classList.remove('active')
}
