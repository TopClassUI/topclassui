import { describe, expect, it } from 'vitest'

import { findParent, findRow, flattenTree, keyAction, keyOfRow, toggled, typeahead } from '../lib.js'
import type { TreeNode } from '../types.js'

/** Three levels: a/ holds b/ (holding c and d) and e; f/ is closed and holds g; h is a leaf at the root. */
const TREE: TreeNode[] = [
  {
    id: 'a', label: 'Apps', children: [
      { id: 'b', label: 'Banana', children: [{ id: 'c', label: 'Cherry' }, { id: 'd', label: 'Date', disabled: true }] },
      { id: 'e', label: 'Elder' },
    ],
  },
  { id: 'f', label: 'Fig', children: [{ id: 'g', label: 'Grape' }] },
  { id: 'h', label: 'apricot' },
]
const OPEN = ['a', 'b']
const ROWS = flattenTree(TREE, OPEN)
const shape = (rows: typeof ROWS) => rows.map((r) => `${r.node.id} ${String(r.level)} ${String(r.posInSet)}/${String(r.setSize)} ${r.parentId ?? '-'} ${r.branch ? (r.open ? 'open' : 'closed') : 'leaf'}`)

describe('flattenTree', () => {
  it('lists the visible rows in order, with their level, position, set size, parent and state', () => {
    expect(shape(ROWS)).toEqual([
      'a 1 1/3 - open',
      'b 2 1/2 a open',
      'c 3 1/2 b leaf',
      'd 3 2/2 b leaf',
      'e 2 2/2 a leaf',
      'f 1 2/3 - closed',
      'h 1 3/3 - leaf',
    ])
  })

  it('a closed branch hides its children; an id that is open but whose parent is closed stays hidden', () => {
    expect(flattenTree(TREE, ['b']).map(keyOfRow)).toEqual(['a', 'f', 'h'])
    expect(flattenTree(TREE, []).map(keyOfRow)).toEqual(['a', 'f', 'h'])
  })

  it('an empty children array is a branch, open or not, with no rows under it', () => {
    const rows = flattenTree([{ id: 'x', label: 'X', children: [] }], ['x'])
    expect(shape(rows)).toEqual(['x 1 1/1 - open'])
  })

  it('handles a tree deeper than any stack would by recursion', () => {
    let node: TreeNode = { id: 'leaf', label: 'leaf' }
    const ids: string[] = []
    for (let depth = 0; depth < 20_000; depth++) {
      node = { id: `n${String(depth)}`, label: 'n', children: [node] }
      ids.push(node.id)
    }
    const rows = flattenTree([node], ids)
    expect(rows).toHaveLength(20_001)
    expect(rows.at(-1)?.level).toBe(20_001)
  })
})

describe('findParent and findRow', () => {
  it('the parent is the nearest row above one level up; a root row has none', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((index) => findParent(ROWS, index))).toEqual([-1, 0, 1, 1, 0, -1, -1])
  })

  it('a row is found by its id, and a hidden or unknown id is -1', () => {
    expect([findRow(ROWS, 'e'), findRow(ROWS, 'g'), findRow(ROWS, null), findRow(ROWS, 'zz')]).toEqual([4, -1, -1, -1])
  })
})

/** What a key does at a row, as a short word, in a direction. */
const act = (index: number, key: string, direction: 'ltr' | 'rtl' = 'ltr') => {
  const action = keyAction(ROWS, index, key, direction)
  if (action === null) return 'nothing'
  return action.type === 'move' ? `move ${String(action.to)}` : action.type === 'select'
    ? `select ${String(action.index)}${action.toggle ? ' toggle' : ''}`
    : `${action.type} ${String(action.index)}`
}

describe('the key moves (Authoring Practices tree view)', () => {
  it('ArrowDown and ArrowUp move one visible row, with no wrap', () => {
    expect([act(0, 'ArrowDown'), act(6, 'ArrowDown'), act(3, 'ArrowUp'), act(0, 'ArrowUp')]).toEqual(['move 1', 'move 6', 'move 2', 'move 0'])
  })

  it('Home and End go to the first and the last visible row', () => {
    expect([act(4, 'Home'), act(1, 'End')]).toEqual(['move 0', 'move 6'])
  })

  for (const [direction, inward, outward] of [['ltr', 'ArrowRight', 'ArrowLeft'], ['rtl', 'ArrowLeft', 'ArrowRight']] as const) {
    it(`${direction}: ${inward} opens a closed branch, moves into an open one, and does nothing on a leaf`, () => {
      expect([act(5, inward, direction), act(0, inward, direction), act(1, inward, direction), act(2, inward, direction)])
        .toEqual(['open 5', 'move 1', 'move 2', 'nothing'])
    })

    it(`${direction}: ${outward} closes an open branch, else moves to the parent, and does nothing on a closed root`, () => {
      expect([act(1, outward, direction), act(2, outward, direction), act(4, outward, direction), act(5, outward, direction), act(6, outward, direction)])
        .toEqual(['close 1', 'move 1', 'move 0', 'nothing', 'nothing'])
    })
  }

  it('Enter selects and toggles a branch, selects a leaf; Space only selects', () => {
    expect([act(1, 'Enter'), act(2, 'Enter'), act(1, ' '), act(2, ' ')]).toEqual(['select 1 toggle', 'select 2', 'select 1', 'select 2'])
  })

  it('a disabled row takes the highlight and nothing else', () => {
    expect([act(3, 'Enter'), act(3, ' '), act(3, 'ArrowDown'), act(3, 'ArrowLeft')]).toEqual(['nothing', 'nothing', 'move 4', 'move 1'])
    const shut = flattenTree([{ id: 'x', label: 'X', disabled: true, children: [{ id: 'y', label: 'Y' }] }], [])
    expect(keyAction(shut, 0, 'ArrowRight', 'ltr')).toBeNull()
    const opened = flattenTree([{ id: 'x', label: 'X', disabled: true, children: [{ id: 'y', label: 'Y' }] }], ['x'])
    expect(keyAction(opened, 0, 'ArrowLeft', 'ltr')).toBeNull()
    expect(keyAction(opened, 0, 'ArrowRight', 'ltr')).toEqual({ type: 'move', to: 1 })
  })

  it('with no row highlighted any key starts at the first row, End at the last; an unknown key does nothing', () => {
    expect([act(-1, 'ArrowUp'), act(-1, 'Enter'), act(-1, 'End'), act(-1, 'Tab'), act(2, 'PageDown')]).toEqual(['move 0', 'move 0', 'move 6', 'nothing', 'nothing'])
    expect(keyAction([], 0, 'ArrowDown', 'ltr')).toBeNull()
  })
})

describe('typeahead', () => {
  it('one letter looks past the current row, ignores case and wraps', () => {
    expect([typeahead(ROWS, 0, 'a'), typeahead(ROWS, 6, 'a'), typeahead(ROWS, 6, 'C'), typeahead(ROWS, -1, 'a')]).toEqual([6, 0, 2, 0])
  })

  it('more letters keep the current row while it still matches, and -1 when nothing does', () => {
    expect([typeahead(ROWS, 6, 'ap'), typeahead(ROWS, 6, 'app'), typeahead(ROWS, 0, 'zz'), typeahead(ROWS, 0, '')]).toEqual([6, 0, -1, -1])
  })
})

describe('toggled', () => {
  it('adds or removes one id, and hands back the same array when nothing changes', () => {
    const ids = ['a']
    expect(toggled(ids, 'b', true)).toEqual(['a', 'b'])
    expect(toggled(['a', 'b'], 'a', false)).toEqual(['b'])
    expect(toggled(ids, 'a', true)).toBe(ids)
    expect(toggled(ids, 'z', false)).toBe(ids)
  })
})
