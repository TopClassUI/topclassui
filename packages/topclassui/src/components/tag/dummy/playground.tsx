'use client'

import { Tag, TagRemovable } from '../index.js'
import type { TagDesignProps } from '../types.js'

/** The site's Try it stage: every prop of the schema passed straight through; removable brings the x. */
export default function Demo({ removable = false, ...props }: TagDesignProps & { removable?: boolean }) {
  return removable
    ? <TagRemovable {...props} onRemove={() => undefined}>Design systems</TagRemovable>
    : <Tag {...props}>Design systems</Tag>
}
