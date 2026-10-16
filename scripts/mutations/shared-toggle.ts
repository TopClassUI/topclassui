// The mutations of the classes the toggles share: Switch, Checkbox and the radio of a RadioGroup. Found by
// scripts/mutations/index.ts; every label says "shared toggle".
import type { Mutation } from '../lib/mutate.js'

const CLASSES = 'src/shared/classes.ts'

const RING = "'group-focus-visible/toggle:outline-solid group-focus-visible/toggle:outline-(length:--tc-ring-width) group-focus-visible/toggle:outline-offset-(length:--tc-ring-offset) group-focus-visible/toggle:outline-ring'"

export const MUTATIONS: Mutation[] = [
  {
    label: 'the shared toggle target loses the touch floor, so a 14 px checkbox is a 14 px target, under a finger too',
    file: CLASSES,
    from: ' outline-none ${TOUCH_TARGET} ${DISABLED}`',
    to: ' outline-none ${DISABLED}`',
  },
  {
    label: 'the shared toggle target loses w-fit, so a switch laid straight into a grid fills the track, 1217 px wide at 1280',
    file: CLASSES,
    from: 'group/toggle relative inline-flex w-fit shrink-0',
    to: 'group/toggle relative inline-flex shrink-0',
  },
  {
    label: 'the shared toggle ring moves back to the target, so on a phone it rings 44 px around a 20 px box',
    file: CLASSES,
    from: `justify-center outline-none \${TOUCH_TARGET} \${DISABLED}\`\n\n/** The ring of a focused target, drawn on the box inside it. The group is named: a bare one would match an accordion trigger around it. */\nexport const TOGGLE_RING = ${RING}`,
    to: `justify-center \${FOCUS_RING} \${TOUCH_TARGET} \${DISABLED}\`\n\n/** The ring of a focused target, drawn on the box inside it. The group is named: a bare one would match an accordion trigger around it. */\nexport const TOGGLE_RING = ''`,
  },
  {
    label: 'the shared toggle loses the compound invalid class, so a checked box that is invalid keeps the primary line',
    file: CLASSES,
    from: ' group-aria-invalid/toggle:group-data-checked/toggle:border-danger-solid',
    to: '',
  },
  {
    label: 'the shared toggle ring loses its forced-colours CanvasText, so a ticked box rings in the author violet at 2.85:1 on Canvas',
    file: CLASSES,
    from: ' forced-colors:group-focus-visible/toggle:outline-[CanvasText]',
    to: '',
  },
]
