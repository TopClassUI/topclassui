// Loaded into a live page by e2e/drawer.spec.ts: a sheet whose placement the page changes while it is open, as an app
// does across a breakpoint (a side sheet on a desktop, a bottom sheet on a phone). A 'placement' event sets it.
import { useEffect, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '#components/drawer/index.js'
import type { DrawerRootProps } from '#components/drawer/index.js'

type Placement = NonNullable<DrawerRootProps['placement']>

function Fixture(): ReactNode {
  const [placement, setPlacement] = useState<Placement>('bottom')
  useEffect(() => {
    const change = (event: Event) => { setPlacement((event as CustomEvent<Placement>).detail) }
    window.addEventListener('placement', change)
    return () => { window.removeEventListener('placement', change) }
  }, [])
  return (
    <TopClassProvider direction={document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'} locale="en">
      <div id="placement-drawer">
        <DrawerRoot placement={placement}>
          <DrawerTrigger render={<Button variant="outline">Note</Button>} />
          <DrawerPopup>
            <DrawerHeader><DrawerTitle>Note</DrawerTitle></DrawerHeader>
            <DrawerBody><input id="note" aria-label="Note" style={{ blockSize: 48 }} /></DrawerBody>
          </DrawerPopup>
        </DrawerRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
