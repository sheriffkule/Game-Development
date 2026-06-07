let ballPosition = 0;
let gameOver = false;

function shuffle() {
  const message = document.getElementById('message');
  message.textContent = '';
  message.style.opacity = '0'
  document.getElementById('playAgain').style.visibility = 'hidden';
  document.getElementById('playAgain').style.opacity = 0;
  const ball = document.getElementById('ball');

  initialBallPosition = Math.floor(Math.random() * 3) + 1;
  const initialBowl = document.getElementById(`bowl${initialBallPosition}`);
  const initialBowlRect = initialBowl.getBoundingClientRect();
  ball.style.top = `${initialBowlRect.top - 40}px`;
  ball.style.left = `${initialBowlRect.left + initialBowlRect.width * 0.5 - 15}px`;
  ball.style.display = 'block';

  ballPosition = Math.floor(Math.random() * 3) + 1;

  setTimeout(() => {
    ball.style.top = `${initialBowlRect.top + 20}px`;
    ball.style.display = 'none';

    const bowls = [1, 2, 3];
    for (let i = 0; i < 3; i++) {
      const bowl = document.getElementById(`bowl${bowls[i]}`);
      bowl.style.transform = 'translateY(-20px)';
    }

    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const bowl = document.getElementById(`bowl${bowls[i]}`);
        bowl.style.transform = 'translateY(0)';
      }

      gameOver = false;
      document.getElementById('bowl1').disabled = false;
      document.getElementById('bowl2').disabled = false;
      document.getElementById('bowl3').disabled = false;
    }, 1000);
  }, 2000);
}

function checkBowl(bowlNumber) {
  const message = document.getElementById('message');
  if (gameOver) return;
  message.style.opacity = '1'

  if (bowlNumber === ballPosition) {
    message.textContent = 'You found the ball! :) YEHEY';
  } else {
    message.textContent = `Try again! :( The ball was under bowl ${ballPosition}`;
  }
  gameOver = true;
  document.getElementById('bowl1').disabled = true;
  document.getElementById('bowl2').disabled = true;
  document.getElementById('bowl3').disabled = true;
  document.getElementById('playAgain').style.visibility = 'visible';
  document.getElementById('playAgain').style.opacity = 1;
}

function playAgain() {
  gameOver = false;
  shuffle();
}

shuffle();
