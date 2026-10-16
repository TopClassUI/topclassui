'use client'

import { useActionState, useState } from 'react'

import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

interface Attempt { name: string, error: string | null }

/** The one field of the form, as text: a file field would hand over a File. */
function nameIn(data: FormData): string {
  const name = data.get('name')
  return typeof name === 'string' ? name : ''
}

/** Stands in for a Server Action: it answers with an error message, or with none. */
async function renameProject(data: FormData): Promise<string | null> {
  await new Promise((resolve) => { setTimeout(resolve, 100) })
  return nameIn(data).trim().toLowerCase() === 'untitled' ? 'That name is taken.' : null
}

/** The form holds its own attempt, so it starts clean each time the dialog opens. React
 * empties a form after every action: the name comes back through the state, with the error. */
function RenameForm({ onSaved }: { onSaved: () => void }) {
  const [attempt, save, saving] = useActionState(async (_previous: Attempt, data: FormData): Promise<Attempt> => {
    const error = await renameProject(data)
    if (error === null) onSaved()
    return { name: nameIn(data), error }
  }, { name: 'Website redesign', error: null })

  return (
    <form action={save} className="contents">
      <DialogHeader>
        <DialogTitle>Rename this project</DialogTitle>
      </DialogHeader>
      <DialogBody className="grid gap-1">
        <label htmlFor="demo-rename" className="font-medium text-body">Name</label>
        <Input
          id="demo-rename"
          name="name"
          defaultValue={attempt.name}
          invalid={attempt.error !== null}
          aria-describedby={attempt.error === null ? undefined : 'demo-rename-error'}
          required
          fullWidth
          autoFocus
        />
        {attempt.error === null ? null : <p id="demo-rename-error" className="text-danger-on-soft">{attempt.error}</p>}
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="submit" loading={saving}>Save</Button>
      </DialogFooter>
    </form>
  )
}

/** Closes when the action succeeds and stays open when it fails. `open` and `onOpenChange`
 * need a client file: a Server Component page cannot pass a function. Try the name Untitled. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <DialogRoot open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Rename and close</Button>} />
      <DialogPopup>
        <RenameForm onSaved={() => { setOpen(false) }} />
      </DialogPopup>
    </DialogRoot>
  )
}
