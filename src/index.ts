import { Loader } from "pixi.js"
import { WebfontLoaderPlugin } from "pixi-webfont-loader"

import { Resources } from "./constants"
import SceneManager from "./SceneManager"
import { CharacterSelectionScene } from "./scenes/CharacterSelectionScene"
import Input from "./Input"
import { GameScene } from "./scenes/GameScene"

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
