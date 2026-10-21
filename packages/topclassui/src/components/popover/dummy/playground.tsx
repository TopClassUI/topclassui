'use client'

import { useState } from 'react'

import { arrowSquareOut } from '#icons/data/arrow-square-out.js'
import { copy } from '#icons/data/copy.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'
import type { PopoverDesignProps } from '../types.js'

/** The docs stage: the basic popover, the frame's drawing with its x, with the schema's props passed through, so the Try it
 * controls drive it. The delays only apply with openOnHover; a press and the keyboard still open it.
 * With stage it is drawn open at its trigger inside its own box, as the frame draws it, and takes no focus. */
export default function Demo({ placement, delay, closeDelay, stage = false }: PopoverDesignProps & { stage?: boolean } = {}) {
  // An element, not a ref: a popup open on the first render resolves its container before a ref is attached.
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const popover = (
    <PopoverRoot defaultOpen={stage}>
      <PopoverTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline" size="sm"><Svg icon={arrowSquareOut} />Share</Button>} />
      <PopoverPopup placement={placement} container={stage ? root : undefined} initialFocus={stage ? false : undefined}>
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverClose />
        </div>
        <PopoverDescription>Anyone with the link can read it. Only your team can edit.</PopoverDescription>
        <Button size="sm" className="self-start"><Svg icon={copy} />Copy link</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
  if (!stage) return popover
  return (
    <div ref={setRoot} data-stage="" className="relative min-h-87 w-full [contain:paint]">
      <div className="flex justify-center pt-12">{popover}</div>
    </div>
  )
}
