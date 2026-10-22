'use client'

import { Tag, TagRemovable } from '../index.js'
import type { TagDesignProps } from '../types.js'

/** The site's Try it stage: every prop of the schema passed straight through; removable brings the x, which disabled turns off. */
export default function Demo({ removable = false, disabled, ...props }: TagDesignProps & { removable?: boolean, disabled?: boolean }) {
  return removable
    ? <TagRemovable {...props} disabled={disabled} onRemove={() => undefined}>Design systems</TagRemovable>
    : <Tag {...props}>Design systems</Tag>
}
