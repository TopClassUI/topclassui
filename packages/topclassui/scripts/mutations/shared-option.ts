// The mutations of what Select and Combobox share: the option contract, the collection bounds and the two row
// classes. Found by scripts/mutations/index.ts; every label says "shared option".
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'
const OPTION = 'src/shared/contracts/option.ts'
const COLLECTION = 'src/shared/contracts/collection.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared option row touch floor is emptied, so a row under a finger is 32 px tall, under the 44 px target',
    file: CLASSES,
    from: "export const ROW_TOUCH = 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'",
    to: "export const ROW_TOUCH = ''",
  },
  {
    label: 'the shared option row touch floor loses its pointer query, so every row is 44 px under a mouse too',
    file: CLASSES,
    from: "export const ROW_TOUCH = 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'",
    to: "export const ROW_TOUCH = 'min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'",
  },
  {
    label: 'the shared option row touch floor replaces the row height instead of raising it, so a row at a 32 px root shrinks to 44 px under a finger',
    file: CLASSES,
    from: "export const ROW_TOUCH = 'pointer-coarse:min-h-[max(var(--tc-row-height),var(--tc-target-coarse,44px))]'",
    to: "export const ROW_TOUCH = 'pointer-coarse:min-h-[var(--tc-target-coarse,44px)]'",
  },
  {
    label: 'the shared option selected row is emptied, so the chosen row is told by its tick alone',
    file: CLASSES,
    from: "export const ROW_SELECTED = 'data-selected:bg-primary-soft data-selected:text-primary-on-soft forced-colors:data-selected:not-data-highlighted:bg-transparent'",
    to: "export const ROW_SELECTED = ''",
  },
  {
    label: 'the shared option label turns optional, so an option with no label leaves the trigger blank',
    file: OPTION,
    from: '  label: string',
    to: '  label?: string',
  },
  {
    label: 'the shared option value takes a number, which the form would receive as a different string',
    file: OPTION,
    from: '  value: string',
    to: '  value: string | number',
  },
  {
    label: 'the shared option takes a handler, so a list is no longer plain data a Server Component can pass',
    file: OPTION,
    from: '  disabled?: boolean | undefined\n}',
    to: '  disabled?: boolean | undefined\n  onSelect?: (() => void) | undefined\n}',
  },
  {
    label: 'the shared option collection bound lets visibleRows reach 200, a list taller than any screen',
    file: COLLECTION,
    from: '  visibleRowsMax: 20,',
    to: '  visibleRowsMax: 200,',
  },
  {
    label: 'the shared option collection bound stops loadMoreThreshold at 1, so a caller cannot ask only at the very end',
    file: COLLECTION,
    from: '  loadMoreThresholdMin: 0,',
    to: '  loadMoreThresholdMin: 1,',
  },
]
