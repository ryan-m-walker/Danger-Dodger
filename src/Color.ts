export class Color {
  static fromRGB(r: number, g: number, b: number) {
    const hexString = [r.toString(16), g.toString(16), b.toString(16)].join("")
    return new Color("#" + hexString)
  }

  public readonly hex: number
  public readonly hexString: string
  public readonly r: number
  public readonly g: number
  public readonly b: number

  constructor(hex: string) {
    const string = hex.replace("#", "")
    const [r, g, b] = [0, 2, 4].map((o) => string.slice(o, o + 2))
    this.r = parseInt(r, 16)
    this.g = parseInt(g, 16)
    this.b = parseInt(b, 16)
    this.hex = parseInt(string, 16)
    this.hexString = hex
  }

  /**
   * Blend to colors given a certain percentage and return the new blended color
   * @param other the other color to blend with
   * @param percent 0-1, 0 = 100% all this color, 1 = 100% the other color
   */
  blend(other: Color, percent: number = 0.5): Color {
    return Color.fromRGB(
      Math.round((1 - percent) * this.r + percent * other.r),
      Math.round((1 - percent) * this.g + percent * other.g),
      Math.round((1 - percent) * this.b + percent * other.b)
    )
  }
}
