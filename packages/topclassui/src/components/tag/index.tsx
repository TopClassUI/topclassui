// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { TAG_BOUNDARIES } from './boundaries.js'
import { TAG_DEFAULTS } from './constants.js'
import type { TagProps } from './types.js'
import { tagVariants } from './variants.js'

/** A label chip for a topic or a category. No role: the text carries the meaning. It takes
 * only serializable props, so a Server Component page renders it as it is; TagRemovable adds the x. */
export function Tag({
  tone = TAG_DEFAULTS.tone,
  size = TAG_DEFAULTS.size,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span
      data-tone={tone}
      data-size={size}
      className={cn(tagVariants({ tone, size }), className)}
      {...rest}
    >
      {truncateLabel(children, TAG_BOUNDARIES.labelMaxLength)}
    </span>
  )
}

export { TagRemovable } from './client.js'
export { tagVariants } from './variants.js'
export type { TagDesignProps, TagProps, TagRemovableProps, TagTone } from './types.js'
