// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { BORDER_STRONG } from '#shared/classes.js'
import type { KbdProps } from './types.js'

export type { KbdProps } from './types.js'

/** One keycap. A combination is sibling keys with no group part; the nested form of the
 * HTML spec is a plain outer kbd the caller writes. */
export function Kbd({ className, children, ...rest }: KbdProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-chip bg-surface px-1.5 py-0.5 font-mono text-xs text-body',
    BORDER_STRONG,
    className,
  )

  return <kbd className={classes} {...rest}>{children}</kbd>
}
