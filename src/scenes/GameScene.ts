import { Container } from "@pixi/display"
import { Graphics } from "@pixi/graphics"
import { Ticker } from "@pixi/ticker"
import { Saw } from "../enemies/Saw"
import { TestEnemy } from "../enemies/TestEnemy"
import { EnemyManager } from "../EnemyManager"
import GameState, { UnsubscribeFunction } from "../GameState"
import { Key } from "../Key"
import { GameMap } from "../Map"
import { Player } from "../Player"
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
  }

  beforeDelete() {
    this.stateUnsubscribeFunction()
    this.enemyManager.cleanUp()
  }
}
