import type { ReactNode } from 'react'

import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { hasContent } from '#shared/render-trigger.js'
import { SIDEBAR_BOUNDARIES } from '../boundaries.js'
import { SIDEBAR_ICON, SIDEBAR_LINK, SIDEBAR_LINK_LABEL, SIDEBAR_LINK_STATE } from '../classes.js'
import { SIDEBAR_DEFAULTS } from '../constants.js'
import { boundLabel, resolveDir } from '../lib.js'
import type { SidebarLinkProps } from '../types.js'

/** One row: a real link, which SidebarGroup puts in a list item. The label has an element of its own,
 * which a collapsed rail hides and a screen reader still reads, so the link keeps its name. */
export function SidebarLink({
  render,
  icon,
  current = SIDEBAR_DEFAULTS.current,
  className,
  children,
  ...rest
}: SidebarLinkProps) {
  const state = current ? 'current' : 'rest'
  // Composed rather than replaced, so render={<Link href="/x">Docs</Link>} keeps its icon and a label that can hide.
  const row = (label: ReactNode) => (
    <>
      {hasContent(icon) ? <span className={SIDEBAR_ICON[state]}>{icon}</span> : null}
      {hasContent(label)
        ? <span dir={resolveDir(label)} className={SIDEBAR_LINK_LABEL}>{boundLabel(label, SIDEBAR_BOUNDARIES.labelMaxLength)}</span>
        : null}
    </>
  )

  return renderElement(render ?? <a />, {
    className: cn(SIDEBAR_LINK, SIDEBAR_LINK_STATE[state], className),
    children,
    ...rest,
    // After the rest: JSX lets a hyphenated attribute past the type, and the row must look the way it is announced.
    'aria-current': current ? 'page' : undefined,
  }, row)
}
