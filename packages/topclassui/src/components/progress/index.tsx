// No 'use client': a client bundle gets it only when a client file imports it.
import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import { PROGRESS_BOUNDARIES } from './boundaries.js'
import { BAR_FILL, TRACK, TRACK_HEIGHT } from './classes.js'
import { PROGRESS_DEFAULTS } from './constants.js'
import type { ProgressProps } from './types.js'

/** A neutral track with a bar in the tone. It renders no text, so the type asks for a
 * name, and the value is clamped before it reaches ARIA or the width of the bar. */
export function Progress({
  value = PROGRESS_DEFAULTS.value,
  tone: chosenTone,
  size = PROGRESS_DEFAULTS.size,
  indeterminate = PROGRESS_DEFAULTS.indeterminate,
  className,
  style,
  ...rest
}: ProgressProps) {
  const tone = chosenTone ?? PROGRESS_DEFAULTS.tone
  const percent = clamp(value, PROGRESS_BOUNDARIES.valueMin, PROGRESS_BOUNDARIES.valueMax)
  // An unknown wait is never complete, whatever value it was also given.
  const complete = !indeterminate && percent === PROGRESS_BOUNDARIES.valueMax
  // The previewer draws a finished bar in success when no tone was asked for; a chosen tone keeps its meaning at 100.
  const fill = complete && chosenTone === undefined ? 'success' : tone

  // The rest goes first: JSX accepts any hyphenated attribute, so aria-valuenow={150} type-checks.
  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={PROGRESS_BOUNDARIES.valueMin}
      aria-valuemax={PROGRESS_BOUNDARIES.valueMax}
      aria-valuenow={indeterminate ? undefined : percent}
      data-tone={tone}
      data-size={size}
      data-complete={complete ? '' : undefined}
      data-indeterminate={indeterminate ? '' : undefined}
      style={{ ...style, '--tc-progress-value': `${String(percent)}%` }}
      className={cn(
        TRACK,
        TRACK_HEIGHT[size],
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-control forced-colors:bg-[CanvasText]',
          indeterminate ? 'w-1/3 animate-pulse motion-reduce:animate-none' : 'w-(--tc-progress-value)',
          BAR_FILL[fill],
        )}
      />
    </div>
  )
}

export type { ProgressDesignProps, ProgressName, ProgressProps, ProgressTone } from './types.js'
