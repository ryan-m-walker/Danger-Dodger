import { Container, filters, Graphics } from "pixi.js"
import { MotionBlurFilter } from "@pixi/filter-motion-blur"
import { RGBSplitFilter } from "@pixi/filter-rgb-split"
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
import { Color } from "../constants"
import { PauseScreen } from "../PauseScreen"

export class GameScene extends Container implements Scene {
  static id = "game"

  private player: Player
  private enemyManager: EnemyManager = new EnemyManager()
  private pauseScreen: PauseScreen | null

  private time = 0
  private startTime: number

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

    this.enemyManager.start()

    const map = new GameMap()
    this.addChild(map)

    this.initGameState()

    const ui = new UI(screenWidth, screenHeight)
    this.addChild(ui)

    this.filters = this.getDefaultFilters()

    this.stateUnsubscribeFunction = GameState.subscribe(
      (newState, prevState) => {
        if (newState.time !== prevState.time) {
          if (newState.time % 25 === 0) {
            GameState.setState({ difficulty: newState.difficulty + 1 })
          }
        }

        if (newState.isPaused === true && prevState.isPaused === false) {
          this.pauseScreen = new PauseScreen()
          this.addChild(this.pauseScreen)
        }

        if (newState.isPaused === false && prevState.isPaused === true) {
          this.removeChild(this.pauseScreen)
          this.pauseScreen.remove()
          this.pauseScreen.destroy()
          this.pauseScreen = null
        }
      }
    )

    window.addEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (GameState.state.isGameOver && e.code === Key.Enter) {
      this.restart()
    }

    if (!GameState.state.isGameOver && e.code === Key.Escape) {
      GameState.setState((state) => ({ isPaused: !state.isPaused }))
    }
  }

  // TODO: rename
  initGameState() {
    this.startTime = Date.now()

    this.player = new Player()
    this.addChild(this.player)
  }

  restart() {
    GameState.setState({
      health: 100,
      isGameOver: false,
      time: 0,
      difficulty: 1,
    })
    this.enemyManager.restart()
    this.initGameState()
  }

  killPlayer() {
    this.player.kill()
  }

  update() {
    this.noiseFilter.seed = Math.random()

    if (GameState.state.isPaused) {
      // TODO:
      // would be cool to keep the shake in the background when paused but because
      // of th nesting of the pause menu in this container it'll be tricky for now
      this.filters = this.getDefaultFilters()
      return
    }

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

    if (GameState.state.health > 0) {
      const time = Date.now()
      const current = Math.floor((time - this.startTime) * 0.001)

      if (current !== this.time) {
        this.time = current
        GameState.setState({ time: this.time })
      }
    }
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
    window.removeEventListener("keydown", this.handleKeyDown)
    this.stateUnsubscribeFunction()
    this.enemyManager.cleanUp()
    this.player.kill()
  }

  getDefaultFilters() {
    return [bloomFilter, this.noiseFilter]
  }
}
