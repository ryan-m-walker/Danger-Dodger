import { Sprite, Loader, AnimatedSprite } from "pixi.js"
import { Enemy } from "./Enemy"

export class TestEnemy extends Enemy {
  speed = 8
  damage = 35

  setup() {
    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["RockHead/RockHead.png"])
  }

  update() {}

  afterInitialize() {
    this.sprite.y = 500
  }
}
