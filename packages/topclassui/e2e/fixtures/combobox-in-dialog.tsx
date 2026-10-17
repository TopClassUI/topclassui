// Loaded into a live page by e2e/combobox.spec.ts: a combobox inside the repo's Dialog (unit-4.md, "Fixtures"). The
// list must paint above the dialog, and each Escape must do one thing.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Combobox } from '#components/combobox/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from '#components/dialog/index.js'

const ITEMS = Array.from({ length: 30 }, (_, at) => ({ value: String(at + 1), label: `Framework ${String(at + 1)}` }))

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="in-dialog" style={{ padding: 16 }}>
        <DialogRoot>
          <DialogTrigger render={<Button>Edit project</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Edit project</DialogTitle></DialogHeader>
            <DialogBody>
              <form id="project">
                <Combobox aria-label="Framework" name="framework" items={ITEMS} defaultValue="2" />
              </form>
            </DialogBody>
          </DialogPopup>
        </DialogRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
