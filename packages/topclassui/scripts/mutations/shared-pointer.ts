// The mutations of the shared hand: the constant and the three shared strings that wear it.
// Found by scripts/mutations/index.ts; every label says "shared pointer".
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared pointer loses the hand, so every button, tab, option and row shows the arrow',
    file: CLASSES,
    from: "export const POINTER = 'cursor-pointer disabled:cursor-default",
    to: "export const POINTER = 'disabled:cursor-default",
  },
  {
    label: 'the shared pointer keeps the hand on a disabled control',
    file: CLASSES,
    from: " disabled:cursor-default aria-disabled:cursor-default",
    to: " aria-disabled:cursor-default",
  },
  {
    label: 'the shared pointer keeps the hand on a loading control',
    file: CLASSES,
    from: " data-loading:cursor-default'",
    to: "'",
  },
  {
    label: 'the shared pointer leaves the row of a menu or a list',
    file: CLASSES,
    from: 'text-start text-sm outline-none ${POINTER}`',
    to: 'text-start text-sm outline-none`',
  },
  {
    label: 'the shared pointer leaves the icon button',
    file: CLASSES,
    from: '${FOCUS_RING} ${TRANSITION} ${POINTER}`',
    to: '${FOCUS_RING} ${TRANSITION}`',
  },
  {
    label: 'the shared pointer leaves the target of a toggle',
    file: CLASSES,
    from: 'w-fit shrink-0 ${POINTER} items-center',
    to: 'w-fit shrink-0 items-center',
  },
]
