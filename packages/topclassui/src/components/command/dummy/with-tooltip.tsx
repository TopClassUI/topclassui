'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
]

/** An empty text that holds an action with a tooltip. One Escape closes one thing: while the
 * tooltip is open the key closes it and the palette stays; the next one closes the palette. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Find or ask</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        emptyFallback={
          <span className="grid justify-items-center gap-2">
            No command by that name.
            <TooltipRoot>
              <TooltipTrigger render={<Button variant="outline">Ask for one</Button>} />
              <TooltipPopup>Sends the query to the team</TooltipPopup>
            </TooltipRoot>
          </span>
        }
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
