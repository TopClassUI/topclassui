'use client'

import { useState } from 'react'

import { fileText } from '#icons/data/file-text.js'
import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { CONTAIN, OVERLAY_SURFACE, ROW } from '#shared/classes.js'
import { Button } from '#components/button/index.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'
import type { CommandDesignProps } from '../types.js'

// The palette's look, written out from the shared classes: a demo the site shows imports public paths only.
const panel = `flex w-full max-w-100 flex-col wrap-anywhere ${OVERLAY_SURFACE}`
const search = [
  'relative flex shrink-0 items-center gap-2.5 border-b-(length:--tc-line-width) border-line ps-3.5 pe-3 text-muted',
  'after:absolute after:inset-x-0 after:-bottom-(--tc-line-width) after:block after:border-b-(length:--tc-ring-width) after:border-ring',
].join(' ')
const input = 'flex h-control-md min-w-0 flex-1 items-center px-2 text-base text-body'
const list = 'flex min-h-0 flex-col p-1.5'
const heading = 'flex h-(--tc-row-height) shrink-0 items-end px-2.5 pb-0.5 text-xs font-medium text-muted'
const row = [
  `relative h-(--tc-row-height) shrink-0 ${ROW} ${CONTAIN}`,
  'data-highlighted:bg-primary-soft data-highlighted:text-primary-on-soft',
  'before:absolute before:inset-y-1.5 before:inset-s-0 before:hidden before:border-s-(length:--tc-ring-width) before:border-ring data-highlighted:before:block',
  'after:ms-auto after:hidden after:shrink-0 after:font-mono after:text-xs after:text-muted after:content-(--tc-command-enter) data-highlighted:after:inline',
].join(' ')
const escape = 'shrink-0 border-line text-muted'

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

/** The frame's stage: the palette is always modal, so it is drawn open as a picture of its look, hidden from
 * a reader, with "but" typed and the first match active, as drawn. */
function Stage() {
  return (
    <div data-stage="" className="relative grid min-h-87 w-full place-items-center p-4">
      <div aria-hidden className={panel}>
        <div className={search}>
          <Svg icon={magnifyingGlass} />
          <span className={input}>but</span>
          <Kbd className={escape}>Esc</Kbd>
        </div>
        <div className={list} style={{ '--tc-command-enter': '"Enter" / ""' }}>
          <div className={heading}>Components</div>
          {['Button', 'Button group'].map((label, index) => (
            <div key={label} data-highlighted={index === 0 ? '' : undefined} className={row}>
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
 * controls drive it. defaultOpen is where the open state starts; the Button opens it too. With stage and
 * no prop set it is the picture; a prop from Try it brings the live palette, which the picture cannot show. */
export default function Demo({ visibleRows, virtualize, shortcut, defaultOpen, stage = false }: CommandDesignProps & { stage?: boolean } = {}) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  if (stage && [visibleRows, virtualize, shortcut, defaultOpen].every((prop) => prop === undefined)) return <Stage />
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
