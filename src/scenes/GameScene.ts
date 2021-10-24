import { Container, filters } from "pixi.js"
import { MotionBlurFilter } from "@pixi/filter-motion-blur"
import { RGBSplitFilter } from "@pixi/filter-rgb-split"
import { TestEnemy } from "../enemies/TestEnemy"
import { EnemyManager } from "../EnemyManager"
import { bloomFilter } from "../filters"
import GameState, { UnsubscribeFunction } from "../GameState"
import { Key } from "../Key"
import { GameMap } from "../Map"
import { Player } from "../Player"
import { getRandomInt } from "../random"
import SceneManager from "../SceneManager"
import { UI } from "../UI"
import { Scene } from "./Scene"

export class GameScene extends Container implements Scene {
  static id = "game"

  player: Player
  testEnemy: TestEnemy
  enemyManager: EnemyManager

  time = 0
  startTime: number

  private isShaking = false
  private shakeTime = 0
  private shakeEnd: number
  private shakeStrength = 3

  private rgbSplitFilter = new RGBSplitFilter([-5, 5], [5, -5], [-5, -5])
  private noiseFilter = new filters.NoiseFilter(0.125)

  private stateUnsubscribeFunction: UnsubscribeFunction

  initialize() {
    const screenWidth = SceneManager.app.screen.width
    const screenHeight = SceneManager.app.screen.height

    this.enemyManager = new EnemyManager()
    this.enemyManager.start()

    const map = new GameMap()
    this.addChild(map)

    this.initGameState()

    const ui = new UI(screenWidth, screenHeight)
    this.addChild(ui)

    this.filters = this.getDefaultFilters()

    this.stateUnsubscribeFunction = GameState.subscribe((newState) => {
      if (newState.isGameOver === true) {
        document.addEventListener("keydown", this.keyDownEventHandler)
      }
    })
  }

  // TODO: rename
  initGameState() {
    this.startTime = Date.now()

    this.player = new Player()
    this.addChild(this.player)
  }

  keyDownEventHandler = (e: KeyboardEvent) => {
    if (e.code === Key.Enter) {
      document.removeEventListener("keydown", this.keyDownEventHandler)
      this.restart()
    }
  }

  restart() {
    GameState.setState({
      health: 100,
      isGameOver: false,
      time: 0,
    })

    this.enemyManager.restart()
    this.initGameState()
  }

  update() {
    if (this.isShaking) {
      this.x = getRandomInt(-this.shakeStrength, this.shakeStrength)
      this.y = getRandomInt(-this.shakeStrength, this.shakeStrength)
      this.shakeTime += 1
      this.rgbSplitFilter.red = [
        getRandomInt(-this.shakeStrength, this.shakeStrength),
        getRandomInt(-this.shakeStrength, this.shakeStrength),
      ]
      this.rgbSplitFilter.green = [
        getRandomInt(-this.shakeStrength, this.shakeStrength),
        getRandomInt(-this.shakeStrength, this.shakeStrength),
      ]
      this.rgbSplitFilter.blue = [
        getRandomInt(-this.shakeStrength, this.shakeStrength),
        getRandomInt(-this.shakeStrength, this.shakeStrength),
      ]
      if (this.shakeTime >= this.shakeEnd) {
        this.isShaking = false
        this.x = 0
        this.y = 0
        this.filters = this.getDefaultFilters()
      }
    }

    if (!this.player.isDead) {
      this.player.detectCollisions(this.enemyManager.enemies)
    }

    if (GameState.state.health > 0 && this.time < Number.MAX_SAFE_INTEGER) {
      const time = Date.now()
      const current = Math.floor((time - this.startTime) * 0.001)

      if (current !== this.time) {
        this.time = current
        GameState.setState({ time: this.time })
      }
    }

    this.noiseFilter.seed = Math.random()
  }

  shake(frames: number = 10, strength: number = 3) {
    this.isShaking = true
    this.shakeEnd = frames
    this.shakeTime = 0
    this.shakeStrength = strength
    this.filters = [
      ...this.getDefaultFilters(),
      new MotionBlurFilter([8, 8]),
      this.rgbSplitFilter,
    ]
  }

  beforeDelete() {
    this.stateUnsubscribeFunction()
    this.enemyManager.cleanUp()
  }

  getDefaultFilters() {
    return [bloomFilter, this.noiseFilter]
  }
}
