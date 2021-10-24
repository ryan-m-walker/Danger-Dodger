import { Ticker, Application } from "pixi.js"
import { Enemy } from "./enemies/Enemy"

import { Saw } from "./enemies/Saw"
import { SpikeBall } from "./enemies/SpikeBall"
import { SpikeHead } from "./enemies/SpikeHead"
import GameState, { UnsubscribeFunction } from "./GameState"
import { getRandomInt } from "./random"
import SceneManager from "./SceneManager"

export class EnemyManager {
  enemies: Enemy[] = []

  private stateUnsubscribeFunction: UnsubscribeFunction

  start = () => {
    Ticker.shared.add(this.update, this)
    this.stateUnsubscribeFunction = GameState.subscribe((newState) => {
      if (newState.time % 4 === 0) {
        this.spawnEnemy(Saw)
        this.spawnEnemy(Saw)
        this.spawnEnemy(Saw)
      }
    })
  }

  cleanUp() {
    Ticker.shared.remove(this.update, this)
    this.stateUnsubscribeFunction()
  }

  restart() {
    for (const enemy of this.enemies) {
      SceneManager.currentScene.removeChild(enemy)
    }

    this.enemies = []
  }

  private update() {
    for (const enemy of this.enemies) {
      if (enemy.sprite.y > SceneManager.app.screen.height) {
        enemy.remove()
        enemy.destroy()
        this.enemies = this.enemies.filter((e) => e.id !== enemy.id)
      }
    }
  }

  private spawnEnemy = (EnemyClass: typeof Enemy) => {
    const x = getRandomInt(0, SceneManager.app.screen.width)
    const enemy = new EnemyClass(x)
    this.enemies.push(enemy)
    SceneManager.currentScene.addChild(enemy)
  }
}
