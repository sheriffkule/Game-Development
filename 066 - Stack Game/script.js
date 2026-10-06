'use strict';
class Stage {
  constructor() {
    // container
    this.render = function () {
      this.renderer.render(this.scene, this.camera);
    };
    this.add = function (elem) {
      this.scene.add(elem);
    };
    this.remove = function (elem) {
      this.scene.remove(elem);
    };
    this.container = document.getElementById('game');
    // renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
  }
}
