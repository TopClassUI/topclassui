// R-5.12-1: the pure helpers of the hook, with no React in them.
import type { TreeKeyAction, TreeNode, TreeNoteKind, TreeRow, TreeViewStatus } from './types.js'

/** The built-in look only when the caller passed no fallback of their own for that status. */
export function noteKindOf(status: TreeViewStatus, loadingFallback: unknown, emptyFallback: unknown): TreeNoteKind {
  if (status === 'loading') return loadingFallback === undefined ? 'loading' : 'own'
  if (status === 'empty') return emptyFallback === undefined ? 'empty' : 'own'
  return status
}

/** The visible rows in order: a node, then its children when it is an open branch. Iterative, so depth costs no stack. */
export function flattenTree(items: readonly TreeNode[], expanded: readonly string[]): TreeRow[] {
  const open = new Set(expanded)
  const out: TreeRow[] = []
  const stack: { nodes: readonly TreeNode[], at: number, level: number, parentId: string | null }[] = [
    { nodes: items, at: 0, level: 1, parentId: null },
  ]
  while (stack.length > 0) {
    const frame = stack[stack.length - 1]
    if (frame === undefined) break
    const node = frame.nodes[frame.at]
    if (node === undefined) {
      stack.pop()
      continue
    }
    frame.at += 1
    const branch = node.children !== undefined
    const isOpen = branch && open.has(node.id)
    out.push({
      node, level: frame.level, setSize: frame.nodes.length, posInSet: frame.at, parentId: frame.parentId, branch, open: isOpen,
    })
    if (isOpen && node.children) stack.push({ nodes: node.children, at: 0, level: frame.level + 1, parentId: node.id })
  }
  return out
}

/** The key windowing tells two rows apart by. Module scope, so useCollection's memo holds. */
export function keyOfRow(row: TreeRow): string {
  return row.node.id
}

/** The index of a row's parent: the nearest row above it one level up, or -1 for a root row. */
export function findParent(rows: readonly TreeRow[], index: number): number {
  const level = rows[index]?.level ?? 1
  for (let at = index - 1; at >= 0; at--) {
    if ((rows[at]?.level ?? 0) < level) return at
  }
  return -1
}

/** The index of the row holding a node, or -1 when it is not visible (inside a closed branch, or gone). */
export function findRow(rows: readonly TreeRow[], id: string | null): number {
  return id === null ? -1 : rows.findIndex((row) => row.node.id === id)
}

/** What a key does on the row at `index`, by the Authoring Practices tree; ArrowLeft and ArrowRight swap in RTL. */
export function keyAction(rows: readonly TreeRow[], index: number, key: string, direction: 'ltr' | 'rtl'): TreeKeyAction | null {
  const last = rows.length - 1
  if (last < 0) return null
  const [inward, outward] = direction === 'rtl' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft']
  const known = ['ArrowDown', 'ArrowUp', inward, outward, 'Home', 'End', 'Enter', ' ']
  if (!known.includes(key)) return null
  const row = rows[index]
  // No row holds the highlight yet: any key starts at the first row, End at the last.
  if (row === undefined) return { type: 'move', to: key === 'End' ? last : 0 }
  const usable = row.node.disabled !== true

  if (key === 'ArrowDown') return { type: 'move', to: Math.min(index + 1, last) }
  if (key === 'ArrowUp') return { type: 'move', to: Math.max(index - 1, 0) }
  if (key === 'Home') return { type: 'move', to: 0 }
  if (key === 'End') return { type: 'move', to: last }
  if (key === 'Enter') return usable ? { type: 'select', index, toggle: row.branch } : null
  if (key === ' ') return usable ? { type: 'select', index, toggle: false } : null
  if (key === inward) {
    if (!row.branch) return null
    if (!row.open) return usable ? { type: 'open', index } : null
    const child = rows[index + 1]
    return child !== undefined && child.level > row.level ? { type: 'move', to: index + 1 } : null
  }
  if (row.open && usable) return { type: 'close', index }
  const parent = findParent(rows, index)
  return parent >= 0 ? { type: 'move', to: parent } : null
}

/** The next row whose label starts with the query, wrapping. One letter looks past the current row; more letters
 * keep it while it still matches. -1 when none does. */
export function typeahead(rows: readonly TreeRow[], from: number, query: string): number {
  const wanted = query.toLocaleLowerCase()
  if (wanted === '' || rows.length === 0) return -1
  const start = query.length === 1 ? from + 1 : Math.max(from, 0)
  for (let step = 0; step < rows.length; step++) {
    const at = (start + step) % rows.length
    if (rows[at]?.node.label.toLocaleLowerCase().startsWith(wanted)) return at
  }
  return -1
}

/** The row a pointer event landed in, by its index, or -1 outside a row. */
export function rowIndexOf(target: EventTarget): number {
  if (!(target instanceof Element)) return -1
  return Number(target.closest('[role="treeitem"]')?.getAttribute('data-index') ?? '-1')
}

/** Whether a row lies wholly outside the box the tree shows, as a wheel can leave it; no row never is. */
export function isScrolledOut(row: Element | null, tree: Element): boolean {
  const box = row?.getBoundingClientRect()
  if (!box) return false
  const top = tree.getBoundingClientRect().top + tree.clientTop
  return box.bottom <= top || box.top >= top + tree.clientHeight
}

/** The open ids after a branch opens or closes; the same array when nothing changes. */
export function toggled(expanded: readonly string[], id: string, open: boolean): readonly string[] {
  const has = expanded.includes(id)
  if (open === has) return expanded
  return open ? [...expanded, id] : expanded.filter((one) => one !== id)
}
