import { TreeView } from '../index.js'

const WORD = 'Supercalifragilistic'.repeat(15)

/** Ten levels deep, each folder the only child of the one above. */
function nest(depth: number): { id: string, label: string, children?: { id: string, label: string }[] } {
  const id = `level-${String(depth)}`
  if (depth === 10) return { id, label: `Level ${String(depth)}, ${WORD}` }
  return { id, label: `Level ${String(depth)}`, children: [nest(depth + 1)] }
}

const sixty = Array.from({ length: 60 }, (_, index) => ({ id: `item-${String(index + 1)}`, label: `Item ${String(index + 1)}` }))

const items = [
  { id: 'word', label: WORD },
  { id: 'mixed', label: 'تقرير report 2026 النهائي final version with a long name that goes on' },
  nest(1),
  { id: 'sixty', label: 'Sixty items', children: sixty },
]

const open = ['sixty', ...Array.from({ length: 9 }, (_, index) => `level-${String(index + 1)}`)]

/** Every hostile case: a 300-character word, mixed directions, ten levels deep and sixty siblings. Nothing widens the page. */
export default function Demo() {
  return <TreeView aria-label="Every hostile case" items={items} defaultExpanded={open} defaultValue="word" />
}
