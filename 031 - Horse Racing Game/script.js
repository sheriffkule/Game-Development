// Create a JS Object for a horse with 3 parameters: HTML, ID, position x and y
function Horse(id, x, y) {
  this.element = document.getElementById(id); // html element of the horse
  this.speed = Math.random() * 10 + 10; // random speed for each horse
  this.originalX = x; // original x position
  this.originalY = y; // original y position
  this.x = x;
  this.y = y;
  this.number = parseInt(id.replace(/[\D]/g, '')); // number of horse (1,2,3,4)
  this.lap = 0; // current lap of the horse

  this.moveRight = function () {
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
  };

  // Do the same for moveDown, moveLeft, moveUp
  this.moveDown = function () {
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
  };
  this.moveLeft = function () {
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
  };
  this.moveUp = function () {
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
  };

  // Trigger the horse by run
  this.run = function () {
    this.element.className = 'horse runRight';
    this.moveRight();
  };
  this.arrive = function () {
    // Stop the horse run by change class to standRight
    this.element.className = 'horse standRight';
    this.lap = 0; // Reset the lap
  };
}
