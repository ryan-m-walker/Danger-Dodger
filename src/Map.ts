import { Container, Sprite, Loader } from "pixi.js"
import { SCALE } from "./constants"

export class GameMap extends Container {
  sprite: Sprite

  constructor() {
    super()

    this.sprite = Sprite.from(Loader.shared.resources["floor"].texture)
    this.sprite.scale.set(SCALE, SCALE)
    this.addChild(this.sprite)
  }
}
