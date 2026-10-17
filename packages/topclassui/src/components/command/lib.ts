// Pure helpers: the filter, the order of the rows and the shortcut, with no React in them.
import type { CommandEntry, CommandGroup, CommandKeyPress, CommandRun } from './types.js'

/** The items whose label holds every word of the query, in any case and anywhere, in their own order. */
export function filterCommands<T>(items: readonly T[], query: string, getLabel: (item: T) => string): readonly T[] {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word !== '')
  if (words.length === 0) return items
  return items.filter((item) => {
    const label = getLabel(item).toLowerCase()
    return words.every((word) => label.includes(word))
  })
}

/** What Base UI is given, the rows windowing counts, and the row of each item. Grouped, the
 * rows with no heading come first, then each group where its first item stood. Each item knows
 * its place in its set and the set's size, which a reader cannot count from the rows mounted. */
export function arrangeCommands<T>(
  items: readonly T[],
  getKey: (item: T) => string,
  getGroup?: (item: T) => string | undefined,
): { base: readonly T[] | readonly CommandGroup[], entries: CommandEntry[], rowOfItem: number[] } {
  const entries: CommandEntry[] = []
  const rowOfItem: number[] = []
  const add = (item: T, group: string | undefined, position: number, size: number) => {
    rowOfItem.push(entries.length)
    entries.push({
      kind: 'item', key: `item:${getKey(item)}`, row: entries.length, group, item, index: rowOfItem.length - 1, position, size,
    })
  }
  if (!getGroup) {
    items.forEach((item, at) => { add(item, undefined, at + 1, items.length) })
    return { base: items, entries, rowOfItem }
  }
  const byGroup = new Map<string | undefined, T[]>([[undefined, []]])
  for (const item of items) {
    const group = getGroup(item) || undefined
    const list = byGroup.get(group)
    if (list) list.push(item)
    else byGroup.set(group, [item])
  }
  const base: CommandGroup[] = []
  for (const [group, list] of byGroup) {
    if (list.length === 0) continue
    base.push({ value: group, items: list })
    if (group !== undefined) entries.push({ kind: 'label', key: `group:${group}`, row: entries.length, group })
    list.forEach((item, at) => { add(item, group, at + 1, list.length) })
  }
  return { base, entries, rowOfItem }
}

/** The key windowing tells two rows apart by. */
export function keyOfEntry(entry: CommandEntry): string {
  return entry.key
}

/** The mounted rows, in order, cut into runs of one group with no row missing between them, so each
 * run sits in a group element of its own and a spacer stands for the rows between two runs. */
export function runsOf(entries: readonly CommandEntry[]): CommandRun[] {
  const runs: CommandRun[] = []
  for (const entry of entries) {
    const last = runs.at(-1)
    if (last === undefined || last.group !== entry.group || entry.kind === 'label' || last.end !== entry.row) {
      runs.push({ group: entry.group, label: entry.kind === 'label' ? entry : undefined, items: [], start: entry.row, end: entry.row })
    }
    const run = runs.at(-1)
    if (run === undefined) continue
    run.end = entry.row + 1
    if (entry.kind === 'item') run.items.push(entry)
  }
  return runs
}

/** The rows windowing mounts, and the active row as well wherever it is: a finger or the scrollbar
 * moves the window, never the highlight, and Enter and aria-activedescendant need its element. */
export function withActiveRow(rows: readonly CommandEntry[], entries: readonly CommandEntry[], activeRow: number): CommandEntry[] {
  const entry = entries[activeRow]
  if (entry === undefined || rows.includes(entry)) return [...rows]
  const at = rows.findIndex((row) => row.row > activeRow)
  return at === -1 ? [...rows, entry] : [...rows.slice(0, at), entry, ...rows.slice(at)]
}

/** The key's place on a keyboard, so Ctrl+K still opens it under an Arabic layout, where K types a letter of its own. */
function codeOf(key: string): string | undefined {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`
  if (/^[0-9]$/.test(key)) return `Digit${key}`
  return undefined
}

/** Ctrl or Cmd with the shortcut, and neither Alt nor Shift, which the browser and the system keep.
 * The key's place counts only when it types no Latin letter or digit: Colemak's Ctrl+E stays Ctrl+E. */
export function matchesShortcut(press: CommandKeyPress, shortcut: string): boolean {
  if (!(press.ctrlKey || press.metaKey) || press.altKey || press.shiftKey) return false
  const key = shortcut.toLowerCase()
  const named = press.key.toLowerCase()
  if (named === key) return true
  if (/^[a-z0-9]$/.test(named)) return false
  const code = codeOf(key)
  return code !== undefined && press.code === code
}
