// No 'use client': a client bundle gets it only when a client file imports it.
import type { ReactNode } from 'react'

import { tray } from '#icons/data/tray.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { Svg } from '#components/svg/index.js'
import { DESCRIPTION, ICON, ROOT, TITLE } from './classes.js'
import type { EmptyStateProps } from './types.js'

// A wrapper around nothing would still open a gap in the column, so it is left out.
const isBlank = (node: ReactNode) => node == null || typeof node === 'boolean' || node === ''

/** What a collection renders when it has nothing to show. No role and no live region:
 * it is page content, so it stays silent. The action is the caller's own Button. */
export function EmptyState({
  icon,
  title,
  description,
  labels = en,
  locale: _locale,
  className,
  children,
  ...rest
}: EmptyStateProps) {
  const shownIcon = icon === undefined ? <Svg icon={tray} size="xl" className={ICON} /> : icon
  const shownTitle = title === undefined ? labels.state.empty : title
  // The default description explains the default title, so a caller's title drops it.
  const shownDescription = description === undefined && title === undefined
    ? labels.state.emptyDescription
    : description

  return (
    <div className={cn(ROOT, className)} {...rest}>
      {shownIcon}
      {isBlank(shownTitle) ? null : <p className={TITLE}>{shownTitle}</p>}
      {isBlank(shownDescription) ? null : <div className={DESCRIPTION}>{shownDescription}</div>}
      {children}
    </div>
  )
}

export type { EmptyStateProps } from './types.js'
