// No 'use client': a client bundle gets it only when a client file imports it.
import { Children } from 'react'

import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { createNumberFormat } from '#shared/labels/get-labels.js'
import { GROUP_CHILD, GROUP_COUNTER, GROUP_OVERLAP, GROUP_RING, GROUP_ROOT } from './classes.js'
import { AVATAR_GROUP_DEFAULTS } from './constants.js'
import { splitOverflow } from './lib.js'
import type { AvatarGroupProps } from './types.js'

/** Overlapping avatars. The first `max` children show, and a last circle counts the
 * rest: an AvatarRoot of the same size, named by `labels.avatar.more`. */
export function AvatarGroup({
  max = AVATAR_GROUP_DEFAULTS.max,
  size = AVATAR_GROUP_DEFAULTS.size,
  labels = en,
  locale = AVATAR_GROUP_DEFAULTS.locale,
  className,
  children,
  ...rest
}: AvatarGroupProps) {
  const { visible, hidden } = splitOverflow(Children.toArray(children), max)
  // Built only when there is something to count: an Intl.NumberFormat is not cheap.
  const fmt = hidden > 0 ? createNumberFormat(locale) : undefined

  // The rest goes first, so a JavaScript caller cannot hand the group another role.
  return (
    <span
      {...rest}
      role="group"
      data-size={size}
      className={cn(GROUP_ROOT, GROUP_RING, GROUP_CHILD, GROUP_OVERLAP[size], className)}
    >
      {visible}
      {fmt && (
        <AvatarRoot size={size} role="img" aria-label={labels.avatar.more(hidden, fmt)} className={GROUP_COUNTER[size]}>
          {/* dir: an rtl paragraph would move a leading plus to the far side of its digits. */}
          <AvatarFallback dir="ltr">+{fmt.format(hidden)}</AvatarFallback>
        </AvatarRoot>
      )}
    </span>
  )
}

export type { AvatarGroupDesignProps, AvatarGroupProps } from './types.js'
