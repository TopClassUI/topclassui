import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from 'topclassui/dialog'
import { Icon } from 'topclassui/icon'

// A Server Component: the async <Icon name> renders here, and DialogRoot draws its client boundary itself.
export default function Page() {
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
