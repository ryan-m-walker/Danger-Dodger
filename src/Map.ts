import { Container, Sprite, Loader } from "pixi.js"
import { Resources, SCALE } from "./constants"

export class GameMap extends Container {
  sprite: Sprite

  constructor() {
    super()

    const spriteSheet = Loader.shared.resources[Resources.SPRITES].spritesheet
    this.sprite = Sprite.from(spriteSheet.textures["map2.png"])
    this.sprite.scale.set(SCALE, SCALE)
    this.addChild(this.sprite)
  }
}
