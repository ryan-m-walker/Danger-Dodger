import { Sprite, Loader } from "pixi.js"
import { SCALE } from "../constants"
import { Enemy } from "./Enemy"

export class SpikeHead extends Enemy {
  speed = 6
  damage = 35

  setup() {
    this.spritePadding = {
      t: 5 * SCALE,
      r: 12 * SCALE,
      b: 5 * SCALE,
      l: 12 * SCALE,
    }

    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["spikeHead/spikeHead.png"])
  }
}
