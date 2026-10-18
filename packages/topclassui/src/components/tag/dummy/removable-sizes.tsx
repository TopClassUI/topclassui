'use client'

import { useRef, useState } from 'react'

import { Button } from '#components/button/index.js'
import { TagRemovable } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const NAMES = { xs: 'Extra small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra large' } as const

/** Every step of the scale with its x. A removed tag sends the focus to the button that brings it back. */
export default function Demo() {
  const [shown, setShown] = useState<readonly string[]>(SIZES)
  const back = useRef<HTMLButtonElement>(null)
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {SIZES.filter((size) => shown.includes(size)).map((size) => (
          <TagRemovable key={size} size={size} tone="info" onRemove={() => { setShown(shown.filter((other) => other !== size)); back.current?.focus() }}>
            {NAMES[size]}
          </TagRemovable>
        ))}
      </div>
      <Button ref={back} variant="outline" size="sm" onClick={() => { setShown(SIZES) }}>Show every size</Button>
    </div>
  )
}
