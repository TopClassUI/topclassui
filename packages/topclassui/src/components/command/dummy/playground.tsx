'use client'

import { useState } from 'react'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'
import type { CommandDesignProps } from '../types.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'button', label: 'Button' },
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

/** The docs stage: the basic palette, with the schema's props passed through, so the Try it
 * controls drive it. defaultOpen is where the open state starts; the Button opens it too. */
export default function Demo({ visibleRows, virtualize, shortcut, defaultOpen }: CommandDesignProps = {}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <div className="grid justify-items-start gap-3">
      <Button variant="outline" onClick={() => { setOpen(true) }}><Svg icon={magnifyingGlass} />Search</Button>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
        visibleRows={visibleRows}
        virtualize={virtualize}
        shortcut={shortcut}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
