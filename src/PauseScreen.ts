import { Container, Graphics, TextStyle, Text } from "pixi.js"
import { Color, Resources, SCALE } from "./constants"
import GameState from "./GameState"
import { Key } from "./Key"
import SceneManager from "./SceneManager"
import { CharacterSelectionScene } from "./scenes/CharacterSelectionScene"
import { GameScene } from "./scenes/GameScene"

type MenuItem = {
  text: Text
  handler: () => void
}

export class PauseScreen extends Container {
  private background: Graphics

  private menuItemTextStyle = new TextStyle({
    align: "center",
    fontFamily: Resources.UPHEAVAL,
    fontSize: 24 * SCALE,
    fill: Color.WHITE.hexString,
  })

  private menuItems: MenuItem[] = [
    {
      text: new Text("Resume", this.menuItemTextStyle.clone()),
      handler: () => {
        GameState.setState({ isPaused: false })
      },
    },
    {
      text: new Text("Restart", this.menuItemTextStyle.clone()),
      handler: () => {
        if (SceneManager.currentScene instanceof GameScene) {
          GameState.setState({ isPaused: false })
          SceneManager.currentScene.killPlayer()
          SceneManager.currentScene.restart()
        }
      },
    },
    // {
    //   text: new Text("Character\nSelection", this.menuItemTextStyle.clone()),
    //   handler: () => {
    //     SceneManager.setScene(CharacterSelectionScene.id)
    //   },
    // },
  ]
  private selectedMenuItem = 0

  constructor() {
    super()

    const screenWidth = SceneManager.app.screen.width
    const screenHeight = SceneManager.app.screen.height

    this.background = new Graphics()
    this.background.beginFill(Color.BLACK.hex, 0.9)
    this.background.drawRect(0, 0, screenWidth, screenHeight)
    this.addChild(this.background)

    const PADDING = 64 * SCALE

    this.menuItems.forEach((menuItem, i) => {
      const rowHeight = (screenHeight - PADDING * 2) / this.menuItems.length
      const y = PADDING + i * rowHeight + rowHeight * 0.5

      menuItem.text.anchor.set(0.5, 0.5)
      menuItem.text.x = screenWidth * 0.5
      menuItem.text.y = y

      if (this.selectedMenuItem === i) {
        menuItem.text.style.fill = Color.RED.hexString
      }

      this.addChild(menuItem.text)
    })

    window.addEventListener("keydown", this.handleKeyDown)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === Key.ArrowDown) {
      this.selectedMenuItem =
        (this.selectedMenuItem + 1) % this.menuItems.length
      this.highLightNewMenuItem()
    }

    if (e.code === Key.ArrowUp) {
      const newMenuItem = this.selectedMenuItem - 1
      this.selectedMenuItem =
        newMenuItem < 0 ? this.menuItems.length - 1 : newMenuItem
      this.highLightNewMenuItem()
    }

    if (e.code === Key.Enter) {
      this.menuItems[this.selectedMenuItem].handler()
    }
  }

  highLightNewMenuItem() {
    this.menuItems.forEach((menuItem, i) => {
      if (i === this.selectedMenuItem) {
        menuItem.text.style.fill = Color.RED.hexString
      } else {
        menuItem.text.style.fill = Color.WHITE.hexString
      }
    })
  }

  remove() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }
}
