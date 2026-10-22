'use client'

import { useState } from 'react'

import { arrowDown } from '#icons/data/arrow-down.js'
import { arrowUp } from '#icons/data/arrow-up.js'
import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

const CELL = 'relative flex h-28 w-56 items-center justify-center overflow-hidden [contain:paint]'

/** Every state the frame draws, one equal cell each, captioned by its title: the hidden tooltip of a trigger
 * at rest, then one held open above its trigger and one below, each inside its own cell. Held by open,
 * since the provider's delay group closes an open tooltip as soon as another one opens. */
export default function Demo() {
  // Elements, not refs: a popup open on the first render resolves its container before a ref is attached.
  const [top, setTop] = useState<HTMLDivElement | null>(null)
  const [bottom, setBottom] = useState<HTMLDivElement | null>(null)
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div title="hidden" className="flex h-28 w-56 items-center justify-center">
        <TooltipRoot>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="Copy link">
                <Svg icon={linkSimple} />
              </Button>
            }
          />
          <TooltipPopup>Copy link</TooltipPopup>
        </TooltipRoot>
      </div>
      <div ref={setTop} title="top" className={CELL}>
        <TooltipRoot open>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="Top">
                <Svg icon={arrowUp} />
              </Button>
            }
          />
          <TooltipPopup container={top} className="px-2">Top</TooltipPopup>
        </TooltipRoot>
      </div>
      <div ref={setBottom} title="bottom" className={CELL}>
        <TooltipRoot open>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="Bottom">
                <Svg icon={arrowDown} />
              </Button>
            }
          />
          <TooltipPopup placement="bottom" container={bottom} className="px-2">Bottom</TooltipPopup>
        </TooltipRoot>
      </div>
    </div>
  )
}
