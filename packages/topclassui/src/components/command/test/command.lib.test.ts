import { describe, expect, it } from 'vitest'

import { arrangeCommands, filterCommands, keyOfEntry, matchesShortcut, runsOf, withActiveRow } from '../lib.js'

interface Entry { id: string, label: string, group?: string }

const label = (entry: Entry) => entry.label
const key = (entry: Entry) => entry.id

const BUTTON = { id: 'button', label: 'Button' }
const GROUP = { id: 'button-group', label: 'Button group' }
const ICON = { id: 'icon-button', label: 'Icon button' }
const DIALOG = { id: 'dialog', label: 'Dialog' }
const ITEMS: Entry[] = [BUTTON, GROUP, ICON, DIALOG]

describe('filterCommands', () => {
  it('one word keeps every label that holds it anywhere, in the order given', () => {
    expect(filterCommands(ITEMS, 'but', label)).toEqual([BUTTON, GROUP, ICON])
    expect(filterCommands(ITEMS, 'ton', label)).toEqual([BUTTON, GROUP, ICON])
  })

  it('two words keep only the labels that hold both, in either order', () => {
    expect(filterCommands(ITEMS, 'button group', label)).toEqual([GROUP])
    expect(filterCommands(ITEMS, 'group  button', label)).toEqual([GROUP])
    expect(filterCommands(ITEMS, 'icon dialog', label)).toEqual([])
  })

  it('a different case matches all the same, both ways', () => {
    expect(filterCommands(ITEMS, 'BUTTON GROUP', label)).toEqual([GROUP])
    expect(filterCommands([{ id: 'x', label: 'DIALOG' }], 'dialog', label)).toEqual([{ id: 'x', label: 'DIALOG' }])
  })

  it('no match is an empty list, and an empty or blank query keeps every item, the same array', () => {
    expect(filterCommands(ITEMS, 'zebra', label)).toEqual([])
    expect(filterCommands(ITEMS, '', label)).toBe(ITEMS)
    expect(filterCommands(ITEMS, '   ', label)).toBe(ITEMS)
  })

  it('Arabic matches as written, since it has no case', () => {
    const arabic = [{ id: 'a', label: 'ملف جديد' }, { id: 'b', label: 'فتح ملف حديث' }, { id: 'c', label: 'تغيير المظهر' }]
    expect(filterCommands(arabic, 'ملف', label).map(key)).toEqual(['a', 'b'])
  })
})

describe('arrangeCommands', () => {
  it('flat: Base UI is given the items themselves, and each item is one row at its own index, its place in the whole list', () => {
    const arranged = arrangeCommands(ITEMS, key)
    expect(arranged.base).toBe(ITEMS)
    expect(arranged.entries).toEqual([
      { kind: 'item', key: 'item:button', row: 0, group: undefined, item: BUTTON, index: 0, position: 1, size: 4 },
      { kind: 'item', key: 'item:button-group', row: 1, group: undefined, item: GROUP, index: 1, position: 2, size: 4 },
      { kind: 'item', key: 'item:icon-button', row: 2, group: undefined, item: ICON, index: 2, position: 3, size: 4 },
      { kind: 'item', key: 'item:dialog', row: 3, group: undefined, item: DIALOG, index: 3, position: 4, size: 4 },
    ])
    expect(arranged.rowOfItem).toEqual([0, 1, 2, 3])
  })

  it('grouped: rows with no heading first, then each group where its first item stood, a heading row before it; an item counts its place in its group', () => {
    const save = { id: 'save', label: 'Save', group: 'Files' }
    const theme = { id: 'theme', label: 'Theme', group: 'Preferences' }
    const open = { id: 'open', label: 'Open', group: 'Files' }
    const help = { id: 'help', label: 'Help' }
    const empty = { id: 'blank', label: 'Blank', group: '' }
    const given: Entry[] = [save, theme, open, help, empty]
    const arranged = arrangeCommands(given, key, (entry) => entry.group)
    expect(arranged.base).toEqual([
      { value: undefined, items: [help, empty] },
      { value: 'Files', items: [save, open] },
      { value: 'Preferences', items: [theme] },
    ])
    const place = (entry: (typeof arranged.entries)[number]) => entry.kind === 'item' ? `${String(entry.index)} ${String(entry.position)}/${String(entry.size)}` : '-'
    expect(arranged.entries.map((entry) => `${String(entry.row)} ${entry.key} ${place(entry)}`)).toEqual([
      '0 item:help 0 1/2',
      '1 item:blank 1 2/2',
      '2 group:Files -',
      '3 item:save 2 1/2',
      '4 item:open 3 2/2',
      '5 group:Preferences -',
      '6 item:theme 4 1/1',
    ])
    // Base UI's index of an item, flattened group by group, against the row it is drawn on.
    expect(arranged.rowOfItem).toEqual([0, 1, 3, 4, 6])
  })

  it('the key of a row is what windowing tells it apart by', () => {
    expect(keyOfEntry({ kind: 'label', key: 'group:Files', row: 0, group: 'Files' })).toBe('group:Files')
  })
})

describe('runsOf', () => {
  const files = arrangeCommands(
    [{ id: 'a', label: 'A', group: 'Files' }, { id: 'b', label: 'B', group: 'Files' }, { id: 'c', label: 'C', group: 'Help' }],
    key,
    (entry) => entry.group,
  ).entries

  it('cuts the mounted rows into one run per group, each with its heading when the heading is mounted', () => {
    const runs = runsOf(files)
    expect(runs.map((run) => [run.group, run.label?.key, run.items.map((item) => item.key)])).toEqual([
      ['Files', 'group:Files', ['item:a', 'item:b']],
      ['Help', 'group:Help', ['item:c']],
    ])
  })

  it('a run whose heading scrolled out of the window has no heading, but keeps the name of its group', () => {
    const runs = runsOf(files.slice(2))
    expect(runs.map((run) => [run.group, run.label, run.items.map((item) => item.key)])).toEqual([
      ['Files', undefined, ['item:b']],
      ['Help', files[3], ['item:c']],
    ])
  })

  it('rows with no group make one run with no heading, and nothing is left out', () => {
    const runs = runsOf(arrangeCommands(ITEMS, key).entries)
    expect(runs).toHaveLength(1)
    expect(runs[0]?.group).toBeUndefined()
    expect(runs[0]?.items.map((item) => item.key)).toEqual(['item:button', 'item:button-group', 'item:icon-button', 'item:dialog'])
    expect(runsOf([])).toEqual([])
  })

  it('each run knows the row it starts at and the row after its end, and a missing row starts a new run', () => {
    const flat = arrangeCommands(ITEMS, key).entries
    const [a, b, c, d] = flat
    expect(runsOf([a, b, d].filter((entry) => entry !== undefined)).map((run) => [run.start, run.end, run.items.map((item) => item.key)])).toEqual([
      [0, 2, ['item:button', 'item:button-group']],
      [3, 4, ['item:dialog']],
    ])
    expect(runsOf([c].filter((entry) => entry !== undefined)).map((run) => [run.start, run.end])).toEqual([[2, 3]])
    expect(runsOf(files.slice(2)).map((run) => [run.start, run.end])).toEqual([[2, 3], [3, 5]])
  })
})

describe('withActiveRow', () => {
  const flat = arrangeCommands(ITEMS, key).entries
  const keys = (entries: readonly { key: string }[]) => entries.map((entry) => entry.key)

  it('adds the active row in its place when the window has scrolled away from it, above or below', () => {
    expect(keys(withActiveRow(flat.slice(2, 4), flat, 0))).toEqual(['item:button', 'item:icon-button', 'item:dialog'])
    expect(keys(withActiveRow(flat.slice(0, 2), flat, 3))).toEqual(['item:button', 'item:button-group', 'item:dialog'])
  })

  it('adds nothing when the active row is in the window, when nothing is active, or past the end', () => {
    expect(keys(withActiveRow(flat.slice(0, 2), flat, 1))).toEqual(['item:button', 'item:button-group'])
    expect(keys(withActiveRow(flat.slice(0, 2), flat, -1))).toEqual(['item:button', 'item:button-group'])
    expect(keys(withActiveRow(flat.slice(0, 2), flat, 9))).toEqual(['item:button', 'item:button-group'])
  })
})

describe('matchesShortcut', () => {
  const press = (key: string, code: string, extra: Partial<{ ctrlKey: boolean, metaKey: boolean, altKey: boolean, shiftKey: boolean }>) => ({
    key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...extra,
  })

  it('Ctrl+K and Cmd+K match k, and so does Ctrl with a capital K from Caps Lock', () => {
    expect(matchesShortcut(press('k', 'KeyK', { ctrlKey: true }), 'k')).toBe(true)
    expect(matchesShortcut(press('k', 'KeyK', { metaKey: true }), 'k')).toBe(true)
    expect(matchesShortcut(press('K', 'KeyK', { ctrlKey: true }), 'k')).toBe(true)
  })

  it('K alone, Ctrl with another key, or with Alt or Shift held, does not', () => {
    expect(matchesShortcut(press('k', 'KeyK', {}), 'k')).toBe(false)
    expect(matchesShortcut(press('j', 'KeyJ', { ctrlKey: true }), 'k')).toBe(false)
    expect(matchesShortcut(press('k', 'KeyK', { ctrlKey: true, altKey: true }), 'k')).toBe(false)
    expect(matchesShortcut(press('K', 'KeyK', { ctrlKey: true, shiftKey: true }), 'k')).toBe(false)
  })

  it('under an Arabic layout the K key types its own letter, and its place on the keyboard still matches', () => {
    expect(matchesShortcut(press('ن', 'KeyK', { ctrlKey: true }), 'k')).toBe(true)
    expect(matchesShortcut(press('ن', 'KeyJ', { ctrlKey: true }), 'k')).toBe(false)
  })

  it('a Latin layout that types another letter at the K key keeps that letter: Colemak Ctrl+E, Dvorak Ctrl+T, AZERTY Ctrl+Q', () => {
    expect(matchesShortcut(press('e', 'KeyK', { ctrlKey: true }), 'k')).toBe(false)
    expect(matchesShortcut(press('t', 'KeyK', { ctrlKey: true }), 'k')).toBe(false)
    expect(matchesShortcut(press('q', 'KeyA', { ctrlKey: true }), 'a')).toBe(false)
    expect(matchesShortcut(press('7', 'KeyK', { ctrlKey: true }), 'k')).toBe(false)
    // Dvorak's K sits at the V key: its name finds it there.
    expect(matchesShortcut(press('k', 'KeyV', { ctrlKey: true }), 'k')).toBe(true)
  })

  it('a digit and a key with no letter match by name, and an empty code never matches a key with no place', () => {
    expect(matchesShortcut(press('1', 'Digit1', { ctrlKey: true }), '1')).toBe(true)
    expect(matchesShortcut(press('/', 'Slash', { metaKey: true }), '/')).toBe(true)
    expect(matchesShortcut(press('x', '', { ctrlKey: true }), '/')).toBe(false)
  })
})
