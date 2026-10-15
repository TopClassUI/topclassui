// Pure helpers: no React here, so the arithmetic is tested on its own.
import { clamp } from '#shared/clamp.js'
import { METER_BOUNDARIES } from './boundaries.js'

export interface MeterRange { min: number; max: number; value: number }

/** R-5.7-7: both ends inside the guard rail, `max` raised to `min` when below it, and the value inside the result. */
export function resolveMeterRange(value: number, min: number, max: number): MeterRange {
  const low = clamp(min, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax)
  const high = Math.max(clamp(max, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax), low)
  return { min: low, max: high, value: clamp(value, low, high) }
}

/** How much of the track the bar covers, from 0 to 100; a range of one point is full. */
export function meterPercent(value: number, min: number, max: number): number {
  if (max === min) return 100
  return ((value - min) / (max - min)) * 100
}
