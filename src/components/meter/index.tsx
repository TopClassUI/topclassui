// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import { METER_BAR, METER_FILL, METER_TRACK, METER_TRACK_HEIGHT } from './classes.js'
import { METER_DEFAULTS } from './constants.js'
import { meterPercent, resolveMeterRange } from './lib.js'
import type { MeterProps } from './types.js'

/** A reading inside a known range: a neutral track with a bar in the tone. It renders no
 * text, so the type asks for a name, and the range and value are clamped before ARIA. */
export function Meter({
  value: given = METER_DEFAULTS.value,
  min: givenMin = METER_DEFAULTS.min,
  max: givenMax = METER_DEFAULTS.max,
  tone = METER_DEFAULTS.tone,
  size = METER_DEFAULTS.size,
  className,
  style,
  ...rest
}: MeterProps) {
  const { min, max, value } = resolveMeterRange(given, givenMin, givenMax)
  const percent = meterPercent(value, min, max)

  // The rest goes first: JSX accepts any hyphenated attribute, so aria-valuenow={150} type-checks.
  return (
    <div
      {...rest}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      data-tone={tone}
      data-size={size}
      style={{ ...style, '--tc-meter-value': `${String(percent)}%` }}
      className={cn(METER_TRACK, METER_TRACK_HEIGHT[size], className)}
    >
      <div className={cn(METER_BAR, METER_FILL[tone])} />
    </div>
  )
}

export type { MeterDesignProps, MeterName, MeterProps, MeterTone } from './types.js'
