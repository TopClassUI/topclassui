'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string, group: string }

const COMMANDS: Entry[] = [
  { id: 'new-file', label: 'New file', group: 'Files' },
  { id: 'open-recent', label: 'Open recent', group: 'Files' },
  { id: 'theme', label: 'Change the theme', group: 'Preferences' },
  { id: 'save', label: 'Save all', group: 'Files' },
  { id: 'shortcuts', label: 'Keyboard shortcuts', group: 'Preferences' },
  { id: 'docs', label: 'Read the docs', group: 'Help' },
  { id: 'report', label: 'Report a problem', group: 'Help' },
]

/** Three headings. A group stands where its first command stood, and keeps its commands in order,
 * so Save all joins New file and Open recent under Files. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState('')
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Commands by group</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        getGroup={(command) => command.group}
        onSelect={(command) => { setRan(command.label) }}
        open={open}
        onOpenChange={setOpen}
      />
      <p data-testid="ran" className="text-sm text-muted">{ran === '' ? 'Nothing ran yet.' : `Ran ${ran}.`}</p>
    </div>
  )
}
