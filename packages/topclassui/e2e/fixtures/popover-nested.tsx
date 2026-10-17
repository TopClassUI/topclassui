// Loaded into a live page by e2e/popover.spec.ts: the layers one Escape must tell apart. A tooltip inside a
// popover, a popover inside a dialog (opened by a press, and by hover, which leaves the focus in the dialog),
// and a popover inside a popover. Each popup is a dialog to Base UI, so each guard must know its own.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { copy } from '#icons/data/copy.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '#components/popover/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24 }

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="nested" style={ROW}>
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Tooltip inside</Button>} />
          <PopoverPopup>
            <PopoverTitle>Share this page</PopoverTitle>
            <TooltipRoot>
              <TooltipTrigger
                render={<Button variant="outline" size="sm" aria-label="Copy link"><Svg icon={copy} /></Button>}
              />
              <TooltipPopup>Copy link</TooltipPopup>
            </TooltipRoot>
            <PopoverClose render={<Button size="sm">Done</Button>} />
          </PopoverPopup>
        </PopoverRoot>

        <DialogRoot>
          <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
            <DialogBody>
              <div style={ROW}>
                <PopoverRoot>
                  <PopoverTrigger render={<Button variant="outline" size="sm">By a press</Button>} />
                  <PopoverPopup>
                    <PopoverTitle>Opened by a press</PopoverTitle>
                    <PopoverDescription>The focus is inside this popover.</PopoverDescription>
                    <Button size="sm">Apply</Button>
                  </PopoverPopup>
                </PopoverRoot>
                <PopoverRoot>
                  <PopoverTrigger openOnHover delay={0} render={<Button variant="outline" size="sm">By hover</Button>} />
                  <PopoverPopup>
                    <PopoverTitle>Opened by hover</PopoverTitle>
                    <PopoverDescription>The focus stays in the dialog.</PopoverDescription>
                  </PopoverPopup>
                </PopoverRoot>
              </div>
            </DialogBody>
            <DialogFooter><DialogClose render={<Button>Done</Button>} /></DialogFooter>
          </DialogPopup>
        </DialogRoot>

        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Outer</Button>} />
          <PopoverPopup>
            <PopoverTitle>Outer popover</PopoverTitle>
            <PopoverRoot>
              <PopoverTrigger render={<Button variant="outline" size="sm">Inner</Button>} />
              <PopoverPopup placement="end">
                <PopoverTitle>Inner popover</PopoverTitle>
                <Button size="sm">Inner action</Button>
              </PopoverPopup>
            </PopoverRoot>
          </PopoverPopup>
        </PopoverRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
