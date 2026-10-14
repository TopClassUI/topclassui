'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const NONE: Entry[] = []

/** The commands are still on their way: status loading, with no items, says Loading where the
 * empty text would be, and the same live region announces it. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Commands that are loading</Button>
      <Command
        items={NONE}
        status="loading"
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
