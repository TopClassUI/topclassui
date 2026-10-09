// No 'use client': a client bundle gets it only when a client file imports it.
import { circleNotch } from '#icons/data/circle-notch.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { Svg } from '#components/svg/index.js'
import { SPINNER_TONE } from './classes.js'
import { SPINNER_DEFAULTS } from './constants.js'
import type { SpinnerProps } from './types.js'

/** A wait of unknown length. Named but silent: an img with a name and no live region, as
 * the Feedback section asks. `aria-hidden` makes it decorative, beside its own text. */
export function Spinner({
  size = SPINNER_DEFAULTS.size,
  tone = SPINNER_DEFAULTS.tone,
  labels = en,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...rest
}: SpinnerProps) {
  // Svg writes role, aria-label and aria-hidden after its spread, so they are read here.
  const decorative = ariaHidden === true || ariaHidden === 'true'

  // An empty string names nothing and Svg would hide it; hiding is what aria-hidden is for.
  const name = ariaLabel === undefined || ariaLabel === '' ? labels.common.loading : ariaLabel

  // custom passes nothing, so the 1em default of Svg follows the text.
  const length = size === 'custom' ? undefined : size

  return (
    <Svg
      data-tone={tone}
      data-size={size}
      {...rest}
      icon={circleNotch}
      size={length}
      label={decorative ? undefined : name}
      flipRtl={false}
      // An svg keeps an authored colour under forced colors (UA preserve-parent-color), so it inherits there.
      className={cn('animate-spin motion-reduce:animate-none', SPINNER_TONE[tone], 'forced-colors:text-current', className)}
    />
  )
}

export type { SpinnerDesignProps, SpinnerProps, SpinnerTone } from './types.js'
