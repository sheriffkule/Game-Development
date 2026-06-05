// Cars
let car = document.getElementById('car');
car.init = function () {
  car.speed = 0.2;
  car.turn = 0;
  car.x = car.offsetLeft;
  car.y = 0;
  car.width = car.offsetWidth;
  car.height = car.offsetHeight;
  car.maxSpeed = 8;
  car.km = 0;
  car.motor = 1;
  car.crashed = false;
  car.acc = 0.02;
  car.break = 0.01;
};

car.frame = function () {
  car.motor *= -1;
  car.style.left = parseInt(car.x) + 'px';
  car.style.transform = 'scaleX(' + car.motor + ')';
  car.steer();
};

car.steer = function () {
  car.x += car.sx;
  road.P0.x -= car.sx;
  road.P1.x -= car.sx;
  road.P2.x -= car.sx;
  road.x -= car.sx;
  cars.x -= car.sx;
};

car.crash = function (d) {
  if (!car.crashed) {
    car.crashed = true;
    car.speed = 0.2;
    car.sx = d ? d : 0;
    game.audio.oscillator.frequency.value = 15;
    setTimeout(() => {
      game.audio.oscillator.frequency = 60;
      car.crashed = false;
      car.sx = 0;
    }, 800);
  }
};

let cars = document.getElementById('cars');
cars.init = function () {
  cars.n = 32;
  cars.x = 0;
  cars.speed = 1;
  cars.interval = 500;
  cars.opponents = [];
  cars.easy = 0.2;

  for (let j = 0; j < cars.n; j++) {
    cars.opponents[j] = [];
    for (let i = 0; i < 3; i++) {
      cars.opponents[j][i] = cars.create(i, j);
    }
  }

  car.st = document.createElement('style');
  car.st.innerHTML = '#cars .car {transform: scaleX(1) rotateX(-57deg)}';
  document.body.appendChild('car.st');
};

cars.frame = function () {
  let relative = cars.speed - car.speed;
  for (let j = 0; j < cars.n; j++) {
    for (let i = 0; i < 3; i++) {
      let c = cars.opponents[j][i];
      let d = road.width * 0.42;
      w = road.width - d - car.width;
      c.x = (road.P0.x - road.height - 40) * (c.y * c.y * 0.000006) + d / 2 + i * (w / 2);
      c.y += relative;
      let h = cars.n * car.height * 3;

      if (!c.classList.contains('hidden') & (c.y < car.height + 5) && c.y > 5) {
        // Collision
        if (car.x < 130 && i == 0) car.crash(0.1);
        if (car.x > 150 && car.x < 162 && i == 1) car.crash();
        if (car.x > 148 && i == 2) car.crash();
      }

      if (c.y > h) {
        // back to bottom
        cars.color(c);
        c.classList.remove('hidden');
        if (car.x < 120 && i == 0) c.classList.add('hidden');
        if (car.x > 115 && car.x < 160 && i == 1) c.classList.add('hidden');
        if (car.x > 155 && i == 2) c.classList.add('hidden');
        if (Math.random() > cars.easy) c.classList.add('hidden');
        if (!c.classList.contains('hidden')) car.position++;
        c.y = 0;
      } else if (c.y < 0) {
        // Passing
        if (!c.classList.contains('hidden')) {
          car.position--;
        }
        cars.color(c);
        c.classList.remove('hidden');
        if (Math.random() > cars.easy) c.classList.add('hidden');
        c.y = h;
        cars.color(c);
      }
      c.style.left = parseInt(c.x) + 'px';
      c.style.bottom = parseInt(c.y) + 'px';
      let o = 1 / (c.y * fog.value);
      c.style.opacity = o > 1 ? 1 : o;
    }

    if (
      !cars.opponents[j][0].classList.contains('hidden') &&
      !cars.opponents[j][1].classList.contains('hidden') &&
      !cars.opponents[j][2].classList.contains('hidden')
    ) {
      cars.opponents[j][parseInt(Math.random() * 3)].classList.add('hidden');
    }
  }

  car.st.innerHTML = '#cars .car {transform: scaleX(' + car.motor + ') rotateX(-57deg)}';
};
