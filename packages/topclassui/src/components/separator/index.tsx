// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { SEPARATOR_ORIENTATION } from './classes.js'
import { SEPARATOR_DEFAULTS } from './constants.js'
import type { SeparatorProps } from './types.js'

/** A hairline between two groups. Decorative by default, so it is not announced;
 * `decorative={false}` makes it a separator read with its orientation. */
export function Separator({
  orientation = SEPARATOR_DEFAULTS.orientation,
  decorative = SEPARATOR_DEFAULTS.decorative,
  className,
  ...rest
}: SeparatorProps) {
  return (
    <div
      data-orientation={orientation}
      className={cn(SEPARATOR_ORIENTATION[orientation], className)}
      {...rest}
      // After the rest, so a JS caller cannot pass a role that contradicts `decorative`.
      role={decorative ? 'none' : 'separator'}
      // axe rejects aria-orientation on role none (aria-allowed-attr).
      aria-orientation={decorative ? undefined : orientation}
    />
  )
}

export type { SeparatorDesignProps, SeparatorOrientation, SeparatorProps } from './types.js'
