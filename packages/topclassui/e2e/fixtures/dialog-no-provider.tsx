// Loaded into a live page by e2e/dialog.spec.ts: a dialog mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page it lands on decides what its portal inherits.
import { createRoot } from 'react-dom/client'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'

function Fixture() {
  return (
    <div id="no-provider">
      <DialogRoot>
        <DialogTrigger render={<Button variant="outline">Open with no provider</Button>} />
        <DialogPopup>
          <DialogHeader><DialogTitle>No provider</DialogTitle></DialogHeader>
          <DialogBody>Nothing above this dialog names a direction or a language.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
