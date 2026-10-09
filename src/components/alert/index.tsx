// No 'use client': a client bundle gets it only when a client file imports it.
import type { ReactNode } from 'react'

import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { ALERT_DEFAULTS, ALERT_ICONS } from './constants.js'
import type { AlertProps, AlertTone } from './types.js'
import { alertVariants } from './variants.js'

/** A JS caller can pass a tone no list holds: it gets the default icon, not a crash. */
const pickIcon = (tone: AlertTone) =>
  Object.hasOwn(ALERT_ICONS, tone) ? ALERT_ICONS[tone] : ALERT_ICONS[ALERT_DEFAULTS.tone]

/** These render nothing, so a slot holding one gets no element and opens no gap. */
const isEmpty = (node: ReactNode): boolean =>
  node == null || typeof node === 'boolean' || node === '' || (Array.isArray(node) && node.every(isEmpty))

/** A message on the page. No role: it is content, not a live region, so a caller who
 * needs one passes role="alert". The icon, title and description share one colour. */
export function Alert({
  variant = ALERT_DEFAULTS.variant,
  tone = ALERT_DEFAULTS.tone,
  icon,
  title,
  actions,
  className,
  children,
  ...rest
}: AlertProps) {
  return (
    <div
      data-variant={variant}
      data-tone={tone}
      className={cn(alertVariants({ variant, tone }), className)}
      {...rest}
    >
      {/* mt-0.5 centres the 16 px icon on the 20 px first line of text-sm. */}
      {icon === undefined ? <Svg icon={pickIcon(tone)} size="xs" className="mt-0.5" /> : icon}
      <div className="flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere">
        {isEmpty(title) ? null : <p className="text-sm font-semibold">{title}</p>}
        {isEmpty(children) ? null : <div className="text-sm">{children}</div>}
        {isEmpty(actions) ? null : <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </div>
    </div>
  )
}

export { alertVariants } from './variants.js'
export type { AlertDesignProps, AlertProps, AlertTone, AlertVariant } from './types.js'
