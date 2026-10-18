// Pure helpers: no React here, so the arithmetic is tested on its own.
import { clamp } from '#shared/clamp.js'
import { METER_BOUNDARIES } from './boundaries.js'
import { METER_DEFAULTS } from './constants.js'
import type { MeterRange } from './types.js'

/** One end inside the guard rail. clamp() turns NaN into the rail's own -1e15, so a NaN end takes its default. */
function bound(end: number, fallback: number): number {
  return clamp(Number.isNaN(end) ? fallback : end, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax)
}

/** R-5.7-7: both ends inside the guard rail, `max` raised to `min` when below it, and the value inside the result. */
export function resolveMeterRange(value: number, min: number, max: number): MeterRange {
  const low = bound(min, METER_DEFAULTS.min)
  const high = Math.max(bound(max, METER_DEFAULTS.max), low)
  return { min: low, max: high, value: clamp(value, low, high) }
}

/** How much of the track the bar covers, from 0 to 100; a range of one point is full. */
export function meterPercent(value: number, min: number, max: number): number {
  if (max === min) return 100
  return ((value - min) / (max - min)) * 100
}
