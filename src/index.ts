import { Application, Loader, Ticker, Graphics } from "pixi.js"
import MemoryStats from "memory-stats"
import { WebfontLoaderPlugin } from "pixi-webfont-loader"

import { EnemyManager } from "./EnemyManager"
import { GameMap } from "./Map"
import { Player } from "./Player"
import { UI } from "./UI"
import { TestEnemy } from "./enemies/TestEnemy"
import { Resources, SCALE } from "./constants"
import SceneManager from "./SceneManager"
import { CharacterSelectionScene } from "./scenes/CharacterSelectionScene"
import Input from "./Input"
import { GameScene } from "./scenes/GameScene"

console.log("Starting Memory Stats")
const stats = new MemoryStats()

stats.domElement.style.position = "fixed"
stats.domElement.style.right = "0px"
stats.domElement.style.bottom = "0px"

document.body.appendChild(stats.domElement)

requestAnimationFrame(function rAFloop() {
  stats.update()
  requestAnimationFrame(rAFloop)
})

Loader.registerPlugin(WebfontLoaderPlugin)

Loader.shared.add(Resources.SPRITES, "sprites/sprites.json")
Loader.shared.add(Resources.UPHEAVAL, "fonts/upheavtt.ttf")
Loader.shared.load(setup)

function setup() {
  Input.start()

  SceneManager.initialize()
  SceneManager.addScene(
    CharacterSelectionScene.id,
    new CharacterSelectionScene()
  )
  SceneManager.addScene(GameScene.id, new GameScene())

  // SceneManager.setScene(CharacterSelectionScene.id)
  SceneManager.setScene(GameScene.id)
}

// function setup() {
//   const enemyManager = new EnemyManager(app)
//   // enemyManager.start()

//   const map = new GameMap()
//   app.stage.addChild(map)

//   const player = new Player(app.screen.width, app.screen.height)
//   app.stage.addChild(player)

//   const ui = new UI(app.screen.width, app.screen.height)
//   app.stage.addChild(ui)

//   const testEnemy = new TestEnemy(app.screen.width / 2 - 100, app.screen.height)
//   app.stage.addChild(testEnemy)
//   const hitBox = new Graphics()
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

//   Ticker.shared.add((deltaTime) => {
//     if (!player.isDead) {
//       // player.detectCollisions(enemyManager.enemies)
//       player.detectCollisions([testEnemy])
//     }
//   })
// }
