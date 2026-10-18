import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { NAVBAR_BOUNDARIES } from '../boundaries.js'
import { NAVBAR_LINK } from '../classes.js'
import { NAVBAR_DEFAULTS } from '../constants.js'
import type { NavbarLinkProps } from '../types.js'

/** One link: a plain anchor, or the element in `render`; NavbarLinks gives it its list item.
 * `current` marks the page being read. */
export function NavbarLink({
  current = NAVBAR_DEFAULTS.current,
  render,
  className,
  children,
  ...rest
}: NavbarLinkProps) {
  return renderElement(render ?? <a />, {
    'aria-current': current ? 'page' : undefined,
    className: cn(NAVBAR_LINK, className),
    children: truncateLabel(children, NAVBAR_BOUNDARIES.labelMaxLength),
    ...rest,
  })
}
