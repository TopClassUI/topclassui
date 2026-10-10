// The mutations of src/components/table. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a sorted table puts aria-sort and a caret on every column, so no one of them is named',
    file: 'src/components/table/lib.tsx',
    from: 'sort?.key === key && Object.hasOwn(SORT_ICONS, sort.direction)',
    to: 'sort !== undefined && Object.hasOwn(SORT_ICONS, sort.direction)',
  },
  {
    label: 'the sticky cell of a table loses its own fill, so the columns scrolling under it show through',
    file: 'src/components/table/index.tsx',
    from: '                        sticks(index) && fill,\n',
    to: '',
  },
  {
    label: 'a table writes its role, name and tab stop before the rest, so a caller can make the scrolling box unreachable',
    file: 'src/components/table/index.tsx',
    from: '      {...rest}\n      role="region"\n      aria-labelledby={captionId}\n      aria-label={undefined}\n      tabIndex={shown.length === 0 ? undefined : 0}\n',
    to: '      role="region"\n      aria-labelledby={captionId}\n      aria-label={undefined}\n      tabIndex={shown.length === 0 ? undefined : 0}\n      {...rest}\n',
  },
  {
    label: 'the sort link of a table loses its touch target, so a header is a 16 px line to hit',
    file: 'src/components/table/classes.ts',
    from: ' ${FOCUS_RING} ${TOUCH_TARGET}`',
    to: ' ${FOCUS_RING}`',
  },
  {
    label: 'a table column takes a cell written for any item, so a wrong cell signature compiles',
    file: 'src/components/table/types.ts',
    from: '  cell: (item: T) => ReactNode\n',
    to: '  cell: (item: any) => ReactNode\n',
  },
  {
    label: 'the empty row of a table reads its words from English, whatever labels it was given',
    file: 'src/components/table/index.tsx',
    from: '{emptyFallback ?? labels.state.empty}',
    to: '{emptyFallback ?? en.state.empty}',
  },
  {
    label: 'the box of a table stops containing its sr-only spans, so one in a far column widens the page',
    file: 'src/components/table/classes.ts',
    from: "export const BOX = 'relative isolate grid",
    to: "export const BOX = 'isolate grid",
  },
  {
    label: 'a table inside a flex or grid item widens the page again, because its box stops being a one-column grid',
    file: 'src/components/table/classes.ts',
    from: "'relative isolate grid grid-cols-1 overflow-x-auto",
    to: "'relative isolate overflow-x-auto",
  },
  {
    label: 'a stuck table cell loses its z-index, so a dimmed Button in a later cell is painted over it',
    file: 'src/components/table/classes.ts',
    from: "'sticky inset-s-0 z-(--tc-z-sticky) max-w-",
    to: "'sticky inset-s-0 max-w-",
  },
  {
    label: 'the box of a table keeps no room for its stuck column, so a focused control can lie under it',
    file: 'src/components/table/index.tsx',
    from: 'cn(BOX, BORDER, FOCUS_RING, stickyFirstColumn && STICKY_BOX, className)',
    to: 'cn(BOX, BORDER, FOCUS_RING, className)',
  },
  {
    label: 'a sortable table header takes "Sort by" and the caret back into its name, which is read out with every cell',
    file: 'src/components/table/index.tsx',
    from: 'aria-labelledby={plain ? undefined : headerId}',
    to: 'aria-labelledby={undefined}',
  },
  {
    label: 'a table ignores the link element, so every sort in a Next.js app reloads the document',
    file: 'src/components/table/index.tsx',
    from: "renderLink('Table', link, column.sortHref,",
    to: "renderLink('Table', undefined, column.sortHref,",
  },
  {
    label: 'a table stops importing the style augmentation, so the sticky width of its README does not compile in a program without Progress',
    file: 'src/components/table/index.tsx',
    from: "import type {} from '#shared/style-tokens.js'\n",
    to: '',
  },
]
