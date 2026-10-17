'use client'

import { Tag } from '../index.js'

/** A tag has two states, plain and removable: only the x is interactive, and no disabled state is built. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag>Plain</Tag>
      <Tag onRemove={() => undefined}>Removable</Tag>
    </div>
  )
}
