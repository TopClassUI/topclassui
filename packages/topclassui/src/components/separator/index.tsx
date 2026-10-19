// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { cn } from '#shared/cn.js'
import { SEPARATOR_LABELLED, SEPARATOR_ORIENTATION, SEPARATOR_SIDE } from './classes.js'
import { SEPARATOR_DEFAULTS } from './constants.js'
import type { SeparatorProps } from './types.js'

/** A hairline between two groups. Decorative by default, so it is not announced;
 * `decorative={false}` makes it a separator read with its orientation. */
export function Separator({
  orientation = SEPARATOR_DEFAULTS.orientation,
  decorative = SEPARATOR_DEFAULTS.decorative,
  className,
  children,
  ...rest
}: SeparatorProps) {
  // R-5.1-1 allows useId: an announced labelled line is named by its label.
  const labelId = useId()
  const labelled = children !== undefined && children !== null && children !== false && children !== ''
  return (
    <div
      data-orientation={orientation}
      className={cn(labelled ? SEPARATOR_LABELLED[orientation] : SEPARATOR_ORIENTATION[orientation], className)}
      {...rest}
      // After the rest, so a JS caller cannot pass a role that contradicts `decorative`.
      role={decorative ? 'none' : 'separator'}
      // axe rejects aria-orientation on role none (aria-allowed-attr).
      aria-orientation={decorative ? undefined : orientation}
      aria-labelledby={labelled && !decorative ? labelId : undefined}
    >
      {labelled ? (
        <>
          <span aria-hidden className={SEPARATOR_SIDE[orientation]} />
          <span id={labelId}>{children}</span>
          <span aria-hidden className={SEPARATOR_SIDE[orientation]} />
        </>
      ) : null}
    </div>
  )
}

export type { SeparatorDesignProps, SeparatorOrientation, SeparatorProps } from './types.js'
