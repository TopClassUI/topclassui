// Loaded into a live page by e2e/drawer.spec.ts: a sheet that blocks nothing, nested in a dialog that does, with a
// tooltip inside the sheet. Its trigger sits in the dialog and is itself open, which a guard reading the role of every
// dialog took for a popup open inside the sheet: Escape then closed nothing once focus was back on that trigger.
import { createRoot } from 'react-dom/client'

import { copy } from '#icons/data/copy.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '#components/drawer/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="nested-drawer">
        <DialogRoot>
          <DialogTrigger render={<Button variant="outline">Settings</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
            <DialogBody>
              <DrawerRoot modal={false}>
                <DrawerTrigger render={<Button variant="outline" size="sm">Share</Button>} />
                <DrawerPopup>
                  <DrawerHeader><DrawerTitle>Share this project</DrawerTitle></DrawerHeader>
                  <DrawerBody>
                    <TooltipRoot>
                      <TooltipTrigger
                        render={<Button variant="outline" size="sm" aria-label="Copy link"><Svg icon={copy} /></Button>}
                      />
                      <TooltipPopup>Copy link</TooltipPopup>
                    </TooltipRoot>
                  </DrawerBody>
                </DrawerPopup>
              </DrawerRoot>
            </DialogBody>
            <DialogFooter><DialogClose render={<Button>Done</Button>} /></DialogFooter>
          </DialogPopup>
        </DialogRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
