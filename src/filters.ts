import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom"
import { SCALE } from "./constants"

export const bloomFilter = new AdvancedBloomFilter({
  bloomScale: 0.1 * SCALE,
  threshold: 0.1 * SCALE,
  quality: 3,
  brightness: 1,
})
