'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const commands: Entry[] = Array.from({ length: 60 }, (_, index) => ({
  id: `section-${String(index + 1)}`,
  label: `Go to section ${String(index + 1)}`,
}))

const SECTIONS = Array.from({ length: 40 }, (_, index) => index + 1)

/** Sixty rows over a page far taller than the screen. The list scrolls inside the palette; the
 * page behind stays where it was, under a wheel, a finger and the keyboard alike. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Jump to a section</Button>
      <Command
        items={commands}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
      {SECTIONS.map((section) => (
        <p key={section} className="text-sm text-muted">
          Section {section}. The page goes on below the palette, so a scroll that escaped it would move this text.
        </p>
      ))}
    </div>
  )
}
