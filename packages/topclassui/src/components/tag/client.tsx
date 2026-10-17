'use client'

import { Svg } from '#components/svg/index.js'
import { x } from '#icons/data/x.js'
import { cn } from '#shared/cn.js'
import { TONE_CLASS } from '#shared/contracts/tone.js'
import { REMOVE_SIZE, TAG_REMOVE } from './classes.js'
import { useTagRemove } from './hook.js'
import type { TagRemoveProps } from './types.js'

/** The x of a removable Tag, internal. Named by itself then the label, so it reads "Remove React".
 * It calls onRemove with nothing; the caller takes the tag out of its list, and the hook moves the focus. */
export function TagRemove({ id, labelId, tone, size, onRemove }: TagRemoveProps) {
  const { label, remove } = useTagRemove(onRemove)
  return (
    <button
      type="button"
      id={id}
      aria-label={label}
      aria-labelledby={`${id} ${labelId}`}
      data-tag-remove=""
      className={cn(TAG_REMOVE, TONE_CLASS[tone], REMOVE_SIZE[size])}
      onClick={remove}
    >
      <Svg icon={x} />
    </button>
  )
}
