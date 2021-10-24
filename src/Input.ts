import { Ticker } from "@pixi/ticker"
import { Key } from "./Key"

class Input {
  private keys = new Map<string, boolean>()

  // TODO: constructor?
  start() {
    addEventListener("keydown", (e) => {
      this.keys.set(e.code, true)
    })

    addEventListener("keyup", (e) => {
      this.keys.set(e.code, false)
    })
  }

  keyDown(key: Key) {
    return this.keys.get(key) ?? false
  }
}

export default new Input()
