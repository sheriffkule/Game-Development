import { GameObject } from './gameObject.js';

export class Hero extends GameObject {
  constructor({game, sprite, position, scale}) {
    super({game, sprite, position, scale});
  }
}
