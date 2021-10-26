import { Container } from "pixi.js"

export interface Scene extends Container {
  initialize(screenWidth: number, screenHight: number): void
  beforeDelete?: () => void
  update?: (deltaTime: number) => void
  restart?: () => void
}
