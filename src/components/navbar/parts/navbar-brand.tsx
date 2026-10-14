import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { NAVBAR_BOUNDARIES } from '../boundaries.js'
import { NAVBAR_BRAND } from '../classes.js'
import type { NavbarBrandProps } from '../types.js'

/** The name of the site, as a link home: a plain anchor, or the element in `render`. Its
 * text sits in a span of its own, so a name longer than the bar ends in an ellipsis. */
export function NavbarBrand({ render, className, children, ...rest }: NavbarBrandProps) {
  return renderElement(render ?? <a />, {
    className: cn(NAVBAR_BRAND, className),
    children: truncateLabel(children, NAVBAR_BOUNDARIES.labelMaxLength),
    ...rest,
  })
}
