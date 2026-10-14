'use client'

import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import { DISMISS, DISMISS_TONE } from './classes.js'
import { useBannerDismiss } from './hook.js'
import type { BannerShellProps } from './types.js'

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
        <Svg icon={x} />
      </button>
    </div>
  )
}
