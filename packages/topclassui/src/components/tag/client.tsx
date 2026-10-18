'use client'

import { Svg } from '#components/svg/index.js'
import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { TAG_BOUNDARIES } from './boundaries.js'
import { REMOVABLE, REMOVABLE_END, REMOVE_SIZE, TAG_LABEL, TAG_REMOVE } from './classes.js'
import { TAG_DEFAULTS } from './constants.js'
import { useTagRemovable } from './hook.js'
import type { TagRemovableProps } from './types.js'
import { tagVariants } from './variants.js'

/** A Tag with an x, the label in one span and then the button, named "Remove React". The x
 * calls onRemove with nothing; the caller takes the tag out of its list, and the hook moves the focus. */
export function TagRemovable({
  tone = TAG_DEFAULTS.tone,
  size = TAG_DEFAULTS.size,
  className,
  children,
  onRemove,
  ...rest
}: TagRemovableProps) {
  const tag = useTagRemovable(onRemove)
  return (
    <span
      data-tone={tone}
      data-size={size}
      className={cn(tagVariants({ tone, size }), REMOVABLE, REMOVABLE_END[size], className)}
      {...rest}
    >
      <span id={tag.labelId} className={TAG_LABEL}>{truncateLabel(children, TAG_BOUNDARIES.labelMaxLength)}</span>
      <button
        type="button"
        id={tag.id}
        aria-label={tag.label}
        aria-labelledby={`${tag.id} ${tag.labelId}`}
        data-tag-remove=""
        className={cn(TAG_REMOVE, TONE_CLASS[tone], REMOVE_SIZE[size])}
        onClick={tag.remove}
      >
        <Svg icon={x} />
      </button>
    </span>
  )
}
