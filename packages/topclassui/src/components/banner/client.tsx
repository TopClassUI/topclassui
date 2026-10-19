'use client'

import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import { DISMISS, DISMISS_TONE, MESSAGE } from './classes.js'
import { BANNER_DEFAULTS } from './constants.js'
import { useBannerDismiss } from './hook.js'
import { isEmpty } from './lib.js'
import type { BannerDismissibleProps, BannerShellProps } from './types.js'
import { bannerVariants } from './variants.js'

/** The root of a dismissible banner: the server's div and children, then the x. Once
 * dismissed it renders nothing, here and on every later page of this browser. */
export function BannerShell({ id, onDismiss, children, ...rest }: BannerShellProps) {
  const banner = useBannerDismiss(id, onDismiss)
  if (banner.dismissed) return null
  return (
    <div {...rest} id={id}>
      {children}
      <button
        type="button"
        aria-label={banner.label}
        onClick={banner.dismiss}
        className={cn(DISMISS, DISMISS_TONE[rest['data-tone']])}
      >
        <Svg icon={x} size={14} />
      </button>
    </div>
  )
}

/** A dismissible Banner for a client caller: the same region and x, and onDismiss, called once
 * when the x is pressed. Banner itself takes no function, so a Server Component page renders it. */
export function BannerDismissible({
  tone = BANNER_DEFAULTS.tone,
  icon,
  action,
  className,
  children,
  onDismiss,
  ...rest
}: BannerDismissibleProps) {
  return (
    <BannerShell data-tone={tone} className={cn(bannerVariants({ tone }), className)} {...rest} role="region" onDismiss={onDismiss}>
      {icon}
      {isEmpty(children) ? null : <div className={MESSAGE}>{children}</div>}
      {action}
    </BannerShell>
  )
}
