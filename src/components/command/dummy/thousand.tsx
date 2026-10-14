'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

const AREAS = ['Billing', 'Contacts', 'Documents', 'Files', 'Invoices', 'Messages', 'Projects', 'Reports', 'Settings', 'Tasks']

/** A thousand commands under ten headings, a hundred each: past the threshold, so the list is
 * windowed, and a heading that scrolls away still names the rows of its group. */
const commands = Array.from({ length: 1000 }, (_, index) => {
  const area = AREAS[Math.floor(index / 100)] ?? ''
  return { id: `t${String(index + 1)}`, area, label: `${area} action ${String((index % 100) + 1)}` }
})

export default function Demo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState('')
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>A thousand commands</Button>
      <Command
        items={commands}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        getGroup={(command) => command.area}
        onSelect={(command) => { setRan(command.label) }}
        open={open}
        onOpenChange={setOpen}
      />
      <p data-testid="ran" className="text-sm text-muted">{ran === '' ? 'Nothing ran yet.' : `Ran ${ran}.`}</p>
    </div>
  )
}
