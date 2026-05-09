let timer = 120;
let score = 0;
let hitRn;
let timerInterval;

function increaseScore() {
  score += 10;
  document.getElementById('scoreVal').textContent = score;
}

function getNewHit() {
  hitRn = Math.floor(Math.random() * 10);
  document.getElementById('hitNum').textContent = hitRn;
}

function makeBubble() {
  let clutter = '';
  for (let i = 0; i <= 180; i++) {
    let rn = Math.floor(Math.random() * 10);
    clutter += `<div class="bubble">${rn}</div>`;
  }
  document.getElementById('panelBottom').innerHTML = clutter;
}

function runTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(function () {
    if (timer > 0) {
      timer--;
      document.getElementById('timerInterval').textContent = timer;
    } else {
      clearInterval(timerInterval);
      document.getElementById('gameOver').style.display = 'block';
      document.getElementById('hitNum').textContent = 0;
      document.getElementById('scoreVal').textContent = 0;
    }
  }, 1000);
}

document.getElementById('panelBottom').addEventListener('click', function (dets) {
  let clickAtNum = Number(dets.target.textContent);
  if (clickAtNum === hitRn) {
    increaseScore();
    makeBubble();
    getNewHit();
  }
});

const restartBtn = document.getElementById('restart');

function restartGame() {
  timer = 120;
  score = 0;
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  document.getElementById('scoreVal').textContent = score;
  document.getElementById('timerInterval').textContent = timer;
  document.getElementById('gameOver').style.display = 'none';
  makeBubble();
  getNewHit();
  runTimer();
}

restartBtn.addEventListener('click', restartGame);
runTimer();
makeBubble();
getNewHit();
