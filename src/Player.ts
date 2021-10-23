import {
  Container,
  AnimatedSprite,
  Loader,
  Spritesheet,
  Ticker,
  Graphics,
} from "pixi.js"

import { Enemy } from "./enemies/Enemy"
import GameState from "./GameState"
import Input from "./Input"
import { Key } from "./Key"
import { Vector } from "./Vector"
import { getRandomInt } from "./random"
import { DustParticle } from "./DustParticle"
import { SCALE } from "./constants"

const FRICTION = 0.5
const ACCELERATION = 0.75
const MAX_VELOCITY = 6

const SPRITE_PADDING_H = 6 * SCALE
const SPRITE_PADDING_V = 8 * SCALE

enum PlayerState {
  RUNNING,
  JUMPING,
  IDLE,
  INJURED,
}

export class Player extends Container {
  sortableChildren = true

  hitBox: Graphics

  private readonly windowWidth: number
  private readonly windowHeight: number

  sprite: AnimatedSprite
  private spriteSheet: Spritesheet
  private playerState = PlayerState.IDLE

  private velocity = new Vector(0, 0)
  private acceleration = new Vector(0, 0)
  private direction = 1
  private isInjured = false

  private hitBoxWidth: number
  private hitBoxHeight: number

  constructor(windowWidth: number, windowHeight: number) {
    super()

    this.windowWidth = windowWidth
    this.windowHeight = windowHeight

    this.spriteSheet = Loader.shared.resources["sprites"].spritesheet
    this.sprite = new AnimatedSprite(this.spriteSheet.animations["Player/Idle"])
    this.sprite.animationSpeed =
      this.spriteSheet.animations["Player/Idle"].length / 60
    this.sprite.scale.set(SCALE, SCALE)
    this.sprite.x = this.windowWidth / 2
    this.sprite.y = this.windowHeight - this.sprite.height * 2
    this.sprite.anchor.set(0.5, 1)
    this.sprite.zIndex = 100

    this.sprite.play()

    this.hitBoxWidth = this.sprite.width - SPRITE_PADDING_H * 2
    this.hitBoxHeight = this.sprite.height - SPRITE_PADDING_V

    this.addChild(this.sprite)

    Ticker.shared.add(this.update, this)
  }

  setState(state: PlayerState) {
    if (state !== this.playerState) {
      this.playerState = state
      switch (state) {
        case PlayerState.RUNNING: {
          this.setAnimation("Player/Run")
          break
        }
        case PlayerState.IDLE: {
          this.setAnimation("Player/Idle")
          break
        }
        case PlayerState.JUMPING: {
          this.sprite.textures = [
            this.spriteSheet.textures["Jump/PlayerJump.png"],
          ]
        }
      }
      this.sprite.play()
    }
  }

  setAnimation(animation: string) {
    this.sprite.textures = this.spriteSheet.animations[animation]
    this.sprite.animationSpeed =
      this.spriteSheet.animations[animation].length / 60
    this.sprite.play()
  }

  setDirection(direction: 1 | -1) {
    if (this.direction !== direction) {
      this.direction = direction
      this.sprite.scale.set(SCALE * this.direction, SCALE)
    }
  }

  update(deltaTime: number) {
    if (this.playerState === PlayerState.RUNNING) {
      if (getRandomInt(0, 4) === 4) {
        const dustParticle = new DustParticle(this.sprite.x, this.sprite.y - 5)
        this.addChild(dustParticle)
      }
    }

    if (Input.keyDown(Key.ArrowRight) && !Input.keyDown(Key.ArrowLeft)) {
      this.setState(PlayerState.RUNNING)
      this.acceleration.add(new Vector(ACCELERATION, 0))
      this.setDirection(1)
    } else if (Input.keyDown(Key.ArrowLeft) && !Input.keyDown(Key.ArrowRight)) {
      this.setState(PlayerState.RUNNING)
      this.acceleration.add(new Vector(-ACCELERATION, 0))
      this.setDirection(-1)
    } else {
      this.setState(PlayerState.IDLE)
    }

    this.velocity.add(this.acceleration)
    this.clampVelocity()

    const playerHitBox = this.getHitBox()
    const isGoingOffLeftEdge = playerHitBox.x + this.velocity.x < 0
    const isGoingOffRightEdge =
      this.sprite.x + playerHitBox.w * 0.5 + this.velocity.x > this.windowWidth

    if (isGoingOffLeftEdge) {
      this.sprite.x = this.hitBoxWidth * 0.5
      this.velocity = new Vector(0, 0)
    } else if (isGoingOffRightEdge) {
      this.sprite.x = this.windowWidth - this.hitBoxWidth * 0.5
      this.velocity = new Vector(0, 0)
    } else {
      this.sprite.x += this.velocity.x * deltaTime
    }

    this.decelerate()
    this.acceleration = new Vector(0, 0)
  }

  gravity() {
    if (this.sprite.y < this.windowHeight - this.sprite.height * 2) {
      this.acceleration.add(new Vector(0, 0.1))
    }
  }

  clampVelocity() {
    if (this.velocity.x > MAX_VELOCITY) {
      this.velocity.x = MAX_VELOCITY
    }

    if (this.velocity.x < -MAX_VELOCITY) {
      this.velocity.x = -MAX_VELOCITY
    }
  }

  decelerate() {
    const velocityMagnitude = this.velocity.magnitude()

    if (velocityMagnitude > 0) {
      if (velocityMagnitude < 0.01) {
        this.velocity = new Vector(0, 0)
      } else {
        const inverse = this.velocity.clone().inverse().divide(7)
        this.velocity.add(inverse)
      }
    }
  }

  detectCollisions(enemies: Enemy[]) {
    if (!enemies.length) {
      return
    }

    if (this.isInjured) {
      return
    }

    const playerBox = this.getHitBox()

    for (const enemy of enemies) {
      // only do fine-grained collision detection if enemy is even reasonably close
      if (this.isClose(enemy)) {
        const enemyBox = enemy.getHitBox()

        if (
          playerBox.x < enemyBox.x + enemyBox.w &&
          playerBox.x + playerBox.w > enemyBox.x &&
          playerBox.y < enemyBox.y + enemyBox.h &&
          playerBox.h + playerBox.y > enemyBox.y
        ) {
          this.isInjured = true
          this.sprite.alpha = 0.5
          GameState.setState((state) => {
            const newHealth = state.health - enemy.damage
            return { health: newHealth >= 0 ? newHealth : 0 }
          })

          if (GameState.state.health <= 0) {
            this.kill()
          }

          setTimeout(() => {
            this.isInjured = false
            this.sprite.alpha = 1
          }, 2000)
        }
      }
    }
  }

  isClose(enemy: Enemy) {
    const THRESHOLD = 50

    if (enemy.sprite.x > this.sprite.x + THRESHOLD) {
      return false
    }

    if (enemy.sprite.x < this.sprite.x - THRESHOLD) {
      return false
    }

    if (enemy.sprite.y < this.sprite.y - THRESHOLD) {
      return false
    }

    if (enemy.sprite.y > this.sprite.y + THRESHOLD) {
      return false
    }

    return true
  }

  kill() {
    Ticker.shared.remove(this.update, this)
    this.destroy()
  }

  getHitBox() {
    const localBounds = this.getLocalBounds()
    return {
      x: localBounds.x + SPRITE_PADDING_H,
      y: localBounds.y + SPRITE_PADDING_V,
      w: this.hitBoxWidth,
      h: this.hitBoxHeight,
    }
  }
}
