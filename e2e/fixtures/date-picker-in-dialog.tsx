// Loaded into a live page by e2e/date-picker.spec.ts: a DatePicker inside the repo's Dialog, for the one Escape that
// closes one layer, and a page tall enough to scroll behind it. Inline styles: the harness compiles only src/.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DatePicker } from '#components/date-picker/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from '#components/dialog/index.js'

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="in-dialog" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start', minHeight: '300vh' }}>
        <DialogRoot>
          <DialogTrigger render={<Button>Edit booking</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Edit booking</DialogTitle></DialogHeader>
            <DialogBody>
              <DatePicker aria-label="In the dialog" defaultValue="2026-09-22" />
              <DatePicker aria-label="Two months in the dialog" defaultValue="2026-09-22" minDate="2026-09-01" maxDate="2026-10-31" />
            </DialogBody>
          </DialogPopup>
        </DialogRoot>
        <DatePicker aria-label="On the page" defaultValue="2026-09-22" />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
