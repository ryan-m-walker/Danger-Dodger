import {
  filters,
  Container,
  AnimatedSprite,
  Loader,
  Sprite,
  Text,
  TextStyle,
} from "pixi.js"
import { Color, Resources, SCALE } from "../constants"
import { bloomFilter } from "../filters"
import GameState from "../GameState"
import { Key } from "../Key"
import SceneManager from "../SceneManager"
import { Character } from "../types"
import { GameScene } from "./GameScene"
import { Scene } from "./Scene"

const SCREEN_PADDING = 32 * SCALE
const NOT_SELECTED_TINT = 0x777777

const characterToIndex: Record<Character, number> = {
  [Character.MaskDude]: 0,
  [Character.NinjaFrog]: 1,
  [Character.PinkMan]: 2,
  [Character.VirtualGuy]: 3,
}

const indexToCharacter = Object.entries(characterToIndex).reduce(
  (acc, [character, index]) => {
    acc[index] = character
    return acc
  },
  {}
)

console.log(parseInt(window.localStorage.getItem("selectedCharacter")))

export class CharacterSelectionScene extends Container implements Scene {
  static id = "characterSelection"

  private maskDueSprite: AnimatedSprite
  private ninjaFrogSprite: AnimatedSprite
  private pinkManSprite: AnimatedSprite
  private virtualGuySprite: AnimatedSprite

  private characters: AnimatedSprite[] = new Array(4)

  private selectedCharacter: number = 0

  private screenWidth: number
  private screenHeight: number

  private noiseFilter = new filters.NoiseFilter(0.125)
  filters = [bloomFilter, this.noiseFilter]

  initialize() {
    this.screenWidth = SceneManager.app.screen.width
    this.screenHeight = SceneManager.app.screen.height

    const spriteSheet = Loader.shared.resources[Resources.SPRITES]
    const background = Sprite.from(spriteSheet.textures["characterSelect.png"])
    background.scale.set(SCALE, SCALE)
    this.addChild(background)

    const textStyle = new TextStyle({
      fill: Color.WHITE.hex,
      fontFamily: Resources.UPHEAVAL,
      fontSize: 16 * SCALE,
      letterSpacing: 2,
      align: "center",
    })

    const text = new Text("Choose Your Character:", textStyle)
    text.anchor.set(0.5, 0.5)
    text.x = SceneManager.app.screen.width / 2
    text.y = 75 * SCALE
    this.addChild(text)

    this.initializePlayerSprite(Character.MaskDude)
    this.initializePlayerSprite(Character.NinjaFrog)
    this.initializePlayerSprite(Character.PinkMan)
    this.initializePlayerSprite(Character.VirtualGuy)

    const controlsText = new Text("Controls:", textStyle)
    controlsText.anchor.set(0.5, 0.5)
    controlsText.x = SceneManager.app.screen.width / 2
    controlsText.y = 200 * SCALE
    this.addChild(controlsText)

    const keyTextStyle = new TextStyle({
      fill: Color.WHITE.hex,
      fontFamily: Resources.UPHEAVAL,
      fontSize: 12 * SCALE,
      letterSpacing: 2,
      align: "center",
    })

    const arrowsText = new Text("Left/Right Arrows = Move", keyTextStyle)
    arrowsText.anchor.set(0.5, 0.5)
    arrowsText.x = SceneManager.app.screen.width / 2
    arrowsText.y = 230 * SCALE
    this.addChild(arrowsText)

    const spaceText = new Text("Space = Dash", keyTextStyle)
    spaceText.anchor.set(0.5, 0.5)
    spaceText.x = SceneManager.app.screen.width / 2
    spaceText.y = 250 * SCALE
    this.addChild(spaceText)

    const selectedCharacter =
      parseInt(window.localStorage.getItem("selectedCharacter")) ?? 0
    this.setSelectedCharacter(selectedCharacter)
  }

  initializePlayerSprite(character: Character) {
    const index = characterToIndex[character]
    const spriteSheet = Loader.shared.resources[Resources.SPRITES].spritesheet
    const animationKey = `${character}/idle/idle`
    const animation = spriteSheet.animations[animationKey]
    const sprite = new AnimatedSprite(animation)

    sprite.scale.set(SCALE, SCALE)
    sprite.anchor.set(0.5, 0.5)

    const space = this.screenWidth - SCREEN_PADDING * 2
    const halfCharacterWidth = 16 * SCALE
    const x = (space / 4 - halfCharacterWidth) * (index + 1) + SCREEN_PADDING
    sprite.x = x
    sprite.y = 120 * SCALE
    sprite.tint = NOT_SELECTED_TINT
    sprite.animationSpeed = spriteSheet.animations[animationKey].length / 60

    this.characters[index] = sprite

    this.addChild(sprite)

    document.addEventListener("keydown", this.keyDownHandler)
  }

  keyDownHandler = (e: KeyboardEvent) => {
    if (e.code === Key.ArrowRight) {
      this.setSelectedCharacter((this.selectedCharacter + 1) % 4)
    }

    if (e.code === Key.ArrowLeft) {
      const newIndex = this.selectedCharacter - 1
      this.setSelectedCharacter(newIndex < 0 ? 3 : newIndex)
    }

    if (e.code === Key.Enter) {
      GameState.setState({
        character: indexToCharacter[this.selectedCharacter],
      })
      window.localStorage.setItem(
        "selectedCharacter",
        this.selectedCharacter.toString()
      )
      SceneManager.setScene(GameScene.id)
    }
  }

  setSelectedCharacter(index: number) {
    if (this.selectedCharacter !== index) {
      const previousCharacter = this.characters[this.selectedCharacter]
      previousCharacter.tint = NOT_SELECTED_TINT
      previousCharacter.stop()
    }

    this.selectedCharacter = index
    const newCharacter = this.characters[index]
    newCharacter.tint = 0xffffff
    newCharacter.play()
  }

  beforeDelete() {
    document.removeEventListener("keydown", this.keyDownHandler)
  }

  update() {
    this.noiseFilter.seed = Math.random()
  }
}
