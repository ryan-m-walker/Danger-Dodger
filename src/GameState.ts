import * as uuid from "uuid"

export type State = {
  health: number
}

export type StateSubscriptionHandler = (newState: State) => void
export type UnsubscribeFunction = () => void

export type StateUpdateFunction = (state: State) => Partial<State>

type StateSubscription = {
  id: string
  handler: StateSubscriptionHandler
}

class GameState {
  state: State = Object.freeze({
    health: 100,
  })

  private subscriptions: StateSubscription[] = []

  setState(newState: Partial<State>): void
  setState(stateUpdateFunction: StateUpdateFunction): void
  setState(update: Partial<State> | StateUpdateFunction): void {
    if (typeof update === "function") {
      this.state = Object.freeze({ ...this.state, ...update(this.state) })
    } else {
      this.state = Object.freeze({ ...this.state, ...update })
    }

    for (const subscription of this.subscriptions) {
      subscription.handler(this.state)
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
}

export default new GameState()
