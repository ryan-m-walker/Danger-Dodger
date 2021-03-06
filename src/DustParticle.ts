import { Container, Sprite, Loader, Ticker } from "pixi.js"
import { Resources, SCALE } from "./constants"
import GameState from "./GameState"
import { getRandomFloat, getRandomInt } from "./random"

export class DustParticle extends Container {
  sprite: Sprite
  lifeSpan: number
  life: number = 0

  constructor(x: number, y: number) {
    super()

    const spriteSheet = Loader.shared.resources[Resources.SPRITES]
    this.sprite = Sprite.from(spriteSheet.textures["dustParticle.png"])

    const gitterX = getRandomFloat(-4, 4)
    const gitterY = getRandomFloat(-4, 4)

    this.sprite.x = x + gitterX
    this.sprite.y = y + gitterY
    this.sprite.anchor.set(0.5, 0.5)

    const scale = getRandomFloat(0.25 * SCALE, 0.5 * SCALE)
    this.sprite.scale.set(scale, scale)
    this.sprite.alpha = 0.9

    this.lifeSpan = getRandomInt(20, 50)

    this.addChild(this.sprite)

    Ticker.shared.add(this.update, this)
  }

  update(deltaTime: number) {
    if (GameState.state.isPaused) {
      return
    }

    this.life += 1
    const newScale = this.sprite.scale.x + 0.01
    this.sprite.scale.set(newScale, newScale)

    this.sprite.alpha = this.sprite.alpha - 0.02

    if (this.life >= this.lifeSpan) {
      this.remove()
    }
  }

  remove() {
    Ticker.shared.remove(this.update, this)
    this.sprite.destroy()
    this.destroy()
  }
}
