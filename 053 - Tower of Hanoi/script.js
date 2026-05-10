let noOfPlates = 3;
let stepCount = 0;
let startTime = 1;
let time = startTime * 120;
let timerUpdate;
let undoStateArray = [];
let redoStateArray = [];
const pltAdd = document.querySelector('.plateadd');
const pltDel = document.querySelector('.platedel');
const startGameBtn = document.querySelector('.startbtn');
const resetGameBtn = document.querySelector('.resetbtn');
const barDiv = document.getElementById('bar-1');
const dragPlate = document.querySelector('.plate');
const barsDivs = document.getElementsByClassName('bar');
const countDiv = document.querySelector('.noofPlates');
const stepCountDiv = document.querySelector('.countsteps');
const timerCount = document.getElementById('timershow');
const undoStateBtn = document.getElementById('undo');
const redoStateBtn = document.getElementById('redo');

pltAdd.addEventListener('click', addPlate);
pltDel.addEventListener('click', delPlate);
startGameBtn.addEventListener('click', startGame);
resetGameBtn.addEventListener('click', resetGame);
undoStateBtn.addEventListener('click', undoFunc);
redoStateBtn.addEventListener('click', redoFunc);

function setPlateDrags() {
  for (let i = 0; i < barsDivs.length; i++) {
    if (barsDivs[i].childNodes.length >= 1) {
      barsDivs[i].lastChild.draggable = true;
      for (let j = 0; j < barsDivs[i].childNodes.length - 1; j++) {
        barsDivs[i].childNodes[j].draggable = false;
      }
    }
  }
}

pltDel.disabled = true;
resetGameBtn.disabled = true;
undoStateBtn.disabled = true;
redoStateBtn.disabled = true;

function addPlate() {
  if (noOfPlates < 9) {
    let newPlate = document.createElement('div');
    newPlate.classList.add('plate');
    noOfPlates = noOfPlates + 1;
    newPlate.id = 'plate-' + noOfPlates;
    newPlate.setAttribute('draggable', false);
    newPlate.addEventListener('dragstart', drag);
    barDiv.insertBefore(newPlate, barDiv.firstChild);
    pltDel.disabled = false;
  } else {
    pltAdd.disabled = true;
  }

  showNoOfPlates();
}

function delPlate() {
  if (noOfPlates > 3) {
    noOfPlates = noOfPlates - 1;
    barDiv.removeChild(barDiv.firstChild);
    pltAdd.disabled = false;
  } else {
    pltDel.disabled = true;
  }

  showNoOfPlates();
}

function startGame() {
  pltAdd.disabled = true;
  pltDel.disabled = true;
  startGameBtn.disabled = true;
  resetGameBtn.disabled = false;
  setPlateDrags();
  timerUpdate = setInterval(updateTimer, 1000);
}

function resetGame() {
  noOfPlates = 0;
  stepCount = 0;
  showNoOfPlates();
  showStepCount();

  for (let i = 0; i < barsDivs.length; i++) {
    while (barsDivs[i].firstChild) {
      barsDivs[i].removeChild(barsDivs[i].lastChild);
    }
  }

  for (let j = 0; j < 3; j++) {
    addPlate();
  }

  pltAdd.disabled = false;
  pltDel.disabled = true;
  startGameBtn.disabled = false;
  resetGameBtn.disabled = true;
  startTime = 1;
  time = startTime * 120;
  timerCount.innerHTML = 'Time Left: 2:00';
  clearInterval(timerUpdate);
}

function updateTimer() {
  const mins = Math.floor(time / 60);
  let secs = time % 60;

  secs = secs < 10 ? '0' + secs : secs;
  timerCount.innerHTML = 'Time Left: ' + mins + ':' + secs;
  time--;
  winCondition();

  if (time < 0) {
    alert('You Lose! Times Up!');
    undoStateBtn.disabled = true;
    redoStateBtn.disabled = true;
    startGameBtn.disabled = true;
    resetGameBtn.disabled = false;
    pltAdd.disabled = true;
    pltDel.disabled = true;
    clearInterval(timerUpdate);

    for (let i = 0; i < barsDivs.length; i++) {
      if (barsDivs[i].childNodes.length >= 1) {
        barsDivs[i].lastChild.draggable = false;
        for (let j = 0; j < barsDivs[i].childNodes.length - 1; j++) {
          barsDivs[i].childNodes[j].draggable = false;
        }
      }
    }
  }
}

function showNoOfPlates() {
  countDiv.innerHTML = 'No of Plates: ' + noOfPlates;
}

function showStepCount() {
  if (stepCount === 0) {
    undoStateBtn.disabled = true;
  } else {
    undoStateBtn.disabled = false;
  }
  stepCountDiv.innerHTML = 'No of Steps: ' + stepCount;
}

function undoFunc() {
  if (undoStateArray.length === 0) return;
  if (redoStateArray.length === 0) return;
  let lastState = undoStateArray.pop();
  const plateMoved = document.getElementById(lastState.plate);
  const plateSource = document.getElementById(lastState.source);
  const plateDest = document.getElementById(lastState.dest);
  redoStateArray.push(lastState);
  plateSource.append(plateMoved);
  stepCount -= 1;
  time = time - 5;
  showStepCount();
  setPlateDrags();
  redoStateBtn.disabled = false;
  if (undoStateArray.length <= 0) undoStateBtn.disabled = true;
}

function redoFunc() {
  if (undoStateArray.length === 0) return;
  if (redoStateArray.length === 0) return;
  let lastState = redoStateArray.pop();
  const plateMoved = document.getElementById(lastState.plate);
  const plateSource = document.getElementById(lastState.dest);
  const plateDest = document.getElementById(lastState.source);
  undoStateArray.push(lastState);
  plateSource.append(plateMoved);
  stepCount += 1;
  showStepCount();
  setPlateDrags();
  if (redoStateArray.length <= 0) redoStateBtn.disabled = true;
}

function winCondition() {
  const bar1 = document.getElementById('bar-1');
  const bar2 = document.getElementById('bar-2');
  const bar3 = document.getElementById('bar-3');

  if (
    (bar1.childNodes.length == 0 && bar2.childNodes.length == 0 && bar3.childNodes.length == noOfPlates) ||
    (bar1.childNodes.length == 0 && bar2.childNodes.length == noOfPlates && bar3.childNodes.length == 0)
  ) {
    alert('Game Finished! You did it.');
    undoStateBtn.disabled = true;
    redoStateBtn.disabled = true;
    startGameBtn.disabled = true;
    resetGameBtn.disabled = false;
    pltAdd.disabled = true;
    pltDel.disabled = true;
    clearInterval(timerUpdate);
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData('text', ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  let data = ev.dataTransfer.getData('text');
  let x = document.getElementById(data);

  if (x.parentElement.lastElementChild.id == data) {
    if (ev.target.className == 'bar') {
      if (ev.target.childNodes.length == 0 || ev.target.lastElementChild.id > data) {
        redoStateBtn.disabled = true;
        redoStateArray.length = 0;
        undoStateArray.push({ plate: data, source: x.parentElement.id, dest: ev.target.id });
        ev.target.appendChild(document.getElementById(data));
        stepCount += 1;
        showStepCount();
        setPlateDrags();
        time = time + 5;
      }
    }
  }
}
