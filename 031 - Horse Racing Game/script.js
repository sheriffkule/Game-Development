// Create a JS class for a horse with 3 parameters: HTML, ID, position x and y
class Horse {
  constructor(id, x, y) {
    this.element = document.getElementById(id); // html element of the horse
    this.speed = Math.random() * 10 + 10; // random speed for each horse
    this.originalX = x; // original x position
    this.originalY = y; // original y position
    this.x = x;
    this.y = y;
    this.number = parseInt(id.replace(/[\D]/g, '')); // number of horse (1,2,3,4)
    this.lap = 0; // current lap of the horse
  }

  moveRight() {
    let horse = this; // assign horse to this object

    // use setTimeout to have delay in moving the horse
    setTimeout(function () {
      // Move the horse to right 1vw
      horse.x++;
      horse.element.style.left = horse.x + 'vw';

      // Check if goes through the start line, if horse runs enough number of laps and has pass the start line then stop
      if (horse.lap === num_lap && horse.x > horse.originalX + 6) {
        horse.arrive();
      } else {
        // Make decision to move Down or not
        //The width of the Down Road is 10vh, then the distance of each horse is 2.5vw (4 horses. The right position of the road is 82.5vw)
        // Continue to move right if not reach the point to turn
        if (horse.x < 82.5 - horse.number * 2.5) {
          horse.moveRight();
        } else {
          // Change HTML class of horse to runDown
          horse.element.className = 'horse runDown';
          // Change the speed, will be random values from 10 to 20
          horse.speed = Math.random() * 10 + 10;
          horse.moveDown();
        }
      }
    }, 1000 / this.speed);
  }

  // Do the same for moveDown, moveLeft, moveUp
  moveDown() {
    let horse = this;
    setTimeout(function () {
      horse.y++;
      horse.element.style.top = horse.y + 'vh';
      if (horse.y < horse.originalY + 65) {
        horse.moveDown();
      } else {
        horse.element.className = 'horse runLeft';
        horse.speed = Math.random() * 10 + 10;
        horse.moveLeft();
      }
    }, 1000 / this.speed);
  }

  moveLeft() {
    let horse = this;
    setTimeout(() => {
      horse.x--;
      horse.element.style = horse.x + 'vw';
      if (horse.x > 12.5 - horse.number * 2.5) {
        horse.moveLeft();
      } else {
        horse.element.className = 'horse runUp';
        horse.speed = Math.random() * 10 + 10;
        horse.moveUp();
      }
    }, 1000 / this.speed);
  }

  moveUp() {
    let horse = this;
    setTimeout(() => {
      horse.y--;
      horse.element.style = horse.y + 'vh';
      if (horse.y > horse.originalY) {
        horse.speed = Math.random() * 10 + 10;
        horse.moveUp();
      } else {
        horse.element.className = 'horse runRight';
        horse.lap++;
        horse.moveRight;
      }
    }, 1000 / this.speed);
  }

  // Trigger the horse by run
  run() {
    this.element.className = 'horse runRight';
    this.moveRight();
  }

  arrive() {
    // Stop the horse run by change class to standRight
    this.element.className = 'horse standRight';
    this.lap = 0; // Reset the lap

    // Show the results
    let tds = document.querySelectorAll('#results .result'); // Get all table cells to display the result
    // results.length is the current arrive position
    tds[results.length].className = 'result horse' + this.number;

    // Push the horse number to results array, according to the results array, we know the orter of race results
    results.push(this.number);

    // Win horse
    if (results.length === 1) {
      // If win horse is the bet horse, then add the fund
      if (this.number === bethorse) {
        funds += amount;
      } else {
        funds -= amount;
      }
      document.getElementById('funds').innerText = funds;
    } else if (results.length === 4) {
      // All horse arrived, enable again the start button
      document.getElementById('start').disabled = false;
    }
  }
}

let num_lap = 1;
let results = [];
let funds = 100;
let bethorse;
let amount;

// Start the function when the document is loaded
document.addEventListener('DOMContentLoaded', function (event) {
  let horse1 = new Horse('horse1', 20, 4);
  let horse2 = new Horse('horse1', 20, 8);
  let horse3 = new Horse('horse1', 20, 12);
  let horse4 = new Horse('horse1', 20, 16);

  // Event listener to the start button
  document.getElementById('start').onclick = function () {
    amount = parseInt(document.getElementById('amount').value);

    // Check for negative or zero amount
    if (amount <= 0) {
      alert('Please enter a positive bet amount!');
      return;
    }

    // Check for invalid amount (not a number)
    if (isNaN(amount)) {
      alert('Please enter a valid bet amount!');
      return;
    }

    num_lap = parseInt(document.getElementById('num_lap').value);
    bethorse = parseInt(document.getElementById('bethorse').value);

    if (funds < amount) {
      alert('Not enough funds!');
    } else if (num_lap <= 0) {
      alert('Number of lap must be greater than 0!');
    } else {
      // started the game
      this.disabled = true; // Disable the start button
      let tds = document.querySelector('#results .result'); // Get all cells of result table
      for (let i = 0; i < tds.length; i++) {
        tds[i].className = 'result'; // Reset results
      }

      document.getElementById('funds').innerText = funds;
      results = []; // Results array is to save the horse number s when the race is finished
      horse1.run();
      horse2.run();
      horse3.run();
      horse4.run();
    }
  };
});
