// No 'use client': a client bundle gets it only when a client file imports it.
import { useId } from 'react'

import { cn } from '#shared/cn.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { TAG_BOUNDARIES } from './boundaries.js'
import { REMOVABLE, REMOVABLE_END, TAG_LABEL } from './classes.js'
import { TagRemove } from './client.js'
import { TAG_DEFAULTS } from './constants.js'
import type { TagProps, TagRemovableProps } from './types.js'
import { tagVariants } from './variants.js'

/** A label chip for a topic or a category. No role: the text carries the meaning. Without
 * onRemove it calls no hook and renders no client part, so it ships nothing to the browser. */
export function Tag({
  tone = TAG_DEFAULTS.tone,
  size = TAG_DEFAULTS.size,
  className,
  children,
  onRemove,
  ...rest
}: TagProps) {
  if (onRemove) {
    return <Removable tone={tone} size={size} className={className} onRemove={onRemove} {...rest}>{children}</Removable>
  }
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

/** The label in one span with an id, then the x, which reads that id after its own. */
function Removable({ tone, size, className, children, onRemove, ...rest }: TagRemovableProps) {
  const id = useId()
  const labelId = useId()
  return (
    <span
      data-tone={tone}
      data-size={size}
      className={cn(tagVariants({ tone, size }), REMOVABLE, REMOVABLE_END[size], className)}
      {...rest}
    >
      <span id={labelId} className={TAG_LABEL}>{truncateLabel(children, TAG_BOUNDARIES.labelMaxLength)}</span>
      <TagRemove id={id} labelId={labelId} tone={tone} size={size} onRemove={onRemove} />
    </span>
  )
}

export { tagVariants } from './variants.js'
export type { TagDesignProps, TagProps, TagTone } from './types.js'
