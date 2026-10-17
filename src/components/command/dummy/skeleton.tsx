'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { Command, CommandSkeleton } from '../index.js'

interface Entry { id: string, label: string }

const NONE: Entry[] = []

/** While the commands load, the palette holds their rows with a skeleton in place of the Loading text.
 * The same skeleton is shown below it, on the surface the palette draws. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Commands that load with a skeleton</Button>
      <Command
        items={NONE}
        status="loading"
        loadingFallback={<CommandSkeleton rows={5} className="-mx-4 -my-6" />}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
      <div className="w-full max-w-105 rounded-box bg-surface-raised">
        <CommandSkeleton rows={3} />
      </div>
    </div>
  )
}
