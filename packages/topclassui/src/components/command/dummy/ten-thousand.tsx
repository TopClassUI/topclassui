'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

const VERBS = ['Open', 'Close', 'Rename', 'Archive', 'Share', 'Export', 'Duplicate', 'Pin']
const NOUNS = ['report', 'invoice', 'project', 'contract', 'draft', 'ticket', 'board', 'note', 'folder', 'page']

/** Ten thousand commands in one flat list. Windowing mounts only the rows in view, so typing and
 * scrolling stay quick; the last one is "Pin page 10000". */
const commands = Array.from({ length: 10_000 }, (_, index) => ({
  id: `c${String(index + 1)}`,
  label: `${VERBS[index % VERBS.length] ?? ''} ${NOUNS[Math.floor(index / VERBS.length) % NOUNS.length] ?? ''} ${String(index + 1)}`,
}))

export default function Demo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState('')
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Ten thousand commands</Button>
      <Command
        items={commands}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={(command) => { setRan(command.label) }}
        open={open}
        onOpenChange={setOpen}
      />
      <p data-testid="ran" className="text-sm text-muted">{ran === '' ? 'Nothing ran yet.' : `Ran ${ran}.`}</p>
    </div>
  )
}
