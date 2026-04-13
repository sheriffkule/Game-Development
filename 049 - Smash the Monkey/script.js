let score = 0;
let time = 60;
let speed = 800;
const images = document.querySelectorAll('.box img');
const scoreEl = document.querySelector('.score');
const timeEl = document.querySelector('.time');
const modal = document.querySelector('.modal');
const modalParagraph = document.querySelector('.modal p');
const modalBtn = document.querySelector('.modal .end');
let setTimer;
let setShowHide;

// play button
modalBtn.addEventListener('click', function () {
  clearInterval(checkPageInterval);
  modal.classList.add('hidden');
  setTimer = setInterval(timer, 1000);
  setShowHide = setInterval(showHide, speed * 2);
});

// click handler and score updater
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener('click', hitKong);
}

function hitKong(e) {
  curr = e.target;
  curr.parentNode.classList.add('touched');
  score += 10;
  scoreEl.innerHTML = score;
  setTimeout(() => {
    curr.parentNode.classList.remove('touched');
  }, speed / 2);
}

// show and hide with interval
function showHide() {
  let randd = randomize(9);
  images[randd].style.top = '30px';
  setTimeout(() => {
    images[randd].style.top = '100px';
  }, speed);
}

// manage timer
function timer() {
  if (time) {
    time -= 1;
    timeEl.innerHTML = time;
  } else {
    restart();
  }
}

function restart() {
  modalParagraph.innerHTML = 'You scored ' + score + '!';
  modal.classList.remove('hidden');
  clearInterval(setTimer);
  clearInterval(setShowHide);
  time = 60;
  score = 0;
  timeEl.innerHTML = time;
  scoreEl.innerHTML = score;
}

// function random
function randomize(rand) {
  return Math.floor(Math.random() * rand);
}

// handle focus of the page
function checkPageFocus() {
  if (document.hasFocus()) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

let checkPageInterval = setInterval(checkPageFocus, 300);
