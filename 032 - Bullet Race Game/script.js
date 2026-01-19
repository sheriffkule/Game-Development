let NFS_HEIGHT = 500;
let CAR_BOTTOM = 10;
let CAR_HEIGHT = 80 + CAR_BOTTOM;
let CAR_WIDTH = 40;
let OBSTACLE_WIDTH = 100;
let OBSTACLE_HEIGHT = 33.328;
let OBSTACLE_APPEARANCE_GAP = 1000;
let OBSTACLE_APPEARANCE_DX = 100;
let PX_DX = 3;
let PX_DX_DX = 0.05;
let GAME_TIME = 1;
let GAME_TIME_DX = 11;
let INITIAL_BULLETS_BOTTOM = CAR_HEIGHT;

function Util() {}

Util.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

class Obstacle {
  constructor(lanes, laneNo) {
    this.element = document.createElement('img');
    this.laneNo = laneNo;
    this.lanes = lanes;
    this.element.className = 'obstacle';
    this.element.setAttribute('src', 'images/obstacle.png');
    this.lanes[laneNo].appendChild(this.element);
    this.dynamicMarginTop = 1;
  }
}

class ObstacleManager {
  constructor(lanes, car) {
    this.lanes = lanes;
    this.car = car;
    this.obstacles = [];
  }

  generateObstacles() {
    this.obstacleGeneratorId = setInterval(this._generateObstacle.bind(this), OBSTACLE_APPEARANCE_GAP);
  }

  _generateObstacle() {
    if (this.obstacles.length < 3) {
      let laneNo = Util.getRandomInt(0, this.lanes.length - 1);
      let obstacle = new Obstacle(this.lanes, laneNo);
      this.obstacles.push(obstacle);
      return obstacle;
    }
  }

  refreshObstacles() {
    let updateObstacles = [];
    for (let i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].element.style.top = this.obstacles[i].dynamicMarginTop + 'px';
      if (!(parseInt(this.obstacles[i].element.style.top) > NFS_HEIGHT - CAR_BOTTOM)) {
        this.obstacles[i].dynamicMarginTop += PX_DX;
        updateObstacles.push(this.obstacles[i]);
      } else {
        // Obstacle passed - award 10 points
        if (window.nfs) {
          window.nfs.addScore(10);
        }
        this.obstacles[i].element.parentElement.removeChild(this.obstacles[i].element);
        for (let j = 0; j < this.obstacles.length; j++) {
          if (this.obstacles[j].element.parentElement === this.obstacles[i].element.parentElement) {
            this.obstacles[j].element.style.top = this.obstacles[j].dynamicMarginTop + OBSTACLE_HEIGHT + 'px';
          }
        }
      }
    }
    this.obstacles = updateObstacles;
  }

  removeObstacle(obstacle) {
    let index = this.obstacles.indexOf(obstacle);
    if (index !== -1) {
      // Remove from DOM
      if (obstacle.element && obstacle.element.parentElement) {
        obstacle.element.parentElement.removeChild(obstacle.element);
      }
      // Remove from array
      this.obstacles.splice(index, 1);
    }
  }

  getOldestObstacleInLane(bulletLane) {
    let obstacle;
    for (let i = 0; i < this.obstacles.length; i++) {
      if (this.obstacles[i].laneNo === bulletLane) {
        if (obstacle === undefined || this.obstacles[i].dynamicMarginTop > obstacle.dynamicMarginTop) {
          obstacle = this.obstacles[i];
        }
      }
    }
    return obstacle;
  }

  stop() {
    if (this.obstacleGeneratorId) {
      clearInterval(this.obstacleGeneratorId);
      this.obstacleGeneratorId = false;
    }
  }
}

class CollisionHandler {
  constructor(car, obstacleManager) {
    this.car = car;
    this.obstacleManager = obstacleManager;
  }

  checkCollisions() {
    for (let i = 0; i < this.obstacleManager.obstacles.length; i++) {
      if (this._checkCollision(this.obstacleManager.obstacles[i])) {
        return true;
      }
    }
    return false;
  }

  _checkCollision(obstacle0) {
    if (
      obstacle0.dynamicMarginTop + OBSTACLE_HEIGHT > NFS_HEIGHT - CAR_HEIGHT &&
      obstacle0.laneNo === this.car.currentLane
    ) {
      return true;
    }
  }

  checkShot() {
    let bulletLane;

    for (let i = 0; i < this.obstacleManager.lanes.length; i++) {
      if (this.obstacleManager.lanes[i].getElementsByClassName('bullets').length > 0) {
        bulletLane = i;
        break;
      }
    }

    let oldestObstacleInCurrentLane = this.obstacleManager.getOldestObstacleInLane(bulletLane);
    if (oldestObstacleInCurrentLane !== undefined && this.car.gun.bullets !== undefined) {
      if (
        this.car.gun.dynamicBulletBottom +
          oldestObstacleInCurrentLane.dynamicMarginTop +
          CAR_HEIGHT +
          OBSTACLE_HEIGHT >
        NFS_HEIGHT
      ) {
        // Obstacle destroyed - award 20 points
        if (window.nfs) {
          window.nfs.addScore(20);
        }
        this.car.gun.stop();
        this.car.enableGun();
        this.obstacleManager.removeObstacle(oldestObstacleInCurrentLane);
      }
    }
    if (this.car.gun.dynamicBulletBottom + CAR_HEIGHT > NFS_HEIGHT) {
      this.car.gun.stop();
      this.car.enableGun();
    }
  }
}

class Car {
  constructor(currentLane, lanes) {
    this.currentLane = currentLane;
    this.lanes = lanes;
    this.element = document.createElement('img');
    this.element.className = 'car';
    this.element.setAttribute('src', 'images/car.png');
    this.lanes[this.currentLane].appendChild(this.element);
    this.gun = new Gun(this.lanes);
  }

  _changeLane(laneNumber) {
    if (this.currentLane !== laneNumber) {
      this.currentLane = laneNumber;
      this.lanes[laneNumber].appendChild(this.element);
    }
  }

  _keyNavigation(e) {
    switch (e.which) {
      case 37:
        this._changeLane(this.currentLane - 1 < 0 ? 0 : this.currentLane - 1);
        break;
      case 39:
        this._changeLane(
          this.currentLane + 1 > this.lanes.length - 1 ? this.lanes.length - 1 : this.currentLane + 1,
        );
        break;
      case 32:
        e.preventDefault();
        break;
      default:
        return;
    }
  }

  _fireGunEvent(e) {
    switch (e.which) {
      case 32:
        e.preventDefault();
        this._disableGun();
        this.gun.fireBullets(this.currentLane);
        break;
    }
  }

  enableGun() {
    document.addEventListener('keyup', this._fireGunEvent.bind(this), false);
  }

  _disableGun() {
    document.removeEventListener('keyup', this._fireGunEvent.bind(this), false);
  }

  _initEvents() {
    document.addEventListener('keydown', this._keyNavigation.bind(this), false);
    this.enableGun();
  }

  _removeEvents() {
    document.removeEventListener('keydown', this._keyNavigation.bind(this), false);
    this._disableGun();
  }

  stop() {
    this._removeEvents();
  }
}

class Gun {
  constructor(lanes) {
    this.lanes = lanes;
    this.bullets = undefined;
    this.bulletId = undefined;
    this.bulletLane = undefined;
    this.dynamicBulletBottom = 0;
  }

  fireBullets(currentLane) {
    // Only fire if no bullet exists
    if (this.bullets !== undefined) {
      return;
    }

    let bulletElement = document.createElement('img');
    bulletElement.setAttribute('src', 'images/bullets.png');
    bulletElement.className = 'bullets';
    this.lanes[currentLane].appendChild(bulletElement);
    
    this.bullets = bulletElement;
    this.bulletLane = currentLane;
    this.dynamicBulletBottom = INITIAL_BULLETS_BOTTOM;

    this.bulletId = requestAnimationFrame(this.animateFireBullets.bind(this));
  }

  animateFireBullets() {
    if (!this.bullets) return;
    
    this.dynamicBulletBottom += PX_DX;
    this.bullets.style.bottom = this.dynamicBulletBottom + 'px';

    this.bulletId = requestAnimationFrame(this.animateFireBullets.bind(this));
  }

  stop() {
    if (this.bulletId) {
      cancelAnimationFrame(this.bulletId);
      this.bulletId = undefined;
    }
    if (this.bullets && this.bullets.parentElement) {
      this.bullets.parentElement.removeChild(this.bullets);
    }
    this.bullets = undefined;
    this.bulletLane = undefined;
    this.dynamicBulletBottom = 0;
  }
}

function disableTextSelection() {
  const style = document.createElement('style');
  style.innerHTML = 'body {user-select:none}';
  document.head.appendChild(style);
}

disableTextSelection();

class NFS {
  constructor() {
    this.lanes = document.getElementsByClassName('lane');
    this.container = document.getElementById('container');
    this.obstacles = [];
    this.car = new Car(Util.getRandomInt(0, this.lanes.length - 1), this.lanes);
    this.obstacleManager = new ObstacleManager(this.lanes, this.car);
    this.collisionHandler = new CollisionHandler(this.car, this.obstacleManager);

    this.dynamicBackgroundPositionY = 1;
    this.score = 0;
    this.roadDistance = 0;

    document.getElementById('toggle').addEventListener('click', () => {
      if (document.getElementById('toggle').innerHTML === 'Start') {
        this.score = 0;
        this.roadDistance = 0;
        this.addScore(0); // Reset display
        this.obstacleManager.generateObstacles();
        this.play();
        this.car._initEvents();
        this._startTime();
        document.getElementById('toggle').innerHTML = 'Pause';
      } else if (document.getElementById('toggle').innerHTML === 'Pause') {
        this.stop();
        document.getElementById('toggle').innerHTML = 'Start';
      }
    });
  }

  _startTime() {
    this.timeId = setInterval(function () {
      GAME_TIME++;
    }, 1000);
  }

  _stopTime() {
    if (this.timeId) {
      clearInterval(this.timeId);
      this.timeId = false;
    }
  }

  addScore(points) {
    this.score += points;
    document.getElementById('score').innerText = this.score;
  }

  play() {
    this.dynamicBackgroundPositionY += PX_DX;
    this.container.style.backgroundPositionY = this.dynamicBackgroundPositionY + 'px';

    // Track road distance for scoring (1 point per 2000px)
    this.roadDistance += PX_DX;
    if (this.roadDistance >= 2000) {
      this.addScore(1);
      this.roadDistance = 0;
    }

    this.obstacleManager.refreshObstacles();

    if (GAME_TIME % GAME_TIME_DX === 0) {
      PX_DX += PX_DX_DX;
      OBSTACLE_APPEARANCE_GAP -= OBSTACLE_APPEARANCE_DX;
    }

    this.playId = window.requestAnimationFrame(this.play.bind(this));

    if (this.collisionHandler.checkCollisions()) {
      this.gameOver();
    }

    this.collisionHandler.checkShot();
  }

  gameOver() {
    let gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = `GAME OVER<br>Your Score: ${this.score}`;
    this.container.appendChild(gameOver);
    this.stop();
    if (confirm('GameOver! Restart Game Y/N')) {
      window.location = 'index.html';
    }
  }

  stop() {
    this.obstacleManager.stop();
    window.cancelAnimationFrame(this.playId);
    this.car.stop();
    this._stopTime();
  }
}

let nfs = new NFS();
window.nfs = nfs;
