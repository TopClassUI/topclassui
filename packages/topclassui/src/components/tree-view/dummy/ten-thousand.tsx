import { TreeView } from '../index.js'

/** Ten folders of a thousand files, all open: 10,010 visible rows, built once at module scope so the array is stable. */
const items = Array.from({ length: 10 }, (_, folder) => ({
  id: `f${String(folder + 1)}`,
  label: `Folder ${String(folder + 1)}`,
  children: Array.from({ length: 1000 }, (__, file) => ({
    id: `f${String(folder + 1)}-${String(file + 1)}`,
    label: `File ${String(folder * 1000 + file + 1)}.ts`,
  })),
}))

const open = items.map((node) => node.id)

/** Windowed: a few dozen rows are mounted whatever the scroll, and the keys still reach every one of them. */
export default function Demo() {
  return <TreeView aria-label="Ten thousand files" items={items} defaultExpanded={open} visibleRows={12} />
}
