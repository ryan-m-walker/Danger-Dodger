export class Vector {
  constructor(public x: number, public y: number) {}

  clone(): Vector {
    return new Vector(this.x, this.y)
  }

  inverse(): this {
    this.x = this.x * -1
    this.y = this.y * -1
    return this
  }

  add(other: Vector): this {
    this.x += other.x
    this.y += other.y
    return this
  }

  subtract(other: Vector): this {
    this.x -= other.x
    this.y -= other.y
    return this
  }

  multiply(scale: number): this {
    this.x *= scale
    this.y *= scale
    return this
  }

  divide(scale: number): this {
    this.x /= scale
    this.y /= scale
    return this
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSq())
  }

  magnitudeSq(): number {
    return this.x * this.x + this.y * this.y
  }

  normalize(): this {
    const mag = this.magnitude()
    if (mag === 0) {
      this.x = 1
      this.y = 0
    } else {
      this.divide(mag)
    }
    return this
  }

  copy(): Vector {
    return new Vector(this.x, this.y)
  }

  setMagnitutde(mag: number): this {
    this.normalize()
    this.multiply(mag)
    return this
  }

  heading(): number {
    return this.copy().normalize().magnitude()
  }

  limit(max: number): void {
    const magSq = this.magnitudeSq()
    if (magSq > max * max) {
      this.divide(Math.sqrt(magSq)).multiply(max)
    }
  }

  min(limit: number): void {
    if (this.x < limit) {
      this.x = limit
    }

    if (this.y < limit) {
      this.y = limit
    }
  }

  static add(v: Vector, u: Vector): Vector {
    return new Vector(v.x + u.x, v.y + u.y)
  }

  static subract(v: Vector, u: Vector): Vector {
    return new Vector(v.x - u.x, v.y - u.y)
  }

  static multiply(v: Vector, scale: number): Vector {
    return new Vector(v.x * scale, v.y * scale)
  }

  static divide(v: Vector, scale: number): Vector {
    return new Vector(v.x / scale, v.y / scale)
  }
}
