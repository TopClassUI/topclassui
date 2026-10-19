'use client'

import type { ReactNode } from 'react'

import { fileText } from '#icons/data/file-text.js'
import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { CONTAIN, OVERLAY_SURFACE, ROW } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'

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
const status = 'px-4 py-6 text-center text-sm text-muted'
const escape = 'shrink-0 border-line text-muted'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
  { id: 'theme', label: 'Switch theme' },
]

const ROWS = ['Button', 'Dialog', 'Drawer', 'Table', 'Tabs']

/** A picture of the open palette, drawn with its look written out above, and hidden from a reader.
 * The input of an open palette holds the focus, so the line under its row is drawn. */
function Panel({ query, children }: { query?: string, children: ReactNode }) {
  return (
    <div aria-hidden className={panel}>
      <div className={search}>
        <Svg icon={magnifyingGlass} />
        <span className={input}>
          <span className={cn('min-w-0 truncate', query === undefined && 'text-muted')}>{query ?? 'Type a command or search'}</span>
        </span>
        <Kbd className={escape}>Esc</Kbd>
      </div>
      {children}
    </div>
  )
}

/** The rows under their heading, the one at `active` drawn as the highlighted row. */
function Rows({ labels, active }: { labels: readonly string[], active?: number }) {
  return (
    <div className={list} style={{ '--tc-command-enter': '"Enter" / ""' }}>
      <div className={heading}><span className="truncate min-w-0">Components</span></div>
      {labels.map((label, index) => (
        <div key={label} data-command-row={index + 1} data-highlighted={index === active ? '' : undefined} className={row}>
          <Svg icon={fileText} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** Every state, one cell each, captioned by its title. The palette is modal, so one opens at a time: closed is the real
 * one behind its Ctrl K, and the open, typing, empty, loading and selected cells are pictures of its look. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div title="closed" className="flex items-center gap-1 px-6 py-3 text-sm text-muted">
        <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
      </div>
      <div title="open" className="w-100 max-w-full"><Panel><Rows labels={ROWS} /></Panel></div>
      <div title="typing" className="w-100 max-w-full"><Panel query="ta"><Rows labels={['Tabs', 'Table']} active={0} /></Panel></div>
      <div title="empty" className="w-100 max-w-full"><Panel query="zebra"><div className={status}>No results</div></Panel></div>
      <div title="loading" className="w-100 max-w-full"><Panel><div className={status}>Loading</div></Panel></div>
      <div title="selected" className="w-100 max-w-full"><Panel><Rows labels={ROWS} active={2} /></Panel></div>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
      />
    </div>
  )
}
