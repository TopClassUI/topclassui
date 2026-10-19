'use client'

import type { ReactNode } from 'react'

import { fileText } from '#icons/data/file-text.js'
import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { cn } from '#shared/cn.js'
import { Kbd } from '#components/kbd/index.js'
import { Svg } from '#components/svg/index.js'
import {
  COMMAND_ESCAPE_HINT, COMMAND_GROUP_LABEL, COMMAND_INPUT, COMMAND_ITEM, COMMAND_LIST, COMMAND_POPUP, COMMAND_SEARCH, COMMAND_STATUS,
} from '../classes.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
  { id: 'theme', label: 'Switch theme' },
]

const ROWS = ['Button', 'Dialog', 'Drawer', 'Table', 'Tabs']

/** A picture of the open palette, built from its own classes so it cannot drift from it, and hidden from a reader.
 * The input of an open palette holds the focus, so the line under its row is drawn. */
function Panel({ query, children }: { query?: string, children: ReactNode }) {
  return (
    <div aria-hidden className={COMMAND_POPUP}>
      <div className={cn(COMMAND_SEARCH, 'after:block')}>
        <Svg icon={magnifyingGlass} />
        <span className={cn(COMMAND_INPUT, 'flex items-center')}>
          <span className={cn('min-w-0 truncate', query === undefined && 'text-muted')}>{query ?? 'Type a command or search'}</span>
        </span>
        <Kbd className={COMMAND_ESCAPE_HINT}>Esc</Kbd>
      </div>
      {children}
    </div>
  )
}

/** The rows under their heading, the one at `active` drawn as the highlighted row. */
function Rows({ labels, active }: { labels: readonly string[], active?: number }) {
  return (
    <div className={COMMAND_LIST} style={{ '--tc-command-enter': '"Enter" / ""' }}>
      <div className={COMMAND_GROUP_LABEL}><span className="truncate min-w-0">Components</span></div>
      {labels.map((label, index) => (
        <div key={label} data-command-row={index + 1} data-highlighted={index === active ? '' : undefined} className={COMMAND_ITEM}>
          <Svg icon={fileText} />
          <span className="min-w-0 flex-1 truncate">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** Every state, one cell each, captioned by its title. The palette is modal, so one opens at a time: closed is the real
 * one behind its Ctrl K, and the open, typing, empty, loading and selected cells are pictures drawn from its classes. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div title="closed" className="flex items-center gap-1 px-6 py-3 text-sm text-muted">
        <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
      </div>
      <div title="open" className="w-100 max-w-full"><Panel><Rows labels={ROWS} /></Panel></div>
      <div title="typing" className="w-100 max-w-full"><Panel query="ta"><Rows labels={['Tabs', 'Table']} active={0} /></Panel></div>
      <div title="empty" className="w-100 max-w-full"><Panel query="zebra"><div className={COMMAND_STATUS}>No results</div></Panel></div>
      <div title="loading" className="w-100 max-w-full"><Panel><div className={COMMAND_STATUS}>Loading</div></Panel></div>
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
