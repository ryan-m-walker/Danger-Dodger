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
import { getChance, getRandomFloat, getRandomInt } from "./random"
import { DustParticle } from "./DustParticle"
import { Resources, SCALE } from "./constants"
import SceneManager from "./SceneManager"
import { MotionBlurFilter } from "@pixi/filter-motion-blur"
import { GameScene } from "./scenes/GameScene"

const ACCELERATION = 0.75
const MAX_VELOCITY = 6
const MAX_DASH_VELOCITY = 20
const INJURED_COOL_DOWN_TIME = 65
const DASH_COOL_DOWN = 8

const SPRITE_PADDING_H = 6 * SCALE
const SPRITE_PADDING_V = 8 * SCALE

enum PlayerState {
  RUNNING,
  IDLE,
  INJURED,
  DASHING,
}

export class Player extends Container {
  hitBox: Graphics
  isDead = false

  sortableChildren = true

  private readonly windowWidth: number
  private readonly windowHeight: number

  sprite: AnimatedSprite
  private spriteSheet: Spritesheet
  private playerState = PlayerState.IDLE

  // movement
  private velocity = Vector.Zero()
  private acceleration = Vector.Zero()
  private direction = 1

  // injured
  private isInjured = false
  private injuredCoolDown = 0
  private injuredBlinkOn = true

  // position
  private hitBoxWidth: number
  private hitBoxHeight: number

  // dash
  private dashCoolDown = 0
  private isDashPressed = false
  private velocityBeforeDash = Vector.Zero()
  private accelerationBeforeDash = Vector.Zero()

  constructor() {
    super()

    this.windowWidth = SceneManager.app.screen.width
    this.windowHeight = SceneManager.app.screen.height

    this.spriteSheet = Loader.shared.resources[Resources.SPRITES].spritesheet
    const animation = this.spriteSheet.animations[this.getAnimationKey("idle")]
    this.sprite = new AnimatedSprite(animation)
    this.sprite.animationSpeed = animation.length / 60
    this.sprite.scale.set(SCALE, SCALE)
    this.sprite.x = this.windowWidth / 2
    this.sprite.y =
      this.windowHeight - this.sprite.height * 2 - this.sprite.height / 2
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.zIndex = 100

    this.sprite.play()

    this.hitBoxWidth = this.sprite.width - SPRITE_PADDING_H * 2
    this.hitBoxHeight = this.sprite.height - SPRITE_PADDING_V

    this.addChild(this.sprite)

    Ticker.shared.add(this.update, this)
  }

  getAnimationKey(key: string) {
    return `${GameState.state.character}/${key}/${key}`
  }

  getTextureKey(key: string) {
    return `${GameState.state.character}/${key}.png`
  }

  setState(state: PlayerState) {
    if (state !== this.playerState) {
      this.playerState = state
      switch (state) {
        case PlayerState.RUNNING: {
          this.setAnimation("run")
          break
        }
        case PlayerState.IDLE: {
          this.setAnimation("idle")
          break
        }
        case PlayerState.DASHING: {
          this.setTexture("dash")
          this.dashCoolDown = 0
          this.isDashPressed = true
          this.sprite.filters = [new MotionBlurFilter([12, 0])]
          // save current vel and acc to maintain after player done dashing
          this.velocityBeforeDash = this.velocity
          this.accelerationBeforeDash = this.acceleration
          break
        }
      }
    }
  }

  setAnimation(animation: string) {
    const key = this.getAnimationKey(animation)
    this.sprite.textures = this.spriteSheet.animations[key]
    this.sprite.animationSpeed = this.spriteSheet.animations[key].length / 60
    this.sprite.play()
  }

  setTexture(texture: string) {
    const key = this.getTextureKey(texture)
    this.sprite.textures = [this.spriteSheet.textures[key]]
  }

  setDirection(direction: 1 | -1) {
    if (this.direction !== direction) {
      this.direction = direction
      this.sprite.scale.set(SCALE * this.direction, SCALE)
    }
  }

  emitDust() {
    const yPos = this.sprite.y + this.sprite.height * 0.5
    if (this.isDashing()) {
      const numberOfDustParticles = getRandomInt(0, 6)
      for (let i = 0; i < numberOfDustParticles; i++) {
        const dustParticle = new DustParticle(
          this.sprite.x,
          getRandomFloat(yPos - 3, yPos - 5)
        )
        this.addChild(dustParticle)
      }
    } else {
      if (getChance(10)) {
        const dustParticle = new DustParticle(
          this.sprite.x,
          getRandomFloat(yPos - 3, yPos - 5)
        )
        this.addChild(dustParticle)
      }
    }
  }

  update(deltaTime: number) {
    if (this.isDead) {
      return
    }

    if (!GameState.state.isPaused) {
      if (
        this.playerState === PlayerState.RUNNING ||
        this.playerState === PlayerState.DASHING
      ) {
        this.emitDust()
      }

      // used to force player to tap space instead of holding down each dash
      if (this.isDashPressed) {
        if (!Input.keyDown(Key.Space)) {
          this.isDashPressed = false
        }
      }

      if (this.playerState !== PlayerState.DASHING) {
        if (Input.keyDown(Key.Space)) {
          if (!this.isDashPressed) {
            this.setState(PlayerState.DASHING)
            // this.acceleration.add(new Vector(20 * this.direction, 0))
            this.velocity = new Vector(20 * this.direction, 0)
          }
        } else if (
          Input.keyDown(Key.ArrowRight) &&
          !Input.keyDown(Key.ArrowLeft)
        ) {
          this.setState(PlayerState.RUNNING)
          this.acceleration.add(new Vector(ACCELERATION, 0))
          this.setDirection(1)
        } else if (
          Input.keyDown(Key.ArrowLeft) &&
          !Input.keyDown(Key.ArrowRight)
        ) {
          this.setState(PlayerState.RUNNING)
          this.acceleration.add(new Vector(-ACCELERATION, 0))
          this.setDirection(-1)
        } else {
          this.setState(PlayerState.IDLE)
        }
      } else {
        this.dashCoolDown += 1
        if (this.dashCoolDown >= DASH_COOL_DOWN) {
          this.sprite.filters = []
          this.setState(PlayerState.IDLE)
          this.velocity = this.velocityBeforeDash
          this.acceleration = this.accelerationBeforeDash
        }
      }

      this.velocity.add(this.acceleration)
      this.clampVelocity()

      const playerHitBox = this.getHitBox()
      const isGoingOffLeftEdge = playerHitBox.x + this.velocity.x < 0
      const isGoingOffRightEdge =
        this.sprite.x + playerHitBox.w * 0.5 + this.velocity.x >
        this.windowWidth

      if (isGoingOffLeftEdge) {
        this.sprite.x = this.hitBoxWidth * 0.5
        this.velocity = new Vector(0, 0)
      } else if (isGoingOffRightEdge) {
        this.sprite.x = this.windowWidth - this.hitBoxWidth * 0.5
        this.velocity = new Vector(0, 0)
      } else {
        this.sprite.x += this.velocity.x * deltaTime
      }

      if (!this.isDashing()) {
        this.decelerate()
        this.acceleration = new Vector(0, 0)
      }

      if (this.isInjured) {
        if (this.injuredCoolDown % 5 === 0) {
          this.injuredBlinkOn = !this.injuredBlinkOn
          this.sprite.alpha = this.injuredBlinkOn ? 0.25 : 0.75
        }

        if (this.injuredCoolDown >= INJURED_COOL_DOWN_TIME) {
          this.isInjured = false
          this.sprite.alpha = 1
        }
        this.injuredCoolDown += 1
      }
    }
  }

  isDashing() {
    return this.playerState === PlayerState.DASHING
  }

  gravity() {
    if (this.sprite.y < this.windowHeight - this.sprite.height * 2) {
      this.acceleration.add(new Vector(0, 0.1))
    }
  }

  clampVelocity() {
    const max =
      this.playerState === PlayerState.DASHING
        ? MAX_DASH_VELOCITY
        : MAX_VELOCITY

    if (this.velocity.x > max) {
      this.velocity.x = max
    }

    if (this.velocity.x < -max) {
      this.velocity.x = -max
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
      // check isInjured again to prevent stacking of damage of enemies colliding in the same frame
      // (two enemies hitting player at exact moment)
      if (!this.isInjured) {
        // only do fine-grained collision detection if enemy is even reasonably close
        if (this.isClose(enemy)) {
          const enemyBox = enemy.getHitBox()
          if (
            playerBox.x < enemyBox.x + enemyBox.w &&
            playerBox.x + playerBox.w > enemyBox.x &&
            playerBox.y < enemyBox.y + enemyBox.h &&
            playerBox.h + playerBox.y > enemyBox.y
          ) {
            this.setIsInjured()

            if (SceneManager.currentScene instanceof GameScene) {
              SceneManager.currentScene.shake(5, 10)
            }

            GameState.setState((state) => {
              const newHealth = state.health - enemy.damage
              return { health: newHealth >= 0 ? newHealth : 0 }
            })

            if (GameState.state.health <= 0) {
              this.kill()
            }
          }
        }
      }
    }
  }

  setIsInjured() {
    this.sprite.alpha = 0.5
    this.isInjured = true
    this.injuredCoolDown = 0
    this.injuredBlinkOn = true
  }

  // TODO: fine tune
  isClose(enemy: Enemy) {
    return true
    const THRESHOLD = 50 * SCALE

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
    this.isDead = true
    this.sprite.destroy()
    GameState.setState({ isGameOver: true })
  }

  getHitBox() {
    const globalPosition = this.sprite.getGlobalPosition()
    return {
      x: globalPosition.x - this.sprite.width * 0.5 + SPRITE_PADDING_H,
      y: globalPosition.y - this.sprite.height * 0.5 + SPRITE_PADDING_V,
      w: this.hitBoxWidth,
      h: this.hitBoxHeight,
    }
  }
}
