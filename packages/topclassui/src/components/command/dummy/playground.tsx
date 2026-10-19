'use client'

import { useState } from 'react'

import { fileText } from '#icons/data/file-text.js'
import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { cn } from '#shared/cn.js'
import { Button } from '#components/button/index.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import {
  COMMAND_ESCAPE_HINT, COMMAND_GROUP_LABEL, COMMAND_INPUT, COMMAND_ITEM, COMMAND_LIST, COMMAND_POPUP, COMMAND_SEARCH,
} from '../classes.js'
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

/** The frame's stage: the palette is always modal, so it is drawn open as a picture from its own classes, hidden from
 * a reader, with "but" typed and the first match active, as drawn. */
function Stage() {
  return (
    <div data-stage="" className="relative grid min-h-87 w-full place-items-center p-4">
      <div aria-hidden className={cn(COMMAND_POPUP, 'w-100')}>
        <div className={cn(COMMAND_SEARCH, 'after:block')}>
          <Svg icon={magnifyingGlass} />
          <span className={cn(COMMAND_INPUT, 'flex items-center')}>but</span>
          <Kbd className={COMMAND_ESCAPE_HINT}>Esc</Kbd>
        </div>
        <div className={COMMAND_LIST} style={{ '--tc-command-enter': '"Enter" / ""' }}>
          <div className={COMMAND_GROUP_LABEL}>Components</div>
          {['Button', 'Button group'].map((label, index) => (
            <div key={label} data-highlighted={index === 0 ? '' : undefined} className={COMMAND_ITEM}>
              <Svg icon={fileText} />
              <span className="min-w-0 flex-1 truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The docs stage: the basic palette, with the schema's props passed through, so the Try it
 * controls drive it. defaultOpen is where the open state starts; the Button opens it too. With stage it is the picture. */
export default function Demo({ visibleRows, virtualize, shortcut, defaultOpen, stage = false }: CommandDesignProps & { stage?: boolean } = {}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  if (stage) return <Stage />
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
