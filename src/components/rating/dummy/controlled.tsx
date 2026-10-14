'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Rating } from '../index.js'

/** value and onValueChange need a client file: a Server Component page cannot pass a function. */
export default function Demo() {
  const [value, setValue] = useState(2)
  return (
    <div className="flex flex-col items-start gap-3">
      <Rating readOnly={false} value={value} onValueChange={setValue} aria-label="Delivery" />
      <p className="text-sm" data-chosen={value}>Chosen: {value} of 5</p>
      <Button variant="outline" onClick={() => { setValue(0) }}>Clear</Button>
    </div>
  )
}
