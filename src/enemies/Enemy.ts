import { Container, AnimatedSprite, Ticker, Sprite } from "pixi.js"
import { MotionBlurFilter } from "pixi-filters"
import * as uuid from "uuid"
import { SCALE } from "../constants"

export class Enemy extends Container {
  private readonly screenHeight: number

  public spritePadding = {
    t: 0,
    r: 0,
    b: 0,
    l: 0,
  }

  damage = 25

  sprite: AnimatedSprite | Sprite
  speed = 6
  id = uuid.v4()

  constructor(x: number, screenHeight: number) {
    super()
    this.screenHeight = screenHeight
    this.setup()
    this.sprite.scale.set(SCALE, SCALE)
    this.sprite.x = x
    this.sprite.y = -40
    this.sprite.filters = [new MotionBlurFilter([0, 10])]
    this.addChild(this.sprite)
    Ticker.shared.add(this.update, this)
    this.afterInitialize()
  }

  setup() {}

  afterInitialize() {}

  update(deltaTime: number) {
    this.sprite.y += this.speed + deltaTime
  }

  remove() {
    Ticker.shared.remove(this.update, this)
    this.destroy()
  }

  getHitBox() {
    const localBounds = this.getLocalBounds()
    return {
      x: localBounds.x + this.spritePadding.l,
      y: localBounds.y + this.spritePadding.t,
      w: localBounds.width - this.spritePadding.l - this.spritePadding.r,
      h: localBounds.height - this.spritePadding.b - this.spritePadding.t,
    }
  }
}
