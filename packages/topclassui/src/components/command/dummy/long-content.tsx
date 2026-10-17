'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string, group: string }

const WORD = 'Unbreakable'.repeat(27).slice(0, 300)

/** Sixty groups of two, a heading of 300 characters with no space in it, a row of the same, and an
 * element where the empty text would be. Nothing widens the palette or the page: rows and headings
 * truncate, and the fallback wraps anywhere. */
const commands: Entry[] = [
  { id: 'word', label: WORD, group: WORD },
  ...Array.from({ length: 120 }, (_, index) => ({
    id: `row-${String(index + 1)}`,
    label: `Row ${String(index + 1)} of group ${String(Math.floor(index / 2) + 1)}`,
    group: `Group ${String(Math.floor(index / 2) + 1)}`,
  })),
]

export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Every hostile case</Button>
      <Command
        items={commands}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        getGroup={(command) => command.group}
        emptyFallback={<span>Nothing matches <strong>{WORD}</strong></span>}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
