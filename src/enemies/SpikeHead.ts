import { Sprite, Loader } from "pixi.js"
import { SCALE } from "../constants"
import { Enemy } from "./Enemy"

export class SpikeHead extends Enemy {
  speed = 8
  damage = 35

  spritePadding = {
    t: 5 * SCALE,
    r: 12 * SCALE,
    b: 5 * SCALE,
    l: 12 * SCALE,
  }

  setup() {
    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["SpikeHead/SpikeHead.png"])
  }
}
