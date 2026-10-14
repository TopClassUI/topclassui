'use client'

import { useState } from 'react'

import { downloadSimple } from '#icons/data/download-simple.js'
import { fileText } from '#icons/data/file-text.js'
import { gear } from '#icons/data/gear.js'
import { Button } from '#components/button/index.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import type { IconData } from '#icons/types.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string, icon: IconData, keys: string }

const COMMANDS: Entry[] = [
  { id: 'new', label: 'New document', icon: fileText, keys: 'Ctrl N' },
  { id: 'save', label: 'Download a copy', icon: downloadSimple, keys: 'Ctrl S' },
  { id: 'settings', label: 'Settings', icon: gear, keys: 'Ctrl ,' },
]

/** Each row drawn by renderItem: an icon, the label, and the shortcut at the end. The row stays one
 * row tall, the label still truncates, and the query still matches the label alone. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}>Commands with shortcuts</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        renderItem={(command) => (
          <>
            <Svg icon={command.icon} />
            <span className="min-w-0 flex-1 truncate">{command.label}</span>
            <Kbd>{command.keys}</Kbd>
          </>
        )}
        onSelect={() => undefined}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
