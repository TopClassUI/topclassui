'use client'

import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { spinner } from '#icons/data/spinner.js'
import { CONTAIN, OVERLAY_SURFACE, ROW } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { Command } from '../index.js'

// The palette's look, written out from the shared classes: a demo the site shows imports public paths only.
const panel = `flex w-34 flex-col wrap-anywhere ${OVERLAY_SURFACE}`
const search = [
  'relative flex shrink-0 items-center gap-1.5 border-b-(length:--tc-line-width) border-line px-2.5 py-1 font-mono text-xs/tight text-muted',
  'after:absolute after:inset-x-0 after:-bottom-(--tc-line-width) after:block after:border-b-(length:--tc-ring-width) after:border-ring',
].join(' ')
const list = 'flex min-h-0 flex-col p-1.25'
const row = [
  `relative h-(--tc-row-height) shrink-0 ${ROW} ${CONTAIN}`,
  'data-highlighted:bg-primary-soft data-highlighted:text-primary-on-soft',
  'before:absolute before:inset-y-1.5 before:inset-s-0 before:hidden before:border-s-(length:--tc-ring-width) before:border-ring data-highlighted:before:block',
].join(' ')
const status = 'flex flex-col items-center gap-1.5 font-mono text-xs text-muted'

interface Entry { id: string, label: string }

const COMMANDS: Entry[] = [
  { id: 'invite', label: 'Invite a teammate' },
  { id: 'billing', label: 'Open billing' },
  { id: 'theme', label: 'Switch theme' },
]

/** A small picture of the open palette, as the frame draws it: the search row over one row, the row drawn highlighted
 * when `active`. Drawn with the palette's look written out above, and hidden from a reader. */
function Panel({ query, active = false }: { query: string, active?: boolean }) {
  return (
    <div aria-hidden className={panel}>
      <div className={search}>
        <Svg icon={magnifyingGlass} size="0.75rem" />
        <span className="min-w-0 truncate">{query}</span>
      </div>
      <div className={list}>
        <div data-command-row={1} data-highlighted={active ? '' : undefined} className={row}>
          <span className="min-w-0 flex-1 truncate">Button</span>
        </div>
      </div>
    </div>
  )
}

// A row of the frame's 58 px: the 68 px panels reach past it above and below, as drawn.
const CELL = 'flex h-14.5 items-center justify-center'

/** Every state, one equal cell each, captioned by its title. The palette is modal, so one opens at a time: closed is the
 * real one behind its Ctrl K, and the open, typing, empty, loading and selected cells are small pictures of its look. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">
      <div title="closed" className={cn(CELL, 'gap-1 font-mono text-xs text-muted')}>
        Ctrl K
      </div>
      <div title="open" className={CELL}><Panel query="search" /></div>
      <div title="typing" className={CELL}><Panel query="but" active /></div>
      <div title="empty" className={CELL}>
        <div aria-hidden className={status}><Svg icon={magnifyingGlass} size="1.125rem" />no results</div>
      </div>
      <div title="loading" className={CELL}>
        <div aria-hidden className={status}><Svg icon={spinner} size="1.25rem" className="animate-spin motion-reduce:animate-none" /></div>
      </div>
      <div title="selected" className={CELL}><Panel query="search" active /></div>
      <Command
        items={COMMANDS}
        getKey={(command) => command.id}
        getLabel={(command) => command.label}
        onSelect={() => undefined}
      />
    </div>
  )
}
