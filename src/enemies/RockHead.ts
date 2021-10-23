import { Sprite, Loader } from "pixi.js"
import { SCALE } from "../constants"
import { Enemy } from "./Enemy"

export class RockHead extends Enemy {
  speed = 5
  damage = 45

  public spritePadding = {
    t: 5 * SCALE,
    r: 5 * SCALE,
    b: 2 * SCALE,
    l: 5 * SCALE,
  }

  setup() {
    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["RockHead/RockHead.png"])
  }
}
