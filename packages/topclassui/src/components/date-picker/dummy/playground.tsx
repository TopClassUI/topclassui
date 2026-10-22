'use client'

import { useState } from 'react'

import { DatePicker } from '../index.js'
import type { DatePickerDesignProps } from '../types.js'

/** The calendar drawn open at its trigger inside its own box, as the frame draws it: not modal, and open on the first
 * render, so it takes no focus. A calendar placed on top has its trigger at the foot of the box, so it opens there. */
function Stage(props: DatePickerDesignProps) {
  // An element, not a ref: a popup open on the first render resolves its container before a ref is attached.
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  return (
    <div ref={setRoot} data-stage="" className="relative min-h-84 w-full [contain:paint]">
      <div className={props.placement?.startsWith('top') === true ? 'absolute inset-0 flex items-end justify-center pb-4' : 'flex justify-center pt-4'}>
        <DatePicker aria-label="Check-in" defaultValue="2026-09-22" firstDayOfWeek={1} defaultOpen modal={false} container={root} {...props} />
      </div>
    </div>
  )
}

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ stage = false, ...props }: DatePickerDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="date-picker-playground" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-playground" defaultValue="2026-09-22" firstDayOfWeek={1} {...props} />
    </div>
  )
}
