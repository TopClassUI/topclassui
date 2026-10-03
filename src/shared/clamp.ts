/** R-5.7-7: every numeric prop has min and max in the schema and is clamped at runtime. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  if (min > max) return min
  return Math.min(Math.max(value, min), max)
}

/** Round to the nearest step from `min`, then clamp. A step of 0 or less is ignored. */
export function clampToStep(value: number, min: number, max: number, step: number): number {
  if (step <= 0 || !Number.isFinite(step)) return clamp(value, min, max)
  const steps = Math.round((clamp(value, min, max) - min) / step)
  return clamp(min + steps * step, min, max)
}
