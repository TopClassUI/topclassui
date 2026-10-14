// Loaded into a live page by e2e/select.spec.ts: a Select inside the repo's Dialog, and two on a page tall enough to
// scroll, one with modal left alone and one with modal={false}. Inline styles: the harness compiles only src/.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from '#components/dialog/index.js'
import { Select } from '#components/select/index.js'

const ITEMS = Array.from({ length: 12 }, (_, at) => ({ value: String(at + 1), label: `Choice ${String(at + 1)}` }))

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="in-dialog" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start', minHeight: '300vh' }}>
        <DialogRoot>
          <DialogTrigger render={<Button>Edit address</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Edit address</DialogTitle></DialogHeader>
            <DialogBody><Select aria-label="In the dialog" items={ITEMS} defaultValue="1" /></DialogBody>
          </DialogPopup>
        </DialogRoot>
        <Select aria-label="Modal" items={ITEMS} defaultValue="1" />
        <Select aria-label="Not modal" items={ITEMS} defaultValue="1" modal={false} />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
