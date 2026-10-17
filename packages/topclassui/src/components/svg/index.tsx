import { cn } from '#shared/cn.js'
import { resolveIconSize } from '#shared/contracts/size.js'
import type { SvgProps } from './types.js'

export type { SvgProps } from './types.js'

/** R-7-1: the entry point for client and shared files, which import their icon explicitly. */
export function Svg({ icon, size = '1em', label, flipRtl, className, ...rest }: SvgProps) {
  const length = resolveIconSize(size)
  const flip = flipRtl ?? icon.directional
  // An empty label would be an img with no accessible name, which fails axe.
  const labelled = label !== undefined && label !== ''

  return (
    <svg
      {...rest}
      width={length}
      height={length}
      viewBox={icon.viewBox}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      className={cn('inline-block shrink-0', flip && 'rtl:-scale-x-100', className)}
    >
      {icon.path === '' ? null : <path d={icon.path} fill="currentColor" />}
    </svg>
  )
}
