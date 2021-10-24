import { Sprite, Loader, AnimatedSprite } from "pixi.js"
import { Saw } from "./Saw"
import { SpikeHead } from "./SpikeHead"

export class TestEnemy extends SpikeHead {
  speed = 8
  damage = 35

  setup() {
    const spriteSheet = Loader.shared.resources.sprites.spritesheet
    // this.sprite = Sprite.from(spriteSheet.textures["saw/saw_01.png"])
    this.sprite = Sprite.from(spriteSheet.textures["spikeHead/spikeHead.png"])
  }

  update() {}

  afterInitialize() {
    this.sprite.y = 350
  }
}
