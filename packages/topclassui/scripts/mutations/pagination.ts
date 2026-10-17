// The mutations of src/components/pagination. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the pagination value loses its clamp, so page 99 of 12 builds links to pages that do not exist',
    file: 'src/components/pagination/lib.ts',
    from: 'return Math.floor(bound(value, PAGINATION_BOUNDARIES.pageMin, clampPageCount(pageCount)))',
    to: 'return Math.floor(value)',
  },
  {
    label: 'the pagination siblingCount loses its clamp, so a count of 50 renders a row of 105 cells',
    file: 'src/components/pagination/lib.ts',
    from: 'bound(siblingCount, PAGINATION_BOUNDARIES.siblingCountMin, PAGINATION_BOUNDARIES.siblingCountMax),',
    to: 'siblingCount,',
  },
  {
    label: 'the pagination boundaryCount loses its clamp, so a count of 50 lists a hundred pages at the ends',
    file: 'src/components/pagination/lib.ts',
    from: 'bound(boundaryCount, PAGINATION_BOUNDARIES.boundaryCountMin, PAGINATION_BOUNDARIES.boundaryCountMax),',
    to: 'boundaryCount,',
  },
  {
    label: 'the pagination previous control stays a link on page 1, a dead link to page 0',
    file: 'src/components/pagination/index.tsx',
    from: "{control(page - 1, text.previous, caretLeft, page === 1, 'prev')}",
    to: "{control(page - 1, text.previous, caretLeft, false, 'prev')}",
  },
  {
    label: 'a pagination cell loses its touch target, so a page link can fall under 24 px',
    file: 'src/components/pagination/variants.ts',
    from: '[CELL, DISABLED, FOCUS_RING, TOUCH_TARGET, TRANSITION],',
    to: '[CELL, DISABLED, FOCUS_RING, TRANSITION],',
  },
  {
    label: 'a pagination gap is no longer hidden, so a screen reader announces three dots as a list item',
    file: 'src/components/pagination/index.tsx',
    from: '<li key={item} aria-hidden="true" className={cn(CELL_GAP, CELL_SIZE[size])}>',
    to: '<li key={item} className={cn(CELL_GAP, CELL_SIZE[size])}>',
  },
  {
    label: 'a pagination cell goes back to a fixed square, so page 12,345 runs out of its box and reads 2,345',
    file: 'src/components/pagination/classes.ts',
    from: "  md: 'h-control-md aspect-square min-w-auto pointer-coarse:min-w-auto px-1 text-sm',",
    to: "  md: 'size-control-md text-sm',",
  },
  {
    label: 'a pagination ignores the link element, so every page change in a Next.js app reloads the document',
    file: 'src/components/pagination/index.tsx',
    from: "renderLink('Pagination', link, getHref(target),",
    to: "renderLink('Pagination', undefined, getHref(target),",
  },
  {
    label: 'a pagination string from a JavaScript caller reaches Math.max, so NaN is printed in a link',
    file: 'src/components/pagination/lib.ts',
    from: 'clamp(Number(given), min, max)',
    to: 'clamp(given as number, min, max)',
  },
  {
    label: 'the pagination file stops exporting clampPage, so the README names a helper no caller can import',
    file: 'src/components/pagination/index.tsx',
    from: "export { clampPage } from './lib.js'\n",
    to: '',
  },
  {
    label: 'the pagination current page loses the system pair, so it is a bare digit with no box in forced colours',
    file: 'src/components/pagination/classes.ts',
    from: ' ${CELL_CURRENT_FORCED}`',
    to: '`',
  },
  {
    label: 'the pagination current page stays adjusted, so a backplate hides its digit in forced colours',
    file: 'src/components/pagination/classes.ts',
    from: "  'forced-colors:forced-color-adjust-none',\n",
    to: '',
  },
  {
    label: 'the pagination current page keeps the ring of its theme, 2.4:1 on a black canvas in forced colours',
    file: 'src/components/pagination/classes.ts',
    from: "  'forced-colors:[--tc-ring:Highlight]',\n",
    to: '',
  },
  {
    label: 'the pagination current page takes the hover fill of its theme under a pointer in forced colours',
    file: 'src/components/pagination/classes.ts',
    from: "  'forced-colors:hover:bg-[Highlight]',\n",
    to: '',
  },
]
