import { Container, TextStyle, Text } from "pixi.js"
import GameState from "./GameState"

export class UI extends Container {
  style = new TextStyle({
    align: "left",
    fill: "#cc3048",
    fontSize: 24,
    fontWeight: "bolder",
    letterSpacing: 1,
  })

  text = new Text("Health: " + GameState.state.health, this.style)

  constructor(private screenWidth: number, private screenHeight: number) {
    super()

    this.text.x = 16
    this.text.y = 16

    this.addChild(this.text)
    GameState.subscribe((newState) => {
      if (newState.health <= 0) {
        const gameOverTextStyle = new TextStyle({
          align: "center",
          fill: "#cc3048",
          fontSize: 45,
          fontWeight: "bold",
          letterSpacing: 1,
        })

        const gameOverText = new Text("Game Over...", gameOverTextStyle)
        gameOverText.x = this.screenWidth / 2 - gameOverText.width / 2
        gameOverText.y = this.screenHeight / 2 - gameOverText.height / 2

        this.removeChild(this.text)
        this.addChild(gameOverText)
      } else {
        this.text.text = "Health: " + newState.health
      }
    })
  }
}
