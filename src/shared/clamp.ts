/** R-5.7-7: every numeric prop has min and max in the schema and is clamped at runtime. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  if (min > max) return min
  return Math.min(Math.max(value, min), max)
}

/** Decimal places a number is written with, so the snapped value can be rounded to them. */
function places(n: number): number {
  const [, decimals = ''] = String(n).split('.')
  return decimals.length
}

/** Round to the nearest step from `min`, then clamp. A step of 0 or less is ignored. */
export function clampToStep(value: number, min: number, max: number, step: number): number {
  if (step <= 0 || !Number.isFinite(step)) return clamp(value, min, max)
  const steps = Math.round((clamp(value, min, max) - min) / step)
  const raw = min + steps * step
  // Binary floating point makes 0.1 + 2 * 0.1 read as 0.30000000000000004 in the DOM.
  const digits = Math.min(Math.max(places(min), places(step)), 15)
  return clamp(digits > 0 ? Number(raw.toFixed(digits)) : raw, min, max)
}
