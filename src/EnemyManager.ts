import { Ticker, Application } from "pixi.js"
import { Enemy } from "./enemies/Enemy"

import { Saw } from "./enemies/Saw"
import { SpikeBall } from "./enemies/SpikeBall"
import { SpikeHead } from "./enemies/SpikeHead"
import { getRandomInt } from "./random"
import SceneManager from "./SceneManager"

export class EnemyManager {
  frame = 0

  sawNumber = 2
  spikeBallNumber = 2
  spikeHeadNumber = 1
  rockHeadNumber = 1

  enemies: Enemy[] = []
  private interval: number

  start = () => {
    this.startInterval()
    Ticker.shared.add(this.update, this)
  }

  startInterval() {
    this.interval = window.setInterval(() => {
      this.spawnEnemy(Saw)
      this.spawnEnemy(Saw)
      this.spawnEnemy(Saw)
    }, 2000)
  }

  restart() {
    for (const enemy of this.enemies) {
      SceneManager.currentScene.removeChild(enemy)
    }

    this.enemies = []
    window.clearInterval(this.interval)
    this.startInterval()
  }

  private update() {
    this.frame += 1

    for (const enemy of this.enemies) {
      if (enemy.sprite.y > SceneManager.app.screen.height) {
        enemy.remove()
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
