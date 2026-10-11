// Loaded into a live page by e2e/drawer.spec.ts: two sheets mounted with NO TopClassProvider, which R-13-1 forbids
// and the harness therefore never does. The page they land on decides what their portal inherits.
import { createRoot } from 'react-dom/client'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '#components/drawer/index.js'

function Fixture() {
  return (
    <div id="no-provider" style={{ display: 'flex', gap: 12, padding: 24 }}>
      <DrawerRoot>
        <DrawerTrigger render={<Button variant="outline">End with no provider</Button>} />
        <DrawerPopup>
          <DrawerHeader><DrawerTitle>No provider</DrawerTitle></DrawerHeader>
          <DrawerBody>Nothing above this sheet names a direction or a language.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
