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

function Obstacle(lanes, laneNo) {
  let _this = this;
  this._init = function () {
    this.element = document.createElement('img');
    this.laneNo = laneNo;
    this.lanes = lanes;
    this.element.className = 'obstacle';
    this.element.setAttribute('src', 'images/obstacle.png');
    this.lane[laneNo].appendChild(this.element);
    this.dynamicMarginTop = 1;
  };

  this._init();
}

function ObstacleManager(lanes, car) {
  let _this = this;
  this._init = function () {
    this.lanes = lanes;
    this.car = car;
    this.obstacles = [];
  };

  this.generateObstacles = function () {
    _this.obstacleGeneratorId = setInterval(_this._generateObstacle, OBSTACLE_APPEARANCE_GAP);
  };

  this._generateObstacle = function () {
    if (_this.obstacles.length < 3) {
      let laneNo;
      laneNo = Util().getRandomInt(0, _this.lanes.length - 1);
      let obstacle = new Obstacle(_this.lanes, laneNo);
      _this.obstacles.push(obstacle);

      return obstacle;
    }
  };

  this.refreshObstacles = function () {
    let updateObstacles = [];
    for (let i = 0; i < _this.obstacles.length; i++) {
      _this.obstacles[i].element.style.top = _this.obstacles[i].dynamicMarginTop + 'px';
      if (!(parseInt(_this.obstacles[i].element.style.top) > NFS_HEIGHT - CAR_BOTTOM)) {
        _this.obstacles[i].dynamicMarginTop += PX_DX;
        updateObstacles.push(_this.obstacles[i]);
      } else {
        _this.obstacles[i].element.parentElement.removeChild(_this.obstacles[i].element);
        for (let j = 0; j < _this.obstacles.length; j++) {
          if (_this.obstacles[j].element.parentElement === _this.obstacles[i].element.parentElement) {
            _this.obstacles[j].element.style.top =
              _this.obstacles[j].dynamicMarginTop + OBSTACLE_HEIGHT + 'px';
          }
        }
      }
    }
    _this.obstacles = updateObstacles;
  };

  this.removeObstacle = function (obstacle) {
    let index = this.obstacle.indexOf(obstacle);

    if (index !== -1) {
      this.obstacles[index].element.parentElement.removeChild(this.obstacles[index].element);
      this.obstacles.splice(index, 1);
    }
  };

  this.getOldestObstacleInLane = function () {
    let obstacle;
    for (let i = 0; i < _this.obstacles.length; i++) {
      if (_this.obstacles[i].laneNo === bulletLane) {
        if (obstacle === undefined || _this.obstacles[i].dynamicMarginTop > obstacle.dynamicMarginTop) {
          obstacle = _this.obstacles[i];
        }
      }
    }

    return obstacle;
  };

  this.stop = function () {
    if (this.obstacleGeneratorId) {
      clearInterval(this.obstacleGeneratorId);
      this.obstacleGeneratorId = false;
    }
  };

  this._init();
}

function CollisionHandler(car, obstacleManager) {
  let _this = this;
  this._init = function () {
    this.car = car;
    this.obstacleManager = obstacleManager;
  };

  this.checkCollisions = function () {
    for (let i = 0; i < _this.obstacleManager.obstacles.length; i++) {
      return _this._checkCollision(_this.obstacleManager.obstacles[i]);
    }
  };

  this._checkCollision = function (obstacle0) {
    if (
      obstacle0.dynamicMarginTop + OBSTACLE_HEIGHT > NFS_HEIGHT - CAR_HEIGHT &&
      obstacle0.laneNo === _this.car.currentLane
    ) {
      return true;
    }
  };

  this.checkShot = function () {
    let bulletLane;

    for (let i = 0; i < _this.obstacleManager.lanes.length; i++) {
      if (_this.obstacleManager.lanes[i].getElementByClassName('bullets').length > 0) {
        bulletLane = i;
        break;
      }
    }

    let oldestObstacleInCurrentLane = obstacleManager.getOldestObstacleInLane(bulletLane);
    if (oldestObstacleInCurrentLane !== undefined && _this.car.gun.bullets !== undefined) {
      if (
        _this.car.gun.dynamicBulletBottom +
          oldestObstacleInCurrentLane.dynamicMarginTop +
          CAR_HEIGHT +
          OBSTACLE_HEIGHT >
        NFS_HEIGHT
      ) {
        _this.car.gun.stop();
        _this.car.enableGun();
        _this.obstacleManager.removeObstacle(oldestObstacleInCurrentLane);
      }
    }
    if (_this.car.gun.dynamicBulletBottom + CAR_HEIGHT > NFS_HEIGHT) {
      _this.car.gun.stop();
      _this.car.enableGun();
    }
  };

  this._init();
}

function Car(currentLane, lanes) {
  let _this = this;
  this._init = function () {
    this.currentLane = currentLane;
    this.lanes = lanes;
    this.element = document.createElement('img');
    this.element.className = 'car';
    this.element.setAttribute('src', 'images/car.png');
    this.lanes[this.currentLane].appendChild(this.element);
    this.gun = new Gun(this.lanes);
  };

  this._changeLane = function (laneNumber) {
    if (_this.currentLane !== laneNumber) {
      _this.lanes[laneNumber].appendChild(_this.element);
    }
    if (_this.currentLane > laneNumber) {
      _this.currentLane--;
    } else if (_this.currentLane < laneNumber) {
      _this.currentLane++;
    }
  };

  this._keyNavigation = function (e) {
    switch (e.which) {
      case 37:
        _this._changeLane(_this.currentLane - 1 < 0 ? 0 : _this.currentLane - 1);
        break;
      case 39:
        _this._changeLane(
          _this.currentLane + 1 > _this.lanes.length - 1 ? _this.lanes.length - 1 : _this.currentLane + 1,
        );
        break;
      default:
        return;
    }
  };

  this._fireGunEvent = function (e) {
    switch (e.which) {
      case 32:
        _this._disableGun();
        _this.gun.fireBullets(_this.currentLane);
        break;
    }
  };

  this.enableGun = function () {
    document.addEventListener('keyup', this._fireGunEvent, false);
  };

  this._disableGun = function () {
    document.removeEventListener('keyup', this._fireGunEvent, false);
  };

  this._initEvents = function () {
    document.addEventListener('keydown', this._keyNavigation, false);
    this.enableGun();
  };

  this._removeEvents = function () {
    document.removeEventListener('keydown', this._keyNavigation, false);
    this._disableGun();
  };

  this.stop = function () {
    _this._removeEvents();
  };

  this._init();
}
