import { Application, Loader, Ticker, Graphics } from "pixi.js"
import { EnemyManager } from "./EnemyManager"
import { GameMap } from "./Map"
import { Player } from "./Player"
import { UI } from "./UI"

import MemoryStats from "memory-stats"
import { TestEnemy } from "./enemies/TestEnemy"
import { SCALE } from "./constants"

const RENDER_HIT_BOX = false

const stats = new MemoryStats()

stats.domElement.style.position = "fixed"
stats.domElement.style.right = "0px"
stats.domElement.style.bottom = "0px"

document.body.appendChild(stats.domElement)

requestAnimationFrame(function rAFloop() {
  stats.update()
  requestAnimationFrame(rAFloop)
})

const app = new Application({
  view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: 0x6495ed,
  width: 320 * SCALE,
  height: 320 * SCALE,
})

Loader.shared.add("sprites", "sprites/Sprites.json")
Loader.shared.add("floor", "sprites/Floor.png")
Loader.shared.add("dust", "sprites/DustParticle.png")
Loader.shared.load(setup)

function setup() {
  const enemyManager = new EnemyManager(app)
  // enemyManager.start()

  const map = new GameMap()
  app.stage.addChild(map)

  const player = new Player(app.screen.width, app.screen.height)
  app.stage.addChild(player)

  const ui = new UI(app.screen.width, app.screen.height)
  app.stage.addChild(ui)

  // const testEnemy = new TestEnemy(app.screen.width / 2 + 100, app.screen.height)
  // app.stage.addChild(testEnemy)

  let hitBox: Graphics

  // if (RENDER_HIT_BOX) {
  //   hitBox = new Graphics()
  //   hitBox.alpha = 0.5
  //   hitBox.beginFill(0xff0000)
  //   const playerHitBox = testEnemy.getHitBox()
  //   hitBox.drawRect(
  //     playerHitBox.x,
  //     playerHitBox.y,
  //     playerHitBox.w,
  //     playerHitBox.h
  //   )
  //   app.stage.addChild(hitBox)
  // }

  Ticker.shared.add((deltaTime) => {
    player.detectCollisions(enemyManager.enemies)
    // player.detectCollisions([testEnemy])
  })
}
