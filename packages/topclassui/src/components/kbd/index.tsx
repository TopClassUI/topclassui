// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { BORDER_STRONG } from '#shared/classes.js'
import { KBD_DEFAULTS } from './constants.js'
import type { KbdProps } from './types.js'

export type { KbdDesignProps, KbdProps } from './types.js'

/** One keycap. A combination is sibling keys with no group part; the nested form of the
 * HTML spec is a plain outer kbd the caller writes. */
export function Kbd({ pressed = KBD_DEFAULTS.pressed, disabled = KBD_DEFAULTS.disabled, className, children, ...rest }: KbdProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-chip bg-surface-raised px-1.5 py-0.5 font-mono text-xs text-body',
    // R-5.7-6: presence attributes. A key is not a control, so a disabled one keeps 4.5:1 text and fades its fill and line instead.
    'data-pressed:bg-surface data-disabled:bg-surface data-disabled:border-line data-disabled:text-muted',
    BORDER_STRONG,
    className,
  )

  return (
    <kbd data-pressed={pressed ? '' : undefined} data-disabled={disabled ? '' : undefined} className={classes} {...rest}>
      {children}
    </kbd>
  )
}
