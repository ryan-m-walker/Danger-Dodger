import { Application, Ticker } from "pixi.js"
import { Color, SCALE } from "./constants"
import { Scene } from "./scenes/Scene"

class SceneManager {
  scenes: Record<string, Scene> = {}

  private _app: Application
  private hasInitialized = false
  currentScene: Scene | null

  get scene() {
    return this.currentScene
  }

  get app() {
    return this._app
  }

  initialize() {
    if (!this.hasInitialized) {
      this._app = new Application({
        view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: Color.BLACK.hex,
        width: 320 * SCALE,
        height: 320 * SCALE,
      })

      this.hasInitialized = true

      Ticker.shared.add(this.update, this)
    }
  }

  update(deltaTime: number) {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(deltaTime)
    }
  }

  setScene(sceneID: string) {
    if (this.currentScene) {
      if (this.currentScene.beforeDelete) {
        this.currentScene.beforeDelete()
      }
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.destroy()
    }

    // TODO: if not scene
    this.currentScene = this.scenes[sceneID]
    this.currentScene.initialize(
      this._app.screen.width,
      this._app.screen.height
    )
    this.app.stage.addChild(this.currentScene)
  }

  addScene(sceneID: string, scene: Scene) {
    this.scenes[sceneID] = scene
  }
}

export default new SceneManager()
