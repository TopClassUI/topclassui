'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
  { id: 'theme', label: 'Switch theme' },
]

const NONE: Entry[] = []

type State = 'open' | 'empty' | 'loading'

/** One button per state, named after it: the palette loads on its first open, so a server page
 * shows each closed. Open with its list, empty with no results, loading. Only the first takes Ctrl+K. */
export default function Demo() {
  const [open, setOpen] = useState<State | null>(null)
  const change = (state: State) => (next: boolean) => { setOpen(next ? state : null) }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => { setOpen('open') }}>Open</Button>
      <Button variant="outline" onClick={() => { setOpen('empty') }}>Empty</Button>
      <Button variant="outline" onClick={() => { setOpen('loading') }}>Loading</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        open={open === 'open'}
        onOpenChange={change('open')}
      />
      <Command
        items={NONE}
        status="empty"
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        shortcut={null}
        open={open === 'empty'}
        onOpenChange={change('empty')}
      />
      <Command
        items={NONE}
        status="loading"
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        shortcut={null}
        open={open === 'loading'}
        onOpenChange={change('loading')}
      />
    </div>
  )
}
