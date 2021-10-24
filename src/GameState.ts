import * as uuid from "uuid"
import { Character } from "./types"

export type State = {
  health: number
  character: Character
  isGameOver: boolean
  isPaused: boolean
  time: number
  difficulty: number
}

export type StateSubscriptionHandler = (
  newState: State,
  prevState: State
) => void
export type UnsubscribeFunction = () => void

export type StateUpdateFunction = (state: State) => Partial<State>

type StateSubscription = {
  id: string
  handler: StateSubscriptionHandler
}

class GameState {
  state: State = Object.freeze({
    health: 100,
    character: Character.NinjaFrog,
    isGameOver: false,
    time: 0,
    isPaused: false,
    difficulty: 1,
  })

  private subscriptions: StateSubscription[] = []

  setState(newState: Partial<State>): void
  setState(stateUpdateFunction: StateUpdateFunction): void
  setState(update: Partial<State> | StateUpdateFunction): void {
    const prevState = { ...this.state }

    if (typeof update === "function") {
      this.state = Object.freeze({ ...this.state, ...update(this.state) })
    } else {
      this.state = Object.freeze({ ...this.state, ...update })
    }

    for (const subscription of this.subscriptions) {
      subscription.handler(this.state, prevState)
    }
  }

  subscribe(handler: StateSubscriptionHandler): UnsubscribeFunction {
    const id = uuid.v4()

    this.subscriptions.push({
      id,
      handler,
    })

    return () => {
      this.subscriptions = this.subscriptions.filter((s) => s.id !== id)
    }
  }

  subscriptionCount() {
    return this.subscriptions.length
  }
}

export default new GameState()
