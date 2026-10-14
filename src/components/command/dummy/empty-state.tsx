'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
]

/** A query that matches nothing shows the empty text of the labels, No results, under the input.
 * The list itself is gone then, so no empty listbox is left for a reader to land in. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Find a command</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
