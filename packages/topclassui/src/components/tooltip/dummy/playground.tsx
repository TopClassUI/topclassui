'use client'

import { useState } from 'react'

import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipDesignProps } from '../types.js'

/** The docs stage: the basic tooltip, with the schema's props passed through, so the Try it
 * controls drive it. The delays go to the trigger and the placement to the popup. With stage
 * it is held open at its trigger inside its own box, as the frame draws it, whatever tooltip opens beside it. */
export default function Demo({ placement, delay, closeDelay, stage = false }: TooltipDesignProps & { stage?: boolean } = {}) {
  // An element, not a ref: a popup open on the first render resolves its container before a ref is attached.
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const tooltip = (
    <TooltipRoot open={stage ? true : undefined}>
      <TooltipTrigger
        delay={delay}
        closeDelay={closeDelay}
        render={
          <Button variant="ghost" aria-label="Copy link">
            <Svg icon={linkSimple} />
          </Button>
        }
      />
      <TooltipPopup placement={placement} container={stage ? root : undefined}>Copy link</TooltipPopup>
    </TooltipRoot>
  )
  if (!stage) return tooltip
  return (
    <div ref={setRoot} data-stage="" className="relative min-h-87 w-full [contain:paint]">
      <div className="absolute inset-0 flex items-center justify-center">{tooltip}</div>
    </div>
  )
}
