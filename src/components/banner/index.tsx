// No 'use client': a client bundle gets it only when a client file imports it.
import type { ReactNode } from 'react'

import { cn } from '#shared/cn.js'
import { BANNER_DEFAULTS } from './constants.js'
import type { BannerProps } from './types.js'
import { bannerVariants } from './variants.js'

/** These render nothing, so a message holding one gets no element and opens no gap. */
const isEmpty = (node: ReactNode): boolean =>
  node == null || typeof node === 'boolean' || node === '' || (Array.isArray(node) && node.every(isEmpty))

/** A full-width message above the header, in the page flow. It is a named region, so
 * a screen reader lists it as a landmark; the icon and the action are the caller's. */
export function Banner({
  tone = BANNER_DEFAULTS.tone,
  icon,
  action,
  className,
  children,
  ...rest
}: BannerProps) {
  return (
    <div
      data-tone={tone}
      className={cn(bannerVariants({ tone }), className)}
      {...rest}
      role="region"
    >
      {icon}
      {isEmpty(children) ? null : <div className="min-w-0 flex-1">{children}</div>}
      {action}
    </div>
  )
}

export { bannerVariants } from './variants.js'
export type { BannerDesignProps, BannerName, BannerOwnProps, BannerProps, BannerTone } from './types.js'
