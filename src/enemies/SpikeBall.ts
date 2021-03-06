import { Sprite, Loader } from "pixi.js"
import { SCALE } from "../constants"
import { Enemy } from "./Enemy"

export class SpikeBall extends Enemy {
  speed = 8
  damage = 15

  setup() {
    this.spritePadding = {
      t: 0,
      r: 5 * SCALE,
      b: 0,
      l: 5 * SCALE,
    }

    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["spikeBall/spikeBall.png"])
  }
}
