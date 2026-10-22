// The mutations of the shared hand: the constant and the three shared strings that wear it.
// Found by scripts/mutations/index.ts; every label says "shared pointer".
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared pointer loses the hand, so every button, tab, option and row shows the arrow',
    file: CLASSES,
    from: 'export const POINTER = `cursor-pointer ${NOT_ALLOWED}',
    to: 'export const POINTER = `${NOT_ALLOWED}',
  },
  {
    label: 'the shared pointer keeps the hand on a disabled control',
    file: CLASSES,
    from: 'cursor-pointer ${NOT_ALLOWED} data-readonly',
    to: 'cursor-pointer data-readonly',
  },
  {
    label: 'the shared pointer keeps the hand on a loading control',
    file: CLASSES,
    from: ' data-loading:cursor-default`',
    to: '`',
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
  {
    label: 'the shared pointer shows the arrow on a disabled control, not not-allowed',
    file: CLASSES,
    from: "export const NOT_ALLOWED = 'disabled:cursor-not-allowed",
    to: "export const NOT_ALLOWED = 'disabled:cursor-default",
  },
  {
    label: 'the shared pointer misses a control marked by aria-disabled alone',
    file: CLASSES,
    from: ' aria-disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
    to: ' data-disabled:cursor-not-allowed',
  },
  {
    label: 'the shared pointer leaves the dimming, so a disabled field shows its own cursor',
    file: CLASSES,
    from: "'data-disabled:opacity-50', NOT_ALLOWED].join",
    to: "'data-disabled:opacity-50'].join",
  },
  {
    label: 'the shared pointer hover paints on a disabled control again',
    file: 'src/styles.css',
    from: '&:hover:not(:where(:disabled, [aria-disabled="true"], [data-disabled]))',
    to: '&:hover',
  },
  {
    label: 'the shared pointer press paints on a disabled control again',
    file: 'src/styles.css',
    from: '&:active:not(:where(:disabled, [aria-disabled="true"], [data-disabled]))',
    to: '&:active',
  },
  {
    label: 'the shared pointer lets a disabled row of a menu take the highlight',
    file: 'src/shared/row-highlight.ts',
    from: '    if (disabled === true) event.preventBaseUIHandler()\n',
    to: '',
  },
]
