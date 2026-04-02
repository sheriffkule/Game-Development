let Ballon = function (arg) {
  let t0 = 0;
  let t = 0;
  let ctx = [
    arg.document.getElementById('c1').getContext('2d'),
    arg.document.getElementById('c2').getContext('2d'),
  ];
  let w = 480;
  let h = 360;
  let off = 20;
  let off_y_max = h + off;
  let off_y_min = 0 - off;
  let off_x_max = w + off;
  let off_x_min = 0 - off;
  let bal = [];
  let bg = [];
  let frag = [];
  let light = [];
  let water = [];
  let pt = [];
  let cnt_bg1 = 30;
  let bal_cnt = 0;
  let bal_cmb = 0;
  let bal_max = 0;
  let bal_rank = 1;
  let mvflag = 4;
  let sv = 1;
  let randflag = false;
  let ft = 0;
  let p = null;
  let state = 0;
  let score = 0;
  let loaded = 0;
  let in_l = 0;
  let in_r = 0;
  let in_f = 0;
  let spcnt = 0;
  let bgcol = ['#ff00ff', '#00ffff', '#ffff00'];
  let sp_name = ['bal'];
  let sp = [];
  let D = 16;
  let level = 1;
  let hi = [];

  let obj = function (base) {
    let th = {};
    lt.age = 0;
    th.size = base.size || D;
    th.x = base.x || 0;
    th.y = base.y || 0;
    th.v = base.v || 0;
    th.theta = base.theta || 0;
    th.isout = function () {
      return th.x < off_x_min || th.x > off_x_max || th.y < off_y_min || th.y > off_y_max;
    };
    th.tick0 = function () {
      if (mvflag === 4) th.x += th.v;
      if (mvflag === 6) th.x -= th.v;
      if (mvflag === 8) th.y -= th.v;
      if (mvflag === 2) th.y += th.v;
    };
    return th;
  };

  // Backbround stars
  let bg1 = function () {
    let th = obj(base);
    th.v = sv * (0.3 + Math.random() * 0.5);
    th.size = 2;
    th.tick = function () {
      th.age++;
      th.tick0();
      return th.age;
    };
    return th;
  };

  // fragment
  let bg2 = function (base) {
    let th = obj(base);
    th.v = 1 + Math.random() * 3;
    th.theta = (Math.random() * Math.PI * 4) / 3 + (Math.PI * 5) / 6;
    th.size = 4;
    th.tick = function () {
      if (th.v < 0) th.v = 0;
      th.x += th.v * Math.cos(th.theta) + p.vx / 2;
      th.y += th.v * Math.sin(th.theta) + 0.1 * th.age;
      th.age++;
      return th.age;
    };
    th.isout = function () {
      return th.age > base.life;
    };
    return th;
  };
};
