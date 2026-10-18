// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { MESSAGE } from './classes.js'
import { BannerShell } from './client.js'
import { BANNER_DEFAULTS } from './constants.js'
import { isEmpty } from './lib.js'
import type { BannerProps } from './types.js'
import { bannerVariants } from './variants.js'

/** A full-width message above the header, in the page flow. It is a named region, so
 * a screen reader lists it as a landmark; the icon and the action are the caller's. */
export function Banner({
  tone = BANNER_DEFAULTS.tone,
  icon,
  action,
  className,
  children,
  dismissible = BANNER_DEFAULTS.dismissible,
  ...rest
}: BannerProps) {
  const content = (
    <>
      {icon}
      {isEmpty(children) ? null : <div className={MESSAGE}>{children}</div>}
      {action}
    </>
  )

  // Only a dismissible banner reaches the client module, handed no function; a JS caller with no id gets the plain one.
  if (dismissible && rest.id !== undefined) {
    const look = cn(bannerVariants({ tone }), className)
    return (
      <BannerShell data-tone={tone} className={look} {...rest} id={rest.id} role="region">
        {content}
      </BannerShell>
    )
  }

  return (
    <div
      data-tone={tone}
      className={cn(bannerVariants({ tone }), className)}
      {...rest}
      role="region"
    >
      {content}
    </div>
  )
}

export { BannerDismissible } from './client.js'
export { bannerVariants } from './variants.js'
export type {
  BannerDesignProps, BannerDismissal, BannerDismissibleProps, BannerName, BannerOwnProps, BannerProps, BannerTone,
} from './types.js'
