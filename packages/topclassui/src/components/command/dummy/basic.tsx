'use client'

import { useState } from 'react'

import { fileText } from '#icons/data/file-text.js'
import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'button', label: 'Button' },
  { id: 'button-group', label: 'Button group' },
  { id: 'icon-button', label: 'Icon button' },
  { id: 'dialog', label: 'Dialog' },
  { id: 'drawer', label: 'Drawer' },
  { id: 'popover', label: 'Popover' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'accordion', label: 'Accordion' },
  { id: 'table', label: 'Table' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'breadcrumb', label: 'Breadcrumb' },
  { id: 'tooltip', label: 'Tooltip' },
]

/** The docs sample: a Button opens it, and so does Ctrl+K or Cmd+K. What ran is written below,
 * with how many times, so a test can tell that Enter ran it once. */
export default function Demo() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState({ label: '', times: 0 })
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}><Svg icon={magnifyingGlass} />Search</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        renderItem={(command) => (
          <>
            <Svg icon={fileText} />
            <span className="min-w-0 flex-1 truncate">{command.label}</span>
          </>
        )}
        onSelect={(command) => { setRan((before) => ({ label: command.label, times: before.times + 1 })) }}
        open={open}
        onOpenChange={setOpen}
      />
      <p data-testid="ran" className="text-sm text-muted">{ran.times === 0 ? 'Nothing ran yet.' : `Ran ${ran.label}, ${String(ran.times)} in all.`}</p>
    </div>
  )
}
