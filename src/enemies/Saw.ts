import { Container, AnimatedSprite, Loader, Ticker } from "pixi.js"
import { SCALE } from "../constants"
import { Enemy } from "./Enemy"

export class Saw extends Enemy {
  speed = 5

  setup() {
    this.spritePadding = {
      t: 0,
      r: 5 * SCALE,
      b: 0,
      l: 5 * SCALE,
    }

    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = new AnimatedSprite(spriteSheet.animations["saw/saw"])
    if (this.sprite instanceof AnimatedSprite) {
      this.sprite.animationSpeed = 0.65
      this.sprite.play()
    }
  }
}
