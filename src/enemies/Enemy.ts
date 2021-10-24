import { Container, AnimatedSprite, Ticker, Sprite } from "pixi.js"
import { MotionBlurFilter } from "pixi-filters"
import * as uuid from "uuid"
import { SCALE } from "../constants"
import SceneManager from "../SceneManager"

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

  private hitBoxWidth: number
  private hitBoxHeight: number

  constructor(x: number) {
    super()
    this.screenHeight = SceneManager.app.screen.height
    this.setup()
    this.sprite.scale.set(SCALE, SCALE)
    this.sprite.x = x
    this.sprite.y = -40
    this.sprite.filters = [new MotionBlurFilter([0, 10])]
    this.sprite.anchor.set(0.5, 0.5)
    this.addChild(this.sprite)

    this.hitBoxWidth =
      this.sprite.width - this.spritePadding.l - this.spritePadding.r
    this.hitBoxHeight =
      this.sprite.height - this.spritePadding.t - this.spritePadding.b

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
    const globalPosition = this.sprite.getGlobalPosition()
    return {
      x: globalPosition.x - this.sprite.width * 0.5 + this.spritePadding.l,
      y: globalPosition.y - this.sprite.height * 0.5 + this.spritePadding.t,
      w: this.hitBoxWidth,
      h: this.hitBoxHeight,
    }
  }
}
