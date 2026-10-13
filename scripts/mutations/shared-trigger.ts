// The mutations of src/shared/render-trigger.ts. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'renderTrigger hands the className back after merging it into the element, so Base UI writes the class a second time',
    file: 'src/shared/render-trigger.ts',
    from: 'className: undefined }',
    to: 'className }',
  },
  {
    label: 'renderTrigger copies an element that has no className to take, so a trigger with no class gains an empty class attribute',
    file: 'src/shared/render-trigger.ts',
    from: 'const own = className !== undefined && isValidElement',
    to: 'const own = isValidElement',
  },
]
