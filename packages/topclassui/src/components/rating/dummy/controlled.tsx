'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { RatingInput } from '../index.js'

/** RatingInput takes onValueChange, so a client file renders it: a Server Component page cannot pass a function. */
export default function Demo() {
  const [value, setValue] = useState(2)
  return (
    <div className="flex flex-col items-start gap-3">
      <RatingInput value={value} onValueChange={setValue} aria-label="Delivery" />
      <p className="text-sm" data-chosen={value}>Chosen: {value} of 5</p>
      <Button variant="outline" onClick={() => { setValue(0) }}>Clear</Button>
    </div>
  )
}
