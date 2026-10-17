// The mutations of src/shared/collection and the two spacer tokens of a windowed list. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared collection sends a row above the view to the bottom edge, so every ArrowUp past the window jumps the row down',
    file: 'src/shared/collection/window.ts',
    from: '  if (rowStart < scrollTop) return within(rowStart)\n',
    to: '',
  },
  {
    label: 'the shared collection leaves a row below the view where it is, so a jump to a row not mounted never shows it',
    file: 'src/shared/collection/window.ts',
    from: '  if (rowStart + rowHeight > scrollTop + viewportHeight) return within(rowStart + rowHeight - viewportHeight)\n',
    to: '',
  },
  {
    label: 'the shared collection moves a row that is already in view to the bottom edge',
    file: 'src/shared/collection/window.ts',
    from: '  return scrollTop\n}',
    to: '  return within(rowStart + rowHeight - viewportHeight)\n}',
  },
  {
    label: 'the shared collection scrolls to a row from the top of the list and not from where the list is',
    file: 'src/shared/collection/use-collection.ts',
    from: 'scrollTop: node.scrollTop - shift,',
    to: 'scrollTop: 0,',
  },
  {
    label: 'the shared collection ignores the padding and scroll padding of the list, so a row below lands cut by the padding',
    file: 'src/shared/collection/use-collection.ts',
    from: 'const edge = edgesOf(node)',
    to: 'const edge = { padding: 0, start: 0, end: 0 }',
  },
  {
    label: 'the shared collection ignores the scroll padding at the bottom, so a row below lands closer to the edge than scrollIntoView puts it',
    file: 'src/shared/collection/use-collection.ts',
    from: 'end: px(style.scrollPaddingBottom)',
    to: 'end: 0',
  },
  {
    label: 'the shared collection spacer token is not declared, so R-4-2 fails the first list that reads it',
    file: 'src/tokens.css',
    from: '  --tc-list-pad-start: 0px;\n',
    to: '',
  },
  {
    label: 'the shared collection spacer token is a bare 0, which a calc() with a length refuses',
    file: 'src/tokens.css',
    from: '  --tc-list-pad-end: 0px;\n',
    to: '  --tc-list-pad-end: 0;\n',
  },
  {
    label: 'the shared collection reads NODE_ENV in bracket form, which no bundler inlines, so a duplicate key throws "process is not defined" in the browser',
    file: 'src/shared/collection/use-collection.ts',
    from: "if (process.env.NODE_ENV !== 'production' && !warnedKeys.current.has(key))",
    to: "if (process.env['NODE_ENV'] !== 'production' && !warnedKeys.current.has(key))",
  },
  {
    label: 'the shared controllable state reads NODE_ENV in bracket form, which no bundler inlines, so a switch to controlled throws in the browser',
    file: 'src/shared/use-controllable-state.ts',
    from: "    if (process.env.NODE_ENV !== 'production') {",
    to: "    if (process.env['NODE_ENV'] !== 'production') {",
  },
  {
    label: 'the shared collection windows an unmeasured list to its overscan alone, so a server-rendered list shows blank rows until hydration',
    file: 'src/shared/collection/use-collection.ts',
    from: '      viewportHeight: viewportHeight > 0 ? viewportHeight : visibleRows * estimateRowHeight,',
    to: '      viewportHeight,',
  },
  {
    label: 'the shared collection pages before it has read the list, so a list longer than its box asks on mount',
    file: 'src/shared/collection/use-collection.ts',
    from: 'const wantsMore = edge.count === count && (virtualized',
    to: 'const wantsMore = (virtualized',
  },
  {
    label: 'the shared collection pages without reading the list a page has grown, so the end it was at asks for one page after another',
    file: 'src/shared/collection/use-collection.ts',
    from: '  }, [container, reach, count])',
    to: '  }, [container, reach])',
  },
  {
    label: 'the shared collection pages by the rows it shows and not by the loaded count it is given',
    file: 'src/shared/collection/use-collection.ts',
    from: 'const loaded = props.loadedCount ?? count',
    to: 'const loaded = count',
  },
]
