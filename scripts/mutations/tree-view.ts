// The mutations of src/components/tree-view. Found by scripts/mutations/index.ts; every label says "tree view".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/tree-view/client.tsx'
const HOOK = 'src/components/tree-view/hook.ts'
const LIB = 'src/components/tree-view/lib.ts'
const CLASSES = 'src/components/tree-view/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the tree view stops swapping ArrowRight and ArrowLeft in RTL',
    file: LIB,
    from: "  const [inward, outward] = direction === 'rtl' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft']",
    to: "  const [inward, outward] = ['ArrowRight', 'ArrowLeft']",
  },
  {
    label: 'the tree view rows lose aria-level',
    file: CLIENT,
    from: '            aria-level={row.level}\n',
    to: '',
  },
  {
    label: 'the tree view loses the root-length guard of loadMore, so opening a branch asks for a page already on its way',
    file: HOOK,
    from: '    if (!loadMore || askedAt.current === items.length) return undefined\n',
    to: '    if (!loadMore) return undefined\n',
  },
  {
    label: 'the tree view names a row that is not mounted in aria-activedescendant',
    file: HOOK,
    from: '    activeDescendant: mounted ? `${base}-${String(mounted.index)}` : undefined,',
    to: '    activeDescendant: active === null ? undefined : `${base}-${String(findRow(rows, active))}`,',
  },
  {
    label: 'the tree view asks for a page before useCollection has read the tree',
    file: HOOK,
    from: '    hasMore: hasMore && counted === rows.length,',
    to: '    hasMore,',
  },
  {
    label: 'the tree view hands loadMoreThreshold to useCollection unclamped',
    file: HOOK,
    from: '    loadMoreThreshold: clamp(props.loadMoreThreshold ?? TREE_VIEW_DEFAULTS.loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax),',
    to: '    loadMoreThreshold: props.loadMoreThreshold ?? TREE_VIEW_DEFAULTS.loadMoreThreshold,',
  },
  {
    label: 'the tree view writes visibleRows unclamped',
    file: HOOK,
    from: '  const rowsCap = props.visibleRows === undefined ? undefined : clamp(props.visibleRows, visibleRowsMin, visibleRowsMax)',
    to: '  const rowsCap = props.visibleRows',
  },
  {
    label: 'the tree view type-ahead never joins letters typed within 500 ms',
    file: HOOK,
    from: '      const text = now - typed.current.at > TYPEAHEAD_MS ? event.key : typed.current.text + event.key',
    to: '      const text = event.key',
  },
  {
    label: 'the tree view focus always highlights the first row, never the selected one',
    file: HOOK,
    from: '    highlight(chosen >= 0 ? chosen : 0)',
    to: '    highlight(0)',
  },
  {
    label: 'the tree view keeps the highlight when the focus leaves',
    file: HOOK,
    from: '    if (event.target === event.currentTarget) setActive(null)',
    to: '',
  },
  {
    label: 'a press selects a disabled tree view row',
    file: HOOK,
    from: '    if (!row || row.node.disabled === true || event.defaultPrevented) return',
    to: '    if (!row || event.defaultPrevented) return',
  },
  {
    label: 'a key on a tree view row that is not mounted no longer brings it in through the window',
    file: HOOK,
    from: '      pending.current = index\n      scrollToIndex(index)\n',
    to: '      pending.current = index\n',
  },
  {
    label: 'the tree view caller onKeyDown no longer runs first',
    file: HOOK,
    from: '    props.onKeyDown?.(event)\n',
    to: '',
  },
  {
    label: 'Enter on a disabled tree view row selects it',
    file: LIB,
    from: "  if (key === 'Enter') return usable ? { type: 'select', index, toggle: row.branch } : null",
    to: "  if (key === 'Enter') return { type: 'select', index, toggle: row.branch }",
  },
  {
    label: 'Enter on a tree view branch no longer opens or closes it',
    file: LIB,
    from: "  if (key === 'Enter') return usable ? { type: 'select', index, toggle: row.branch } : null",
    to: "  if (key === 'Enter') return usable ? { type: 'select', index, toggle: false } : null",
  },
  {
    label: 'ArrowLeft on a tree view child closes nothing and goes nowhere',
    file: LIB,
    from: '  return parent >= 0 ? { type: \'move\', to: parent } : null\n}',
    to: '  return null\n}',
  },
  {
    label: 'the tree view counts positions from zero',
    file: LIB,
    from: 'setSize: frame.nodes.length, posInSet: frame.at, parentId',
    to: 'setSize: frame.nodes.length, posInSet: frame.at - 1, parentId',
  },
  {
    label: 'the tree view type-ahead with one letter stays on the current row',
    file: LIB,
    from: '  const start = query.length === 1 ? from + 1 : Math.max(from, 0)',
    to: '  const start = Math.max(from, 0)',
  },
  {
    label: 'the tree view label loses its own direction',
    file: CLIENT,
    from: '<span dir="auto" className={TREE_VIEW_LABEL}>',
    to: '<span className={TREE_VIEW_LABEL}>',
  },
  {
    label: 'the tree view caret is the same on an open and a closed branch',
    file: CLIENT,
    from: 'icon={row.open ? caretDown : caretRight}',
    to: 'icon={caretRight}',
  },
  {
    label: 'a tree view with no rows is still a tab stop',
    file: HOOK,
    from: '    tabIndex: rows.length > 0 ? 0 : undefined,',
    to: '    tabIndex: 0,',
  },
  {
    label: 'the tree view is never busy',
    file: HOOK,
    from: "    busy: status === 'loading' || status === 'loading-more' ? true : undefined,",
    to: '    busy: undefined,',
  },
  {
    label: 'a tree view row is no longer exactly one unit tall, so the spacers drift from the rows they stand for',
    file: CLASSES,
    from: "'group/row flex h-(--tc-row-height) shrink-0",
    to: "'group/row flex min-h-(--tc-row-height) shrink-0",
  },
  {
    label: 'a tree view row no longer starts one indent further in per level',
    file: CLASSES,
    from: "'pe-2 ps-[calc(0.5rem+var(--tc-tree-level)*var(--tc-tree-indent))]',",
    to: "'pe-2 ps-2',",
  },
  {
    label: 'the tree view loses its start spacer',
    file: CLASSES,
    from: "'before:h-(--tc-list-pad-start) before:shrink-0 ",
    to: "'",
  },
  {
    label: 'the selected tree view row loses Highlight under forced colours',
    file: CLASSES,
    from: ' forced-colors:aria-selected:bg-[Highlight]',
    to: '',
  },
  {
    label: 'the ring on a selected tree view row keeps the token colour under forced colours',
    file: CLASSES,
    from: ' forced-colors:aria-selected:group-focus-visible/tree:data-highlighted:outline-[HighlightText]',
    to: '',
  },
  {
    label: 'the tree view draws its own ring while a row holds the highlight',
    file: CLASSES,
    from: "'focus-visible:not-has-data-highlighted:outline-solid ",
    to: "'focus-visible:outline-solid ",
  },
  {
    label: 'an empty tree view is drawn',
    file: CLASSES,
    from: 'tone-neutral empty:hidden',
    to: 'tone-neutral',
  },
  {
    label: 'the tree view note leaves the page while it is empty, so its first words are not read',
    file: CLASSES,
    from: "text-muted empty:p-0'",
    to: "text-muted empty:hidden'",
  },
  {
    label: 'a press on the tree view is taken for a key, so a press on a row, the padding or the scrollbar scrolls back to the selected row',
    file: HOOK,
    from: '    if (press !== null) {\n      setActive(rows[press]?.node.id ?? null)\n      return\n    }\n',
    to: '',
  },
  {
    label: 'a finger that scrolls the tree view leaves its press behind, so the next Tab highlights the row it started on',
    file: HOOK,
    from: '    props.onPointerCancel?.(event)\n    pressed.current = null\n',
    to: '    props.onPointerCancel?.(event)\n',
  },
  {
    label: 'a mouse that lifts off the tree view with no focus leaves its press behind',
    file: HOOK,
    from: "    if (event.pointerType === 'mouse') pressed.current = null\n",
    to: '',
  },
  {
    label: 'a finger that lifts off the tree view drops its press before the focus it brings, so a tap scrolls to the selected row',
    file: HOOK,
    from: "    if (event.pointerType === 'mouse') pressed.current = null\n",
    to: '    pressed.current = null\n',
  },
  {
    label: 'leaving the tree view keeps a press that brought no focus',
    file: HOOK,
    from: '    pressed.current = null\n    if (event.target === event.currentTarget) setActive(null)\n',
    to: '    if (event.target === event.currentTarget) setActive(null)\n',
  },
]
