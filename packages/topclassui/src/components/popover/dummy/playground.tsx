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

/** The popover drawn open at its trigger inside its own box, as the frame draws it with its x, and it takes no focus.
 * A popup placed on top has its trigger at the foot of the box, so it opens there instead of flipping. */
function Stage({ placement, delay, closeDelay }: PopoverDesignProps) {
  // An element, not a ref: a popup open on the first render resolves its container before a ref is attached.
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  return (
    <div ref={setRoot} data-stage="" className="relative min-h-67.75 w-full [contain:paint]">
      <div className={placement?.startsWith('top') === true ? 'absolute inset-0 flex items-end justify-center pb-12' : 'flex justify-center pt-12'}>
        <PopoverRoot defaultOpen>
          <PopoverTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline" size="xs" className="gap-1.5"><Svg icon={arrowSquareOut} />Share</Button>} />
          <PopoverPopup placement={placement} container={root} initialFocus={false}>
            <div className="flex items-center justify-between gap-2">
              <PopoverTitle>Share this page</PopoverTitle>
              <PopoverClose className="-my-1" />
            </div>
            <PopoverDescription className="text-sm/tight">Anyone with the link can read it. Only your team can edit.</PopoverDescription>
            <Button size="xs" className="self-start"><Svg icon={copy} />Copy link</Button>
          </PopoverPopup>
        </PopoverRoot>
      </div>
    </div>
  )
}

/** The docs stage: the basic popover, with the schema's props passed through, so the Try it
 * controls drive it. The delays only apply with openOnHover; a press and the keyboard still open it.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ placement, delay, closeDelay, stage = false }: PopoverDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage placement={placement} delay={delay} closeDelay={closeDelay} />
  return (
    <PopoverRoot>
      <PopoverTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline" size="xs" className="gap-1.5"><Svg icon={arrowSquareOut} />Share</Button>} />
      <PopoverPopup placement={placement}>
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverClose className="-my-1" />
        </div>
        <PopoverDescription className="text-sm/tight">Anyone with the link can read it. Only your team can edit.</PopoverDescription>
        <Button size="xs" className="self-start"><Svg icon={copy} />Copy link</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}
