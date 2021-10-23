import { Ticker, Application } from "pixi.js"
import { Enemy } from "./enemies/Enemy"

import { Saw } from "./enemies/Saw"
import { SpikeBall } from "./enemies/SpikeBall"
import { SpikeHead } from "./enemies/SpikeHead"
import { getRandomInt } from "./random"

const wave1 = {
  200: [Saw, Saw],
  300: [SpikeHead],
  400: [Saw, SpikeBall, SpikeBall],
  450: [SpikeBall, SpikeBall],
}

export class EnemyManager {
  frame = 0

  sawNumber = 2
  spikeBallNumber = 2
  spikeHeadNumber = 1
  rockHeadNumber = 1

  enemies: Enemy[] = []

  constructor(private app: Application) {}

  start = () => {
    Ticker.shared.add(this.update, this)
  }

  private update() {
    this.frame += 1

    if (wave1[this.frame]) {
      for (const enemy of wave1[this.frame]) {
        this.spawnEnemy(enemy)
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.sprite.y > this.app.screen.height) {
        enemy.remove()
        this.enemies = this.enemies.filter((e) => e.id !== enemy.id)
      }
    }
  }

  private spawnEnemy = (EnemyClass: typeof Enemy) => {
    const x = getRandomInt(0, this.app.screen.width)
    const enemy = new EnemyClass(x, this.app.screen.height)
    this.enemies.push(enemy)
    this.app.stage.addChild(enemy)
  }
}
