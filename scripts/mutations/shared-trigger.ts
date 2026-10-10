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
    label: 'renderTrigger copies a render element it has nothing to change on, so a lazy wrapper is unwrapped and rebuilt on every render',
    file: 'src/shared/render-trigger.ts',
    from: 'if (!own || (className === undefined && !bare)) return { render, className }',
    to: 'if (!own) return { render, className }',
  },
  {
    label: 'renderTrigger stops looking for a children key that holds nothing, so a label left on a trigger is erased by its render element',
    file: 'src/shared/render-trigger.ts',
    from: "const bare = own !== undefined && 'children' in own.props && own.props.children === undefined",
    to: 'const bare = false',
  },
  {
    label: 'renderTrigger takes every render element for one with no children, so a Button loses the label it was written with',
    file: 'src/shared/render-trigger.ts',
    from: ' && own.props.children === undefined',
    to: '',
  },
]
