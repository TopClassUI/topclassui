'use client'

import { useState } from 'react'

import { Tag, TagRemovable } from '../index.js'

/** The docs stage as Figma 135:285 draws it: four tones, then a removable danger tag whose x takes it out. */
export default function Demo() {
  const [removed, setRemoved] = useState(false)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="primary">primary</Tag>
      <Tag tone="neutral">neutral</Tag>
      <Tag tone="success">success</Tag>
      <Tag tone="warning">warning</Tag>
      {removed ? null : <TagRemovable tone="danger" onRemove={() => { setRemoved(true) }}>danger</TagRemovable>}
    </div>
  )
}
