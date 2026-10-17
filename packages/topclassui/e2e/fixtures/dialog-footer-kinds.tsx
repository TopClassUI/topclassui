// Loaded into a live page by e2e/dialog.spec.ts: what a real footer holds besides its Buttons. Each sized
// component stands once on the page and once in the footer, so the two boxes of one can be compared.
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Badge } from '#components/badge/index.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import { Progress } from '#components/progress/index.js'
import { Spinner } from '#components/spinner/index.js'
import { Tag } from '#components/tag/index.js'

function Kinds(): ReactNode {
  return (
    <>
      <Badge data-kind="badge">Draft</Badge>
      <Tag data-kind="tag">Design</Tag>
      <Spinner data-kind="spinner" aria-label="Saving" />
      <Progress data-kind="progress" value={40} aria-label="Uploaded" />
      <Button data-kind="button" variant="outline">Cancel</Button>
    </>
  )
}

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="footer-kinds">
        <Kinds />
        <DialogRoot>
          <DialogTrigger render={<Button>Footer</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Upload</DialogTitle></DialogHeader>
            <DialogBody>Three files are on their way.</DialogBody>
            <DialogFooter>
              <Kinds />
              <DialogClose render={<Button>Done</Button>} />
            </DialogFooter>
          </DialogPopup>
        </DialogRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
