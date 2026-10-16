import { useId } from 'react'

import { cn } from '#shared/cn.js'
import { hasContent } from '#shared/render-trigger.js'
import { SIDEBAR_BOUNDARIES } from '../boundaries.js'
import { SIDEBAR_GROUP, SIDEBAR_GROUP_LABEL, SIDEBAR_LIST } from '../classes.js'
import { boundLabel, resolveDir } from '../lib.js'
import type { SidebarGroupProps } from '../types.js'

/** One list of links, named by its label when it has one. The label is a paragraph, not a
 * heading: the outline of the page belongs to the page. */
export function SidebarGroup({ label, className, children, ...rest }: SidebarGroupProps) {
  const id = useId()
  const named = hasContent(label)
  return (
    <div className={cn(SIDEBAR_GROUP, className)} {...rest}>
      {named ? <p id={id} dir={resolveDir(label)} className={SIDEBAR_GROUP_LABEL}>{boundLabel(label, SIDEBAR_BOUNDARIES.labelMaxLength)}</p> : null}
      {/* Preflight removes the list style, and Safari with VoiceOver then drops the list role. */}
      <ul role="list" aria-labelledby={named ? id : undefined} className={SIDEBAR_LIST}>
        {children}
      </ul>
    </div>
  )
}
