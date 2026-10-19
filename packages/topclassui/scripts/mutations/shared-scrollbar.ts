// The mutations of the shared scrollbar: the constant, the two scroll constants that wear it, the two containers
// that wear it by hand, a demo, the page, and the two tokens it reads. Found by scripts/mutations/index.ts; every label says "shared scrollbar".
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'
const TOKENS = 'src/tokens.css'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared scrollbar loses its thin width, so every scroll area draws the classic 15 px bar',
    file: CLASSES,
    from: "export const SCROLLBAR = '[scrollbar-width:thin] [scrollbar-color:",
    to: "export const SCROLLBAR = '[scrollbar-color:",
  },
  {
    label: 'the shared scrollbar loses its colours, so every scroll area draws the browser grey whatever the theme',
    file: CLASSES,
    from: " [scrollbar-color:var(--tc-scrollbar-thumb)_var(--tc-scrollbar-track)]'",
    to: "'",
  },
  {
    label: 'the shared scrollbar is no longer worn by SCROLL_AREA, so dialogs, drawers, menus and lists draw the default bar',
    file: CLASSES,
    from: 'overscroll-contain scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))] ${SCROLLBAR}`',
    to: 'overscroll-contain scroll-py-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]`',
  },
  {
    label: 'the shared scrollbar is no longer worn by SCROLL_X, so tabs, the navbar links and the code block draw the default bar',
    file: CLASSES,
    from: 'overscroll-x-contain ${SCROLLBAR}`',
    to: 'overscroll-x-contain`',
  },
  {
    label: 'the shared scrollbar is dropped from the table box, so a wide table draws the default bar',
    file: 'src/components/table/classes.ts',
    from: 'rounded-box bg-surface-raised ${SCROLLBAR}`',
    to: 'rounded-box bg-surface-raised`',
  },
  {
    label: 'the shared scrollbar is dropped from the textarea, so a long text draws the default bar',
    file: 'src/components/textarea/classes.ts',
    from: 'export const TEXTAREA_BOX = `block ${FIELD_BOX} ${SCROLLBAR}`',
    to: 'export const TEXTAREA_BOX = `block ${FIELD_BOX}`',
  },
  {
    label: 'the page loses the shared scrollbar, so the page itself draws the classic 15 px bar beside every overlay',
    file: TOKENS,
    from: '    scrollbar-width: thin;\n    scrollbar-color: var(--tc-scrollbar-thumb) var(--tc-scrollbar-track);\n',
    to: '',
  },
  {
    label: 'the shared scrollbar is dropped from the sidebar layout demo, so its column draws the default bar',
    file: 'src/components/sidebar/dummy/in-a-layout.tsx',
    from: '<div className={`min-w-0 flex-1 p-4 ${SCROLL_AREA}`}>',
    to: '<div className="min-w-0 flex-1 overflow-y-auto p-4">',
  },
  {
    label: 'the shared scrollbar thumb in light is neutral-300, 1.5:1 on the page, under the 3:1 of R-5.6-4',
    file: TOKENS,
    from: '  --tc-scrollbar-thumb: var(--color-neutral-500);\n',
    to: '  --tc-scrollbar-thumb: var(--color-neutral-300);\n',
  },
  {
    label: 'the shared scrollbar thumb in dark is neutral-700, under 3:1 on the dark page',
    file: TOKENS,
    from: '  --tc-scrollbar-thumb: var(--color-neutral-400);\n',
    to: '  --tc-scrollbar-thumb: var(--color-neutral-700);\n',
  },
  {
    label: 'the shared scrollbar track in light is the thumb colour, so the thumb cannot be told from its track',
    file: TOKENS,
    from: '  --tc-scrollbar-thumb: var(--color-neutral-500);\n  --tc-scrollbar-track: transparent;\n',
    to: '  --tc-scrollbar-thumb: var(--color-neutral-500);\n  --tc-scrollbar-track: var(--color-neutral-500);\n',
  },
  {
    label: 'the shared scrollbar track in dark is the thumb colour, so the thumb cannot be told from its track',
    file: TOKENS,
    from: '  --tc-scrollbar-thumb: var(--color-neutral-400);\n  --tc-scrollbar-track: transparent;\n',
    to: '  --tc-scrollbar-thumb: var(--color-neutral-400);\n  --tc-scrollbar-track: var(--color-neutral-400);\n',
  },
]
