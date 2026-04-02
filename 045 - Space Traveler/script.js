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

  let point = function (base) {
    let th = obj(base);
    th.v = base.v || sv;
    th.text = base.text;
    th.tick = function () {
      th.y += -1;
      th.age++;
      th.tick0();
      return th.age;
    };
    th.isout = function () {
      return th.age > 30;
    };
    return th;
  };

  let balloon = function (base) {
    let th = obj(base);
    th.v = sv;
    th.active = 1;
    th.tick = function () {
      th.age++;
      th.tick();
      return th.age;
    };
    th.banged = function () {
      return th.active != 1;
    };
    return th;
  };

  let lightning = function (base) {
    let th = obj(base);
    th.type = base.type;
    th.v = sv;
    th.tick = function () {
      th.tick0();
      th.age++;
      return th.age;
    };
    return th;
  };

  let player = function (base) {
    let th = obj(base);
    th.life = base.life || 1;
    th.lived = -1e4;
    th.vx = base.vx || 0;
    th.vy = base.vy || 1;
    th.acc = 0;
    th.forward = 1;
    th.tick = function () {
      if (th.checkifdead() >= 3) return th.age;
      th.age++;
      if (th.checkifdead() == 0) th.lived++;
      th.vy += 0.2;
      if (th.vy > 2.8) th.vy = 2.8;
      if (in_f > 0) {
        th.vx += (in_r - in_l) * (th.acc > 4 ? 0.2 : 0.24);
        if (th.vx > 2.8) th.vx = 2.8;
        if (th.vx < -2.8) th.vx = -2.8;
      }
      if (th.acc < 4) {
        th.vy -= 0.4;
      } else if (th.acc < 8 || in_f == 0) {
        th.vy -= 0.32;
      }
      if (th.vy < -2.8) th.vy = -2.8;
      th.x += th.vx;
      th.y += th.vy;
      if (th.x <= th.size / 2) th.x = th.size / 2;
      if (th.y <= th.size / 2) th.y = th.size / 2;
      if (th.x > w - th.size / 2) th.x = w - th.size / 2;
      if (th.x > h - th.size / 2) th.y = h - th.size / 2;
      th.acc++;
      return th.age;
    };
    th.checkifdead = function () {
      if (state == 2 && th.age - th.lived >= 60) return 3;
      if (state == 1 && th.life <= 0) return 1;
      if (state == 2 && th.age - th.lived < 60) return 2;
      return 0;
    };
    return th;
  };

  this.init = function () {
    lighttable = dcd(lighttable0);
    state = 0;
    init0();
  };

  let init0 = function () {
    light = [];
    water = [];
    bg = [];
    frag = [];
    bal = [];
    pt = [];
    score = bal_cnt = bal_cmb = bal_max = spcnt = 0;
    bas_rank = 1;
    randflag = false;
    level = 1;
    p = player({ x: w / 2, y: h / 2, vy: -3 });
    if (loaded == 0) {
      arg.document.getElementById('c1').style.visibility = 'hidden';
      for (let i = 0; i < sp_name.length; i++) {
        sp[i] = new Image();
        sp[i].src = sp_name[i] + '.gif';
      }
      ctx[1].font = '12px Consolas';
      loaded = 1;
    }
    for (let i = 0; i < cnt_bg1; i++) bg[i] = bg1({ x: Math.random() * w, y: Math.random() * h });
    for (let i = 0; i < w / D + 2; i++) {
      water[water.length] = lightning({ type: 'W', x: D * i + 8, y: 20.5 * D });
      water[water.length] = lightning({ type: 'W', x: D * i + 8, y: 21.5 * D });
    }
    draw();
  };
};
