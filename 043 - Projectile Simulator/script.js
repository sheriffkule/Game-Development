class Projectile {
  element;
  x;
  y;
  g;
  horizontalRange;
  maxHeight;
  actualHorizontalRange;

  constructor(element, x, y) {
    this.element = element;
    this.x = x;
    this.y = y;
  }
  moveHorizontal(speed) {
    let intervalHorizontal = setInterval(() => {
      if (this.x >= this.horizontalRange) {
        if (this.y > 0) {
          this.horizontalRange *= 2;
        } else {
          clearInterval(intervalHorizontal);

          let xDist = document.createElement('div');
          let text = document.createTextNode(this.actualHorizontalRange);
          xDist.appendChild(text);
          xDist.classList.add('xDist');
          xDist.style.left = this.x + 'px';
          xDist.style.bottom = this.y + 'px';
          this.element.parentElement.appendChild(xDist);
        }
        return; // Prevent further execution after clearing interval
      }

      if (this.x % 25 === 0) {
        let path = document.createElement('div');
        path.classList.add('path');
        path.style.left = this.x + 'px';
        path.style.bottom = this.y + 'px';
        this.element.parentElement.appendChild(path);
      }

      this.x++;
      this.element.style.left = this.x + 'px';
    }, 500 / speed);
  }
  moveVertical(velocity) {
    let self = this;
    let interval = () =>
      new Promise((resolve) => {
        let intervalUp = () => {
          // velocity -= this.g * 1 / velocity
          velocity = Math.sqrt(Math.max(0, velocity * velocity - 2 * self.g));

          if (self.y >= self.maxHeight || isNaN(velocity) || velocity <= 0) {
            let yDist = document.createElement('div');
            let text = document.createTextNode(self.maxHeight);
            yDist.appendChild(text);
            yDist.classList.add('yDist');
            yDist.style.left = self.x + 'px';
            yDist.style.bottom = self.y + 'px';
            self.element.parentElement.appendChild(yDist);
            resolve();
            return;
          }
          self.y++;
          self.element.style.bottom = self.y + 'px';
          setTimeout(intervalUp, 500 / Math.max(1, velocity));
        };

        setTimeout(intervalUp, 500 / Math.max(1, velocity));
      });

    interval().then(() => {
      let intervalDown = () => {
        // velocity += this.g * 1 / velocity
        velocity = Math.sqrt(velocity * velocity + 2 * self.g);

        if (self.y <= 0) {
          self.horizontalRange = self.x;
          return;
        }
        self.y--;
        self.element.style.bottom = self.y + 'px';
        setTimeout(intervalDown, 500 / Math.max(1, velocity));
      };
      velocity = 1; // Avoid division by zero
      intervalDown();
    });
  }
}

let initVelocity = document.getElementById('velocity');
let angle = document.getElementById('angle');

let launch = document.getElementById('launch');
let reset = document.getElementById('reset');

let projectileOb = new Projectile(document.getElementById('projectile'), 0, 0);

launch.onclick = () => {
  let initVelocityValue = parseInt(initVelocity.value);
  let angleValue = parseInt(angle.value);

  if (
    !isNaN(initVelocityValue) &&
    !isNaN(angleValue) &&
    initVelocityValue > 0 &&
    angleValue > 0 &&
    angleValue <= 90 &&
    !projectileOb.x &&
    !projectileOb.y
  ) {
    projectileOb.g = 9.81;

    let vx = initVelocityValue * Math.cos((Math.PI * angleValue) / 180);
    let vy0 = initVelocityValue * Math.sin((Math.PI * angleValue) / 180);
    let maxHeight = Math.round((vy0 * vy0) / (2 * projectileOb.g));
    let horizontalRange = Math.round(vx * ((2 * vy0) / projectileOb.g));

    projectileOb.maxHeight = maxHeight;
    projectileOb.horizontalRange = horizontalRange;
    projectileOb.actualHorizontalRange = horizontalRange;

    if (Math.floor(vx) > 0) projectileOb.moveHorizontal(vx);
    projectileOb.moveVertical(vy0);
  }
};

window.onload = () => {
  initVelocity.value = '';
  angle.value = '';
};

reset.onclick = () => {
  initVelocity.value = '';
  angle.value = '';
  projectileOb.x = 0;
  projectileOb.y = 0;
  projectileOb.element.style.left = '0px';
  projectileOb.element.style.bottom = '0px';

  let elements = document.getElementsByClassName('path');
  while (elements.length > 0) elements[0].parentNode.removeChild(elements[0]);

  let yDist = document.getElementsByClassName('yDist');
  while (yDist.length > 0) yDist[0].parentNode.removeChild(yDist[0]);
  let xDist = document.getElementsByClassName('xDist');
  while (xDist.length > 0) xDist[0].parentNode.removeChild(xDist[0]);
};
