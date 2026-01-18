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
