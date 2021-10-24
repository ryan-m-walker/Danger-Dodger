import { Container, TextStyle, Text, Sprite, Ticker } from "pixi.js"
import { Color, Resources, SCALE } from "./constants"
import GameState from "./GameState"

export class UI extends Container {
  hpText: Text
  gameOverText: Sprite
  gameOverSubText: Sprite

  timeText: Text

  constructor(private screenWidth: number, private screenHeight: number) {
    super()

    const timeTextStyle = new TextStyle({
      align: "right",
      fontSize: 20 * SCALE,
      fontWeight: "bold",
      letterSpacing: 3,
      fill: Color.WHITE.hex,
      fontFamily: Resources.UPHEAVAL,
    })

    this.timeText = new Text(GameState.state.time.toString(), timeTextStyle)
    this.timeText.anchor.set(1, 0)
    this.timeText.x = this.screenWidth - 16 * SCALE
    this.timeText.y = 16 * SCALE
    this.addChild(this.timeText)

    const hpTextStyle = new TextStyle({
      align: "left",
      fontSize: 20 * SCALE,
      fontWeight: "bold",
      letterSpacing: 3,
      fill: Color.WHITE.hex,
      fontFamily: Resources.UPHEAVAL,
    })

    this.hpText = new Text(`HP: ${GameState.state.health}%`, hpTextStyle)
    this.hpText.anchor.set(0, 0)
    this.hpText.x = 16 * SCALE
    this.hpText.y = 16 * SCALE
    this.addChild(this.hpText)

    GameState.subscribe((newState, prevState) => {
      if (prevState.isGameOver === true && newState.isGameOver === false) {
        this.clearGameOverText()
      }

      this.timeText.text = newState.time.toString()

      if (prevState.isGameOver === false && newState.isGameOver === true) {
        this.showGameOverText()
        this.hpText.text = "HP: 0%"
      } else {
        this.hpText.text = `HP: ${newState.health}%`
        this.hpText.style.fill = Color.RED.blend(
          Color.WHITE,
          newState.health * 0.01
        ).hexString
      }
    })
  }

  showGameOverText() {
    const gameOverTextStyle = new TextStyle({
      align: "center",
      fill: Color.RED.hex,
      fontSize: 42 * SCALE,
      fontWeight: "bold",
      letterSpacing: 3,
      fontFamily: Resources.UPHEAVAL,
    })

    this.gameOverText = new Text("GAME OVER", gameOverTextStyle)
    this.gameOverText.anchor.set(0.5, 0.5)
    this.gameOverText.x = this.screenWidth / 2
    this.gameOverText.y = this.screenHeight / 2 - 16 * SCALE

    this.addChild(this.gameOverText)

    const gameOverSubTextStyle = new TextStyle({
      align: "center",
      fill: Color.WHITE.hex,
      fontSize: 12 * SCALE,
      fontWeight: "bold",
      letterSpacing: 3,
      fontFamily: Resources.UPHEAVAL,
    })

    this.gameOverSubText = new Text(
      "Press Enter to try again",
      gameOverSubTextStyle
    )
    this.gameOverSubText.anchor.set(0.5, 0.5)
    this.gameOverSubText.x = this.screenWidth / 2
    this.gameOverSubText.y = this.screenHeight / 2 + 25 * SCALE

    this.addChild(this.gameOverSubText)
  }

  clearGameOverText() {
    this.removeChild(this.gameOverText)
    this.removeChild(this.gameOverSubText)
  }
}
