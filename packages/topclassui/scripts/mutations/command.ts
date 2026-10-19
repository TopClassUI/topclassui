// The mutations of src/components/command. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/command/client.tsx'
const CLASSES = 'src/components/command/classes.ts'
const HOOK = 'src/components/command/hook.ts'
const LIB = 'src/components/command/lib.ts'
const PANEL = 'src/components/command/parts/command-panel.tsx'
const ROWS = 'src/components/command/parts/command-rows.tsx'
const TYPES = 'src/components/command/types.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'command: filterCommands stops lowering the case, so BUTTON no longer finds Button',
    file: LIB,
    from: 'const label = getLabel(item).toLowerCase()',
    to: 'const label = getLabel(item)',
  },
  {
    label: 'command: client.tsx imports the panel statically, so Base UI loads with every page that shows the trigger',
    file: CLIENT,
    from: "import { useCommand } from './hook.js'",
    to: "import { useCommand } from './hook.js'\nimport './parts/command-panel.js'",
  },
  {
    label: 'command: the shortcut stops asking for Ctrl or Cmd, so typing a k anywhere opens the palette',
    file: LIB,
    from: 'if (!(press.ctrlKey || press.metaKey) || press.altKey || press.shiftKey) return false',
    to: 'if (press.altKey || press.shiftKey) return false',
  },
  {
    label: 'command: the shortcut stops matching the key by its place, so Ctrl+K does nothing under an Arabic layout',
    file: LIB,
    from: 'return code !== undefined && press.code === code',
    to: 'return false',
  },
  {
    label: 'command: status takes error again, and a failed fetch is announced as No results',
    file: TYPES,
    from: "  status?: Exclude<Status, 'error'> | undefined",
    to: '  status?: Status | undefined',
  },
  {
    label: 'command: the shortcut matches the K key by its place under Colemak too, and takes Ctrl+E from the page',
    file: LIB,
    from: "  if (/^[a-z0-9]$/.test(named)) return false\n",
    to: '',
  },
  {
    label: 'command: the shortcut no longer takes the key from the browser, which moves to its own search bar',
    file: HOOK,
    from: '      event.preventDefault()\n',
    to: '',
  },
  {
    label: 'command: the escape guard falls back to the dialog roles, and the always-open input holds every Escape',
    file: PANEL,
    from: 'guardEscape(panel.onDialogOpenChange, COMMAND_ESCAPE_GUARD)',
    to: 'guardEscape(panel.onDialogOpenChange)',
  },
  {
    label: 'command: no escape guard, so one Escape closes a tooltip inside and the palette with it',
    file: PANEL,
    from: 'onOpenChange={guardEscape(panel.onDialogOpenChange, COMMAND_ESCAPE_GUARD)}',
    to: 'onOpenChange={panel.onDialogOpenChange}',
  },
  {
    label: 'command: a row the keyboard moves to is not scrolled to, so the last of ten thousand is never mounted',
    file: HOOK,
    from: '      target.scrollIntoView({ block: \'nearest\' })\n    } else scrollToIndex(row)\n',
    to: '      target.scrollIntoView({ block: \'nearest\' })\n    }\n',
  },
  {
    label: 'command: a new query keeps the old scroll, so its first match can sit above the window',
    file: HOOK,
    from: '    if (list.current) list.current.scrollTop = 0\n',
    to: '',
  },
  {
    label: 'command: the query survives a close, so the next open starts filtered',
    file: HOOK,
    from: "onOpenChangeComplete: (next: boolean) => { if (!next) setQuery('') },",
    to: 'onOpenChangeComplete: () => undefined,',
  },
  {
    label: 'command: the panel mounts already open, so the first open pops in where every later one fades',
    file: HOOK,
    from: 'open: props.open && primed,',
    to: 'open: props.open,',
  },
  {
    label: 'command: choosing a row runs it and leaves the palette open',
    file: HOOK,
    from: '    onOpenChange(false)\n    onSelect(item)',
    to: '    onSelect(item)',
  },
  {
    label: 'command: visibleRows is no longer clamped, so 100000 rows of cap reach the list',
    file: HOOK,
    from: ': clamp(visibleRows, COMMAND_BOUNDARIES.visibleRowsMin, COMMAND_BOUNDARIES.visibleRowsMax)',
    to: ': visibleRows',
  },
  {
    label: 'command: the spacer above the window stands for nothing, so the rows jump to the top as the list scrolls',
    file: LIB,
    from: 'gap: run.start - (runs[at - 1]?.end ?? 0)',
    to: 'gap: 0',
  },
  {
    label: 'command: a scroll that is not the keyboard unmounts the active row, so Enter does nothing and aria-activedescendant dangles',
    file: HOOK,
    from: 'const mounted = collection.virtualized ? withActiveRow(windowed, arranged.entries, arranged.rowOfItem[active] ?? -1) : windowed',
    to: 'const mounted = windowed',
  },
  {
    label: 'command: only a keyboard highlight is kept mounted, so the first match of a query is lost to a finger drag',
    file: HOOK,
    from: "    setActive(details.index)\n    // A pointer highlights what it is over; a query highlights the first row, which a new query scrolls to.\n    if (details.reason !== 'keyboard') return\n",
    to: "    // A pointer highlights what it is over; a query highlights the first row, which a new query scrolls to.\n    if (details.reason !== 'keyboard') return\n    setActive(details.index)\n",
  },
  {
    label: 'command: the active row kept apart from the window joins the run beside it, and the spacer between them is lost',
    file: LIB,
    from: ' || last.end !== entry.row',
    to: '',
  },
  {
    label: 'command: the options lose aria-setsize and aria-posinset, so a reader hears 13 of 13 out of ten thousand',
    file: ROWS,
    from: '            aria-setsize={entry.size}\n            aria-posinset={entry.position}\n',
    to: '',
  },
  {
    label: 'command: the search field loses its 256 cap, so a pasted file becomes the query',
    file: PANEL,
    from: '                  maxLength={TEXT_MAX_LENGTH.search}\n',
    to: '',
  },
  {
    label: 'command: a group whose heading scrolled away is no longer named, so a reader hears an unnamed group',
    file: ROWS,
    from: 'aria-label={run.label ? undefined : run.group}',
    to: 'aria-label={undefined}',
  },
  {
    label: 'command: the viewport centres the popup, which then jumps as the results change',
    file: CLASSES,
    from: 'flex items-start justify-center p-(--tc-overlay-inset) pt-[15dvh]',
    to: 'flex items-center justify-center p-(--tc-overlay-inset)',
  },
  {
    label: 'command: the list takes back the drawn 2 px gap, and slides 2 px under the wheel for every row the window passes',
    file: CLASSES,
    from: "`flex min-h-0 flex-col p-1.5 ${LIST_CAP}",
    to: "`flex min-h-0 flex-col gap-0.5 p-1.5 ${LIST_CAP}",
  },
  {
    label: 'command: a heading is shorter than a row, so the spacers of a grouped list count the wrong height',
    file: CLASSES,
    from: 'text-xs font-medium text-muted ${COMMAND_UNIT}`',
    to: 'text-xs font-medium text-muted`',
  },
  {
    label: 'command: a row stays 40 px under a finger, below the 44 px a touch target needs',
    file: CLASSES,
    from: " pointer-coarse:h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'",
    to: "'",
  },
  {
    label: 'command: the active row drops the shared highlight, so neither a fill nor a ring tells it apart',
    file: CLASSES,
    from: '${ROW} ${ROW_HIGHLIGHT} ${DISABLED}',
    to: '${ROW} ${DISABLED}',
  },
  {
    label: 'command: the input text drops to 14 px, and iOS zooms the page into it',
    file: CLASSES,
    from: 'bg-transparent px-2 text-base text-body',
    to: 'bg-transparent px-2 text-sm text-body',
  },
  {
    label: 'command: the empty listbox stays in view when nothing matches',
    file: CLASSES,
    from: ' data-empty:hidden`',
    to: '`',
  },
  {
    label: 'command: the empty live region keeps its 48 px of padding under every list',
    file: CLASSES,
    from: 'text-muted empty:p-0',
    to: 'text-muted',
  },
  {
    label: 'command: the popup clips its children, and the ring of the input with them',
    file: CLASSES,
    from: 'max-w-100 flex-col wrap-anywhere',
    to: 'max-w-100 flex-col overflow-hidden wrap-anywhere',
  },
  {
    label: 'command: the window ignores visibleRows, so a two-row box mounts the rows of seven',
    file: HOOK,
    from: '    visibleRows: rows,\n',
    to: '',
  },
  {
    label: 'command: loadMore is asked while the palette is closed',
    file: HOOK,
    from: '(props.hasMore ?? false) && props.open',
    to: '(props.hasMore ?? false)',
  },
  {
    label: 'command: a new query never reaches onQueryChange, so the caller cannot fetch its first page',
    file: HOOK,
    from: '    onQueryChange?.(next)\n',
    to: '',
  },
  {
    label: 'command: loading-more leaves the list without aria-busy',
    file: PANEL,
    from: 'aria-busy={panel.busy || undefined}',
    to: 'aria-busy={undefined}',
  },
]
