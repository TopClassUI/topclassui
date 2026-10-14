// Loaded into a live page by e2e/dialog.spec.ts: a dialog that blocks nothing, nested in one that does. Its
// trigger sits in the outer popup and is itself open, which a guard reading the role of every dialog took for a
// popup open inside the inner one: Escape then closed nothing once focus was back on that trigger.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="nested-dialog">
        <DialogRoot>
          <DialogTrigger render={<Button variant="outline">Settings</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
            <DialogBody>
              <DialogRoot modal={false}>
                <DialogTrigger render={<Button variant="outline" size="sm">Rename</Button>} />
                <DialogPopup size="sm">
                  <DialogHeader><DialogTitle>Rename this project</DialogTitle></DialogHeader>
                  <DialogBody>The name shows in every link.</DialogBody>
                </DialogPopup>
              </DialogRoot>
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
