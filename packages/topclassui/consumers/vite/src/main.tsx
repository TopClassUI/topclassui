import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from 'topclassui/dialog'
import { Icon, registerIcons } from 'topclassui/icon-registry'
import { check } from 'topclassui/icons/check'
import { TopClassProvider } from 'topclassui/provider'

import './index.css'

// Browser-only trees use the registry, never topclassui/icon, which imports server-only (R-5.1-5).
registerIcons({ check })

function App() {
  return (
    <main className="flex flex-col items-start gap-4 p-8">
      <h1 className="text-2xl font-semibold">TopClass UI</h1>
      <Badge tone="success" data-testid="badge">Beta</Badge>
      <Button tone="primary" data-testid="save">
        <Icon name="check" /> Save
      </Button>
      <DialogRoot>
        <DialogTrigger render={<Button variant="outline" data-testid="open">Publish</Button>} />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Publish changes</DialogTitle>
            <DialogDescription>Your changes go live right away.</DialogDescription>
          </DialogHeader>
          <DialogBody>11 files changed since the last publish.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose render={<Button>Publish now</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root')

createRoot(root).render(
  <StrictMode>
    <TopClassProvider direction="rtl" locale="ar">
      <App />
    </TopClassProvider>
  </StrictMode>,
)
