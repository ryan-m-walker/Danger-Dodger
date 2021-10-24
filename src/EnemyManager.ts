import { Ticker, Application } from "pixi.js"
import { Enemy } from "./enemies/Enemy"
import { RockHead } from "./enemies/RockHead"

import { Saw } from "./enemies/Saw"
import { SpikeBall } from "./enemies/SpikeBall"
import { SpikeHead } from "./enemies/SpikeHead"
import GameState, { UnsubscribeFunction } from "./GameState"
import { getChance, getRandomInt } from "./random"
import SceneManager from "./SceneManager"

type EnemyWave = {
  coolDownTime: number
  coolDown: number
  enemies: Array<typeof Enemy>
}

export class EnemyManager {
  enemies: Enemy[] = []

  enemyChances = [
    {
      enemy: Saw,
      chance: 20,
      max: 2,
    },
    {
      enemy: SpikeHead,
      chance: 30,
      max: 1,
    },
    {
      enemy: SpikeBall,
      chance: 16,
      max: 3,
    },
    {
      enemy: RockHead,
      chance: 35,
      max: 1,
    },
  ]

  private stateUnsubscribeFunction: UnsubscribeFunction

  start = () => {
    Ticker.shared.add(this.update, this)

    this.stateUnsubscribeFunction = GameState.subscribe(
      (newState, prevState) => {
        // wait a bit before starting
        if (newState.time < 3) {
          return
        }

        if (newState.time !== prevState.time) {
          for (const enemy of this.enemyChances) {
            for (
              let chance = 0;
              chance < enemy.max + GameState.state.difficulty;
              chance++
            ) {
              const chance = enemy.chance - GameState.state.difficulty
              if (getChance(chance >= 2 ? chance : 2)) {
                this.spawnEnemy(enemy.enemy)
              }
            }
          }
        }
      }
    )
  }

  getInitialWaves(): EnemyWave[] {
    return [
      this.getNewWave(4, Saw, Saw, Saw),
      this.getNewWave(6, SpikeHead),
      this.getNewWave(8, SpikeBall, SpikeBall, SpikeBall, SpikeBall),
      this.getNewWave(20, RockHead, RockHead),
    ]
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

  private getNewWave(
    coolDown: number,
    ...enemies: Array<typeof Enemy>
  ): EnemyWave {
    return {
      coolDownTime: 0,
      coolDown,
      enemies,
    }
  }
}
